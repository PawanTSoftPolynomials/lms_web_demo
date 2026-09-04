"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";

import Button from "@/components/ui/Button";
import usePedagogicalDecision from "@/hooks/queries/student/usePedagogicalDecision";
import useAdaptiveResponse from "@/hooks/queries/student/useAdaptiveResponse";
import useAdaptiveResponseStream from "@/hooks/queries/student/useAdaptiveResponseStream";
import useGenerateVerificationQuestion from "@/hooks/queries/student/useGenerateVerificationQuestion";
import useEvaluateVerificationAnswer from "@/hooks/queries/student/useEvaluateVerificationAnswer";
import AdaptiveQuestionCard from "@/components/student/AdaptiveQuestionCard";
import AdaptiveTutorMessage from "@/components/student/AdaptiveTutorMessage";
import JourneyProgress from "@/components/student/JourneyProgress";
import { getStrategyCopy, getContinueLabel } from "@/components/student/adaptiveCopy";

// The two decision-engine strategies that mean "explain the concept again,
// then check understanding" — whether this is the student's first pass at a
// KC or a follow-up round after a wrong Quick Check.
const isRemediationStrategyName = (strategyName) =>
  strategyName === "MISCONCEPTION_REMEDIATION" || strategyName === "CONCEPT_REMEDIATION";

