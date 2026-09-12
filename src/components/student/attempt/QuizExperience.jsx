"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import Loader from "@/components/common/Loader";
import Button from "@/components/ui/Button";
import QuizHeader from "@/components/student/attempt/QuizHeader";
import { getQuizTimerStorageKey } from "@/components/student/attempt/QuizTimer";
import QuestionCard from "@/components/student/attempt/QuestionCard";
import QuizNavigation from "@/components/student/attempt/QuizNavigation";
import QuizSubmitModal from "@/components/student/attempt/QuizSubmitModal";
import QuizResultSummary from "@/components/student/attempt/QuizResultSummary";
import useQuiz from "@/hooks/queries/student/useQuiz";
import useSubmitQuiz from "@/hooks/queries/student/useSubmitQuiz";
import useQuizResult from "@/hooks/queries/student/useQuizResult";
import { checkAnswerCorrectness } from "@/lib/quizAnswers";
import { resolveQuestionType } from "@/lib/questionType";

/**
 * The actual quiz-taking experience (timer, questions, navigation, submit) —
 * shared by the standalone /student/attempt/[quizId] route and anywhere else
 * that launches a quiz (e.g. the Learning Page's modal/full-screen presenter).
 * Presentation (page vs modal vs full-screen) is entirely the caller's job;
 * this component only knows about the quiz itself.
 *
 * Every launch point comes through here, so this is also where a student who
 * has used all their attempts is stopped — before answering, rather than
 * after the server refuses the submission.
 */