// One card = one independent remediation chain for ONE incorrect question.
// The parent (result/[quizId]/page.jsx) renders exactly one of these at a
// time — the active item in its incorrect-questions queue — and advances to
// the next one only when this card calls onComplete(). This component never
// scans quiz.questions itself and knows nothing about the queue; it just
// resolves its own single question and reports back when it's done.
export default function AdaptiveRemediationCard({ quiz, question, onComplete }) {
  const inProgressKeyRef = useRef("");
  const completedKeyRef = useRef("");
  const abortControllerRef = useRef(null);
  // Guards against firing onComplete twice for the same mount (e.g. a
  // double-click on a continue button) — the queue must advance exactly once
  // per resolved question.
  const hasFiredCompleteRef = useRef(false);

  // Never reset except by a genuine requestKey change (new answer/retake) —
  // bounds the adaptive loop to "max 1 verification question per remediation cycle"
  const verificationRequestKeyRef = useRef("");

  // Same never-resets-except-forward guard for the independent-practice round
  const practiceRequestKeyRef = useRef("");

  const [decision, setDecision] = useState(null);
  const [adaptiveData, setAdaptiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // "idle" | "loading" | "ready" | "submitting" | "result" | "generation_error" | "evaluation_error"
  const [verificationPhase, setVerificationPhase] = useState("idle");
  const [verificationQuestion, setVerificationQuestion] = useState(null);
  const [selectedVerificationAnswer, setSelectedVerificationAnswer] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const [hasContinuedFromRemediation, setHasContinuedFromRemediation] = useState(false);

  // Which remediation round is currently showing (0 = the very first
  // explanation). Incremented each time a Quick Check comes back wrong (or
  // correct-but-still-remediation) and the tutor moves on to a fresh
  // explanation for the same KC — see beginNewRound(). Purely a UI/orchestration
  // concern: it scopes the "max 1 verification question" guard per round and
  // drives the journey progress bar back to "Understand" for the new round.
  const [roundId, setRoundId] = useState(0);

  // Gates the auto-generated practice question so it only appears after the
  // student explicitly acts on the Quick Check result, instead of popping in
  // the instant the result arrives.
  const [nextActionStarted, setNextActionStarted] = useState(false);

  // Independent-practice round
  const [practicePhase, setPracticePhase] = useState("idle");
  const [practiceQuestion, setPracticeQuestion] = useState(null);
  const [selectedPracticeAnswer, setSelectedPracticeAnswer] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);

  const decisionMutation = usePedagogicalDecision();
  const adaptiveMutation = useAdaptiveResponse();
  const streamMutation = useAdaptiveResponseStream();
  const generateVerificationMutation = useGenerateVerificationQuestion();
  const evaluateVerificationMutation = useEvaluateVerificationAnswer();

  const generateGuidance = async (payload) => {
    setStreamedText("");
    setIsStreamingActive(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      return await streamMutation.mutateAsync({
        data: payload,
        onChunk: (content) => {
          setStreamedText((prev) => prev + content);
        },
        signal: controller.signal,
      });
    } catch (streamError) {
      if (controller.signal.aborted) {
        return null;
      }

      console.error("Streaming adaptive response failed, falling back to non-streaming:", streamError);
      setStreamedText("");
      return adaptiveMutation.mutateAsync(payload);
    } finally {
      setIsStreamingActive(false);
    }
  };

  // 1. Derive dynamic context from the single incorrect question this card owns
  const targetIncorrectItem = useMemo(() => {
    if (!question) return null;

    return {
      questionId: question.id,
      question: question.question,
      studentAns: String(question.studentAnswer),
      message: `The student answered "${question.studentAnswer}" for question "${question.question}". Provide remediation for the detected misconception.`,
    };
  }, [question]);

  // 2. Authoritative Knowledge Component (KC) resolution based on this card's question
  const targetKc = useMemo(() => {
    if (!question) return null;

    if (question.topic && question.topic.trim()) {
      return question.topic.trim();
    }

    return `question:${question.id}`;
  }, [question]);

  // 3. Orchestration identity — answer-aware.
  const normalizedStudentAnswer = useMemo(
    () => String(targetIncorrectItem?.studentAns ?? "").trim(),
    [targetIncorrectItem?.studentAns]
  );

  const requestKey = useMemo(
    () => `${quiz?.id}_${targetKc}_${normalizedStudentAnswer}`,
    [quiz?.id, targetKc, normalizedStudentAnswer]
  );

  // requestKey identifies the original wrong answer being remediated; it
  // doesn't change across remediation rounds (round 2's CONCEPT_REMEDIATION
  // is still remediating the SAME wrong answer as round 1's
  // MISCONCEPTION_REMEDIATION). roundKey adds the round number so each round
  // gets its own "max 1 verification question" allowance.
  const roundKey = `${requestKey}::${roundId}`;

  // Trigger Decision -> Adaptive Response flow
  useEffect(() => {
    let cancelled = false;

    if (!targetKc || !quiz?.id) {
      return;
    }

    if (completedKeyRef.current === requestKey || inProgressKeyRef.current === requestKey) {
      return;
    }

    inProgressKeyRef.current = requestKey;

    const targetQuestionId = targetIncorrectItem?.questionId || null;

    async function runOrchestration() {
      setIsLoading(true);
      setHasError(false);

      try {
        // Step 1: Decision Engine Call
        const decisionPayload = {
          kc: targetKc,
          hasNextTarget: true,
        };

        const decResult = await decisionMutation.mutateAsync(decisionPayload);

        if (cancelled) return;

        setDecision(decResult);

        // Step 2: Gated LLM Response Call (for MISCONCEPTION_REMEDIATION or CONCEPT_REMEDIATION)
        if (
          decResult?.strategy === "MISCONCEPTION_REMEDIATION" ||
          decResult?.strategy === "CONCEPT_REMEDIATION"
        ) {
          const messageText =
            targetIncorrectItem?.message ||
            `Personalized concept learning remediation requested for KC ${targetKc}`;

          const payload = {
            kc: targetKc,
            message: messageText,
            hasNextTarget: true,
          };

          if (quiz?.id && targetQuestionId) {
            payload.quizId = quiz.id;
            payload.questionId = targetQuestionId;
          }

          if (quiz?.courseId) {
            payload.courseId = quiz.courseId;
          }

          setIsLoading(false);

          const adaptResult = await generateGuidance(payload);

          if (cancelled) return;

          if (adaptResult) {
            setAdaptiveData(adaptResult);
          }
        }

        completedKeyRef.current = requestKey;
      } catch (error) {
        console.error("Adaptive remediation orchestration error:", error);
        inProgressKeyRef.current = "";
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    runOrchestration();

    return () => {
      cancelled = true;

      if (completedKeyRef.current !== requestKey) {
        inProgressKeyRef.current = "";
      }
      abortControllerRef.current?.abort();
    };
  }, [
    requestKey,
    normalizedStudentAnswer,
    quiz?.courseId,
    targetIncorrectItem?.questionId
  ]);

  const buildVerificationPayload = () => {
    const payload = { kc: targetKc };

    if (quiz?.id && targetIncorrectItem?.questionId) {
      payload.quizId = quiz.id;
      payload.questionId = targetIncorrectItem.questionId;
    }
    if (quiz?.courseId) {
      payload.courseId = quiz.courseId;
    }
    if (decision?.misconception?.hypothesis) {
      payload.misconception = decision.misconception.hypothesis;
    }
    if (decision?.strategy === "CONCEPT_REMEDIATION") {
      payload.purpose = "CONCEPT_REMEDIATION_CHECK";
    } else if (decision?.strategy === "MISCONCEPTION_REMEDIATION") {
      payload.purpose = "REMEDIATION_CHECK";
    }

    return payload;
  };

  // Closes the adaptive loop for MISCONCEPTION_REMEDIATION or CONCEPT_REMEDIATION
  useEffect(() => {
    if (!adaptiveData?.response) return; // remediation not complete yet
    if (
      decision?.strategy !== "MISCONCEPTION_REMEDIATION" &&
      decision?.strategy !== "CONCEPT_REMEDIATION"
    ) {
      return;
    }
    if (verificationRequestKeyRef.current === roundKey) return; // max 1 per remediation round

    verificationRequestKeyRef.current = roundKey;

    let cancelled = false;

    async function generateCheck() {
      setVerificationPhase("loading");
      try {
        const q = await generateVerificationMutation.mutateAsync(buildVerificationPayload());
        if (cancelled) return;
        setVerificationQuestion(q);
        setSelectedVerificationAnswer(null);
        setVerificationResult(null);
        setVerificationPhase("ready");
      } catch (error) {
        if (cancelled) return;
        console.error("Verification question generation failed:", error);
        setVerificationPhase("generation_error");
      }
    }

    generateCheck();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adaptiveData?.response, decision?.strategy, roundKey]);

  const retryVerificationGeneration = () => {
    setVerificationPhase("loading");
    generateVerificationMutation
      .mutateAsync(buildVerificationPayload())
      .then((q) => {
        setVerificationQuestion(q);
        setSelectedVerificationAnswer(null);
        setVerificationResult(null);
        setVerificationPhase("ready");
      })
      .catch((error) => {
        console.error("Verification question retry failed:", error);
        setVerificationPhase("generation_error");
      });
  };

  const submitVerificationAnswer = () => {
    if (!selectedVerificationAnswer || !verificationQuestion?.verificationToken) return;

    setVerificationPhase("submitting");
    evaluateVerificationMutation
      .mutateAsync({
        verificationToken: verificationQuestion.verificationToken,
        selectedAnswer: selectedVerificationAnswer,
      })
      .then((result) => {
        setVerificationResult(result);
        setVerificationPhase("result");
      })
      .catch((error) => {
        console.error("Verification answer evaluation failed:", error);
        setVerificationPhase("evaluation_error");
      });
  };

  // INDEPENDENT_PRACTICE trigger
  const practiceTrigger = useMemo(() => {
    if (decision?.strategy === "INDEPENDENT_PRACTICE") {
      return `initial_${requestKey}`;
    }
    if (verificationResult?.nextDecision?.strategy === "INDEPENDENT_PRACTICE") {
      return `postverify_${requestKey}`;
    }
    return null;
  }, [decision?.strategy, verificationResult?.nextDecision?.strategy, requestKey]);

  useEffect(() => {
    if (!practiceTrigger) return;
    if (practiceRequestKeyRef.current === practiceTrigger) return;

    practiceRequestKeyRef.current = practiceTrigger;

    let cancelled = false;

    async function generatePractice() {
      setPracticePhase("loading");
      try {
        const q = await generateVerificationMutation.mutateAsync(buildVerificationPayload());
        if (cancelled) return;
        setPracticeQuestion(q);
        setSelectedPracticeAnswer(null);
        setPracticeResult(null);
        setPracticePhase("ready");
      } catch (error) {
        if (cancelled) return;
        console.error("Practice question generation failed:", error);
        setPracticePhase("generation_error");
      }
    }

    generatePractice();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceTrigger]);

  const retryPracticeGeneration = () => {
    setPracticePhase("loading");
    generateVerificationMutation
      .mutateAsync(buildVerificationPayload())
      .then((q) => {
        setPracticeQuestion(q);
        setSelectedPracticeAnswer(null);
        setPracticeResult(null);
        setPracticePhase("ready");
      })
      .catch((error) => {
        console.error("Practice question retry failed:", error);
        setPracticePhase("generation_error");
      });
  };

  const submitPracticeAnswer = () => {
    if (!selectedPracticeAnswer || !practiceQuestion?.verificationToken) return;

    setPracticePhase("submitting");
    evaluateVerificationMutation
      .mutateAsync({
        verificationToken: practiceQuestion.verificationToken,
        selectedAnswer: selectedPracticeAnswer,
      })
      .then((result) => {
        setPracticeResult(result);
        setPracticePhase("result");
      })
      .catch((error) => {
        console.error("Practice answer evaluation failed:", error);
        setPracticePhase("evaluation_error");
      });
  };

  // Continues the SAME tutor interaction into another remediation round —
  // e.g. a wrong Quick Check whose nextDecision is CONCEPT_REMEDIATION. Reuses
  // the decision the backend already returned (evaluateVerificationAnswer's
  // nextDecision); no extra decision-engine call. Resets round-scoped state
  // and re-runs the existing streaming guidance call for the new decision —
  // the same mechanism the initial orchestration effect uses, just triggered
  // by user action instead of by the requestKey effect.
  const beginNewRound = async (nextDecision) => {
    if (!nextDecision) return;

    abortControllerRef.current?.abort();

    setDecision(nextDecision);
    setAdaptiveData(null);
    setStreamedText("");
    setHasContinuedFromRemediation(false);
    setVerificationPhase("idle");
    setVerificationQuestion(null);
    setSelectedVerificationAnswer(null);
    setVerificationResult(null);
    setNextActionStarted(false);
    setHasError(false);
    setRoundId((id) => id + 1);

    const targetQuestionId = targetIncorrectItem?.questionId || null;
    const payload = {
      kc: targetKc,
      message:
        "The student is still working through this concept after a follow-up check. Provide a fresh explanation using a different approach or example.",
      hasNextTarget: true,
    };

    if (quiz?.id && targetQuestionId) {
      payload.quizId = quiz.id;
      payload.questionId = targetQuestionId;
    }
    if (quiz?.courseId) {
      payload.courseId = quiz.courseId;
    }

    try {
      const adaptResult = await generateGuidance(payload);
      if (adaptResult) setAdaptiveData(adaptResult);
    } catch (error) {
      console.error("Next remediation round failed:", error);
      setHasError(true);
    }
  };

  // Reports "this item's remediation is resolved" to the parent exactly
  // once. Only ever called from a user-driven continue action AFTER the
  // existing decision/verification logic has already determined the
  // strategy is no longer MISCONCEPTION_REMEDIATION/CONCEPT_REMEDIATION —
  // never on explanation load, verification start, or answer submission.
  const fireComplete = () => {
    if (hasFiredCompleteRef.current) return;
    hasFiredCompleteRef.current = true;
    onComplete?.();
  };

  // Primary CTA on the Quick Check result. What it does is entirely driven
  // by the decision engine's nextDecision — this function only decides HOW
  // to present that: loop back into another explanation, reveal the practice
  // question, or report this item as resolved to the parent queue.
  const handleResultContinue = () => {
    const nextStrategy = verificationResult?.nextDecision?.strategy;

    if (isRemediationStrategyName(nextStrategy)) {
      beginNewRound(verificationResult.nextDecision);
      return;
    }

    setNextActionStarted(true);

    // ADVANCE means there's no follow-up practice question to show — this
    // item is fully resolved. INDEPENDENT_PRACTICE still has a practice
    // question to show first; that question's own Continue button reports
    // completion once the student has engaged with it.
    if (nextStrategy === "ADVANCE") {
      fireComplete();
    }
  };

  if (!targetKc) {
    return null;
  }

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-background/40 p-5">
        <p className="text-[10px] text-primary/90 font-bold uppercase tracking-wider mb-2">Let&apos;s clear this up</p>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <p className="text-sm text-foreground">Looking at your answer...</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Finding the best explanation for this concept.</p>
      </div>
    );
  }

  // 2. Error state
  if (hasError) {
    return (
      <div className="rounded-2xl border border-border bg-background/30 p-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          Your personalized guidance couldn&apos;t be loaded.
        </p>
        <button
          type="button"
          onClick={() => {
            // Round 2+: we already have the decision driving this round
            // (evaluateVerificationAnswer's nextDecision, stored in
            // `decision`) — just retry the explanation call, don't restart
            // the whole cycle from the original decision.
            if (roundId > 0) {
              setHasError(false);
              beginNewRound(decision);
              return;
            }

            inProgressKeyRef.current = "";
            completedKeyRef.current = "";
            setDecision(null);
            setAdaptiveData(null);
            setHasError(false);
            setIsLoading(true);
            setStreamedText("");
            setIsStreamingActive(false);

            const targetQuestionId = targetIncorrectItem?.questionId || null;
            const messageText =
              targetIncorrectItem?.message ||
              `Personalized concept learning remediation requested for KC ${targetKc}`;

            const payload = {
              kc: targetKc,
              message: messageText,
              hasNextTarget: true,
            };

            if (quiz?.id && targetQuestionId) {
              payload.quizId = quiz.id;
              payload.questionId = targetQuestionId;
            }

            if (quiz?.courseId) {
              payload.courseId = quiz.courseId;
            }

            decisionMutation
              .mutateAsync({ kc: targetKc, hasNextTarget: true })
              .then((decResult) => {
                setDecision(decResult);
                if (
                  decResult?.strategy === "MISCONCEPTION_REMEDIATION" ||
                  decResult?.strategy === "CONCEPT_REMEDIATION"
                ) {
                  setIsLoading(false);
                  return generateGuidance(payload);
                }
              })
              .then((adaptResult) => {
                if (adaptResult) setAdaptiveData(adaptResult);
                completedKeyRef.current = requestKey;
              })
              .catch((err) => {
                console.error("Retry failed:", err);
                setHasError(true);
              })
              .finally(() => setIsLoading(false));
          }}
          className="inline-flex items-center gap-1 text-primary hover:text-orange-300 font-semibold cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 rounded"
        >
          <RefreshCw size={12} />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  const strategy = decision.strategy || "CONCEPT_REMEDIATION";
  const isRemediationStrategy = isRemediationStrategyName(strategy);

  // Explicit presentation-stage machine (see task spec section 7): purely a
  // display concern derived from existing orchestration state. The backend
  // decision (`decision.strategy` / `verificationResult.nextDecision`) still
  // decides WHAT happens next; this only decides HOW the current moment is
  // shown. Four stages: understanding -> checking -> evaluating -> next.
  // "evaluating" and "next" both map to the same "Next" dot on the compact
  // 3-stage journey bar (there's no visible difference — evaluating is the
  // brief moment right after the check, before the student acts on it) but
  // are kept distinct here since they're genuinely different moments.
  let presentationStage = "understanding";
  if (isRemediationStrategy) {
    if (!hasContinuedFromRemediation) {
      presentationStage = "understanding";
    } else if (verificationPhase === "result") {
      presentationStage = nextActionStarted ? "next" : "evaluating";
    } else {
      presentationStage = "checking";
    }
  }

  // Compact journey progress — fixed 3-stage bar (Understand/Check/Next) for
  // the remediation loop. "Practice" only gets its own dot when the student
  // was routed straight to independent practice WITHOUT going through
  // remediation first; reached via the remediation loop, practice is just
  // part of "Next".
  const journeyStages = [];
  if (isRemediationStrategy) {
    journeyStages.push(
      { key: "understand", label: "Understand" },
      { key: "check", label: "Check" }
    );
  } else if (practiceTrigger || practicePhase !== "idle") {
    journeyStages.push({ key: "practice", label: "Practice" });
  }
  if (journeyStages.length > 0) {
    journeyStages.push({ key: "next", label: "Next" });
  }

  const STAGE_TO_JOURNEY_KEY = {
    understanding: "understand",
    checking: "check",
    evaluating: "next",
    next: "next",
  };

  let journeyActiveKey = "next";
  if (isRemediationStrategy) {
    journeyActiveKey = STAGE_TO_JOURNEY_KEY[presentationStage] || "understand";
  } else if (practicePhase !== "idle" && practicePhase !== "result") {
    journeyActiveKey = "practice";
  } else if (practicePhase === "result") {
    journeyActiveKey = "next";
  }

  const journeyActiveIndex = journeyStages.findIndex((s) => s.key === journeyActiveKey);
  const journeyDoneKeys = journeyActiveIndex > 0 ? journeyStages.slice(0, journeyActiveIndex).map((s) => s.key) : [];

  const journeyBar = journeyStages.length > 0 && (
    <JourneyProgress stages={journeyStages} activeKey={journeyActiveKey} doneKeys={journeyDoneKeys} />
  );

  const isAdvanceStrategy =
    strategy === "ADVANCE" || verificationResult?.nextDecision?.strategy === "ADVANCE";

  // 3. MISCONCEPTION_REMEDIATION or CONCEPT_REMEDIATION — tutor explanation, then Quick Check.
  // Everything below is ONE continuous tutor interaction: explanation -> Continue ->
  // question -> result -> next action, all in the same place rather than a
  // stack of disconnected status boxes. A wrong (or correct-but-still-remediation)
  // result loops back into a fresh explanation via beginNewRound() instead of
  // dead-ending in a static "what's next" summary.
  if (isRemediationStrategy && (adaptiveData?.response || isStreamingActive)) {
    const resultStrategy = verificationResult?.nextDecision?.strategy;
    const resultContinueLabel = verificationResult
      ? verificationResult.isCorrect
        ? getContinueLabel(resultStrategy)
        : "Continue"
      : undefined;
    const resultCorrectFeedback = "Exactly. You recognized the key idea. You're ready for the next step.";
    const resultIncorrectFeedback = "That's a common mix-up. Let's try that idea from another angle.";

    return (
      <div className="space-y-3">
        {journeyBar}

        <div className="rounded-2xl border border-border bg-background/40 p-5 sm:p-6">
          <p className="text-[10px] text-primary/90 font-bold uppercase tracking-wider mb-3">Let&apos;s clear this up</p>

          <div aria-live="polite" aria-atomic="false">
            {adaptiveData?.response ? (
              <AdaptiveTutorMessage text={adaptiveData.response} />
            ) : streamedText ? (
              <>
                <AdaptiveTutorMessage text={streamedText} />
                {isStreamingActive && (
                  <span
                    className="inline-block w-1.5 h-4 -mb-0.5 ml-0.5 bg-orange-400 animate-pulse motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Preparing your explanation...
              </div>
            )}
          </div>

          {adaptiveData?.response && !hasContinuedFromRemediation && (
            <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Let&apos;s check your understanding.</p>
              <button
                type="button"
                onClick={() => setHasContinuedFromRemediation(true)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-orange-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 rounded"
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {adaptiveData?.response && hasContinuedFromRemediation && verificationPhase !== "idle" && (
          <AdaptiveQuestionCard
            phase={verificationPhase}
            kicker="Quick Check"
            intro="Let's see if the idea clicked."
            loadingMessage="Preparing a quick check..."
            question={verificationQuestion}
            selectedAnswer={selectedVerificationAnswer}
            onSelectAnswer={setSelectedVerificationAnswer}
            onSubmit={submitVerificationAnswer}
            onRetryGeneration={retryVerificationGeneration}
            result={verificationResult}
            correctFeedback={resultCorrectFeedback}
            incorrectFeedback={resultIncorrectFeedback}
            onContinue={verificationResult && !nextActionStarted ? handleResultContinue : undefined}
            continueLabel={resultContinueLabel}
          />
        )}

        {nextActionStarted && isAdvanceStrategy && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            Moving on...
          </p>
        )}

        {nextActionStarted && practiceTrigger && !isAdvanceStrategy && (
          <AdaptiveQuestionCard
            phase={practicePhase}
            kicker="Practice"
            intro="You've got the idea. Let's apply it."
            loadingMessage="Finding a practice question..."
            question={practiceQuestion}
            selectedAnswer={selectedPracticeAnswer}
            onSelectAnswer={setSelectedPracticeAnswer}
            onSubmit={submitPracticeAnswer}
            onRetryGeneration={retryPracticeGeneration}
            result={practiceResult}
            correctFeedback="Nice work — that's correct."
            incorrectFeedback="Close — let's keep practicing."
            onContinue={fireComplete}
            continueLabel="Continue"
          />
        )}
      </div>
    );
  }

  // 4. Any other strategy (including initial ADVANCE)
  const copy = getStrategyCopy(strategy);

  return (
    <div className="space-y-3">
      {journeyBar}

      {isAdvanceStrategy ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-emerald-950/20 p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Concept Mastered</p>
              <h4 className="text-sm font-bold text-foreground">{copy.heading}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{copy.body}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Ready to continue?</span>
            <Button
              onClick={fireComplete}
              className="min-h-[38px] px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-0"
            >
              <span className="flex items-center gap-1.5">
                <span>Continue</span>
                <ArrowRight size={14} />
              </span>
            </Button>
          </div>
        </div>
      ) : strategy === "INDEPENDENT_PRACTICE" && practiceTrigger ? (
        <AdaptiveQuestionCard
          phase={practicePhase}
          kicker="Practice"
          intro={copy.body}
          loadingMessage="Finding a practice question..."
          question={practiceQuestion}
          selectedAnswer={selectedPracticeAnswer}
          onSelectAnswer={setSelectedPracticeAnswer}
          onSubmit={submitPracticeAnswer}
          onRetryGeneration={retryPracticeGeneration}
          result={practiceResult}
          correctFeedback="Nice work — that's correct."
          incorrectFeedback="Close — let's keep practicing."
          onContinue={fireComplete}
          continueLabel="Continue"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-background/40 p-5 space-y-3">
          <div>
            <p className="text-[10px] text-primary/90 font-bold uppercase tracking-wider mb-1">Your Learning Plan</p>
            <p className="text-sm font-medium text-foreground">{copy.heading}</p>
            <p className="text-xs text-muted-foreground mt-1">{copy.body}</p>
          </div>
          <div className="pt-2 border-t border-border/70 flex justify-end">
            <Button onClick={fireComplete} className="min-h-[34px] px-3 py-1.5 text-xs">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