export default function QuizExperience({ quizId, onBack, resultReturnTo, onNextContent }) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    // Dismisses the "already completed" landing card below in favor of the
    // normal quiz-taking view, for a student who still has an attempt left.
    const [reattempting, setReattempting] = useState(false);
    // When the questions were first shown — the start of this attempt's
    // time taken.
    const startedAtRef = useRef(null);

    const {
        data,
        isLoading,
        isError,
    } = useQuiz(quizId);

    const quiz = data?.data || data;

    const questions = useMemo(
        () => quiz?.questions || [],
        [quiz]
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);

    const [answers, setAnswers] = useState({});

    const [visitedIndices, setVisitedIndices] = useState(
        () => new Set([0])
    );

    const [showSubmitModal, setShowSubmitModal] =
        useState(false);

    const currentQuestion =
        questions[currentQuestionIndex];

    const answeredQuestions =
        Object.keys(answers).length;

    useEffect(() => {
        if (quiz && startedAtRef.current === null) {
            startedAtRef.current = Date.now();
        }
    }, [quiz]);

    useEffect(() => {
        setVisitedIndices((prev) => {
            if (prev.has(currentQuestionIndex)) return prev;
            return new Set(prev).add(currentQuestionIndex);
        });
    }, [currentQuestionIndex]);

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(
                (prev) => prev - 1
            );
        }
    };

    const handleNext = () => {
        if (
            currentQuestionIndex <
            questions.length - 1
        ) {
            setCurrentQuestionIndex(
                (prev) => prev + 1
            );
        }
    };

    const handleJumpToQuestion = (index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    const handleSelectAnswer = (
        answer
    ) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer,
        }));
    };

    const submitQuizMutation =
        useSubmitQuiz();

    // Guards against a duplicate submit firing before submitQuizMutation.isPending
    // has re-rendered true — e.g. two near-simultaneous timer expiry calls
    // (React Strict Mode's double effect-invocation in dev) would otherwise
    // both slip past a state-based check in the same tick.
    const submitInFlightRef = useRef(false);

    // Shared by the manual "Submit Quiz" confirm and the timer running out —
    // the timeout path skips the completeness gate below since the attempt
    // has to close regardless of how many questions got answered.
    const performSubmit = () => {
        if (submitInFlightRef.current) return;
        submitInFlightRef.current = true;

        const startedAt = startedAtRef.current;

        const submitPayload = {
            quizId,
            answers: Object.entries(
                answers
            ).map(
                ([questionId, selectedOption]) => ({
                    questionId,
                    answer: selectedOption,
                })
            ),
            timeTakenSeconds: startedAt
                ? Math.round((Date.now() - startedAt) / 1000)
                : undefined,
        };

        setSubmitError("");

        submitQuizMutation.mutate(
            submitPayload,
            {
                onSuccess: () => {
                    const timerKey = getQuizTimerStorageKey(
                        quiz?.id,
                        quiz?.attemptStatus?.attemptsUsed ?? 0
                    );
                    if (timerKey) {
                        window.sessionStorage.removeItem(timerKey);
                    }
                    setShowSubmitModal(false);
                    setIsSubmitted(true);
                },

                onError: (error) => {
                    console.error(
                        "Quiz submission failed",
                        error
                    );
                    // A real failure (network/server) should allow retrying —
                    // only a successful submit keeps this attempt locked.
                    submitInFlightRef.current = false;
                    setShowSubmitModal(false);
                    // The server's message explains a refusal (e.g. no
                    // attempts left); anything else is most likely network.
                    setSubmitError(
                        error?.response?.data?.message ||
                            "Your answers couldn't be submitted. Check your connection and try again."
                    );
                },
            }
        );
    };

    const handleSubmitQuiz = () => {
        if (answeredQuestions < questions.length) {
            return;
        }

        performSubmit();
    };

    // The timer (persisted per-attempt, see QuizTimer) fires this once its
    // deadline passes — including immediately on a refresh that lands after
    // time was already up. Auto-submit whatever was answered so far rather
    // than waiting on a confirmation click that may never come.
    const handleTimeUp = () => {
        if (isSubmitted || submitQuizMutation.isPending) return;
        performSubmit();
    };

    // Fetches once submitted, or on landing back on a quiz already attempted
    // in an earlier visit — the result endpoint 404s on a bare unattempted
    // quiz. Same endpoint/shape the full /student/result page uses, including
    // each question's correctAnswer (stripped from useQuiz above so a
    // student can't see it mid-attempt).
    const { data: resultData, isLoading: isResultLoading } = useQuizResult(quizId, {
        enabled: isSubmitted || Boolean(quiz?.attemptStatus?.attemptsUsed > 0),
    });

    const submissionResult = resultData?.data || resultData;

    const parsedSubmissionAnswers = useMemo(() => {
        if (!submissionResult?.answers) return [];
        if (typeof submissionResult.answers === "string") {
            try {
                return JSON.parse(submissionResult.answers);
            } catch {
                return [];
            }
        }
        return submissionResult.answers;
    }, [submissionResult]);

    const correctCount = useMemo(() => {
        if (!submissionResult?.quiz?.questions) return 0;
        return submissionResult.quiz.questions.filter((q) => {
            const userAnswer = parsedSubmissionAnswers.find(
                (a) => a.questionId === q.id
            );
            return checkAnswerCorrectness(
                resolveQuestionType(q.questionType),
                userAnswer?.answer ?? userAnswer?.selectedOption,
                q.correctAnswer
            );
        }).length;
    }, [submissionResult, parsedSubmissionAnswers]);

    const resultHref = resultReturnTo
        ? `/student/result/${quizId}?from=${encodeURIComponent(resultReturnTo)}`
        : `/student/result/${quizId}`;

    if (isLoading) {
        return <Loader />;
    }

    if (isError || !quiz) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Quiz not found
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Unable to load this quiz.
                </p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <QuizResultSummary
                quizTitle={quiz.title}
                isLoading={isResultLoading || !submissionResult}
                // The server's tally is authoritative; the client-side check
                // only covers a response that predates it.
                correctCount={submissionResult?.correctCount ?? correctCount}
                totalQuestions={questions.length}
                percentage={submissionResult?.percentage ?? 0}
                passed={Boolean(submissionResult?.passed)}
                resultHref={resultHref}
                onNextContent={onNextContent}
            />
        );
    }

    // Present for students only (see GET /quizzes/:id).
    const allowance = quiz.attemptStatus;
    const hasPriorAttempt = allowance && allowance.attemptsUsed > 0;

    if (hasPriorAttempt && !reattempting) {
        // submissionResult is only known once its fetch (enabled above for
        // any prior attempt) resolves — the icon/badge stay neutral until then.
        const knowsOutcome = !isResultLoading && submissionResult != null;
        const passed = Boolean(submissionResult?.passed);

        return (
            <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
                <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                        knowsOutcome && !passed
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-emerald-500/10 text-emerald-400"
                    }`}
                >
                    <CheckCircle2 className="h-5 w-5" aria-hidden />
                </div>
                {knowsOutcome && (
                    <div
                        className={`mx-auto mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            passed
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                        }`}
                    >
                        {passed ? "Passed" : "Failed"}
                    </div>
                )}
                <h2 className="mt-3 text-lg font-semibold text-foreground">
                    You have completed the quiz
                </h2>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    {allowance.canAttempt
                        ? `You can view your result or retake “${quiz.title}”.`
                        : `You've used all ${allowance.maxAttempts} attempt${allowance.maxAttempts === 1 ? "" : "s"} allowed for “${quiz.title}”.`}
                </p>
                <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button asChild className="inline-flex flex-1 items-center justify-center">
                        <Link href={resultHref}>View result</Link>
                    </Button>
                    {allowance.canAttempt && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReattempting(true)}
                            className="flex-1"
                        >
                            Retake
                        </Button>
                    )}
                    {onBack && (
                        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                            Go back
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                <QuizHeader
                    quiz={quiz}
                    onBack={onBack}
                    onTimeUp={handleTimeUp}
                    answeredCount={answeredQuestions}
                />

                {allowance && (allowance.attemptsUsed > 0 || !allowance.unlimitedAttempts) && (
                    <p className="px-1 text-xs font-medium text-muted-foreground">
                        Attempt {allowance.attemptsUsed + 1}
                        {allowance.unlimitedAttempts ? "" : ` of ${allowance.maxAttempts}`}
                    </p>
                )}

                {submitError && (
                    <p
                        role="alert"
                        className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                    >
                        {submitError}
                    </p>
                )}

                <QuestionCard
                    question={currentQuestion}
                    selectedAnswer={answers[currentQuestion?.id]}
                    onSelectAnswer={handleSelectAnswer}
                />

                <QuizNavigation
                    questions={questions}
                    currentQuestionIndex={currentQuestionIndex}
                    answers={answers}
                    visitedIndices={visitedIndices}
                    canGoPrevious={currentQuestionIndex > 0}
                    canGoNext={currentQuestionIndex < questions.length - 1}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onJumpTo={handleJumpToQuestion}
                    onSubmit={() => setShowSubmitModal(true)}
                    isSubmitting={submitQuizMutation.isPending}
                />
            </div>

            <QuizSubmitModal
                isOpen={showSubmitModal}
                onClose={() =>
                    setShowSubmitModal(false)
                }
                onConfirm={handleSubmitQuiz}
                totalQuestions={questions.length}
                answeredQuestions={answeredQuestions}
                isSubmitting={
                    submitQuizMutation.isPending
                }
            />
        </>
    );
}
