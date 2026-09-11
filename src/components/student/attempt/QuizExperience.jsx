"use client";

import { useEffect, useMemo, useState } from "react";

import Loader from "@/components/common/Loader";
import QuizHeader from "@/components/student/attempt/QuizHeader";
import QuestionCard from "@/components/student/attempt/QuestionCard";
import QuizNavigation from "@/components/student/attempt/QuizNavigation";
import QuizSubmitModal from "@/components/student/attempt/QuizSubmitModal";
import QuizResultSummary from "@/components/student/attempt/QuizResultSummary";
import useQuiz from "@/hooks/queries/student/useQuiz";
import useSubmitQuiz from "@/hooks/queries/student/useSubmitQuiz";
import useQuizResult from "@/hooks/queries/student/useQuizResult";
import { checkAnswerCorrectness } from "@/lib/quizAnswers";

/**
 * The actual quiz-taking experience (timer, questions, navigation, submit) —
 * shared by the standalone /student/attempt/[quizId] route and anywhere else
 * that launches a quiz (e.g. the Learning Page's modal/full-screen presenter).
 * Presentation (page vs modal vs full-screen) is entirely the caller's job;
 * this component only knows about the quiz itself.
 */
export default function QuizExperience({ quizId, onBack, resultReturnTo, onNextContent }) {
    const [isSubmitted, setIsSubmitted] = useState(false);

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

    const handleTimeUp = () => {
        setShowSubmitModal(true);
    };

    const submitQuizMutation =
        useSubmitQuiz();

    const handleSubmitQuiz = () => {
        if (answeredQuestions < questions.length) {
            return;
        }

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
        };

        submitQuizMutation.mutate(
            submitPayload,
            {
                onSuccess: () => {
                    setShowSubmitModal(false);
                    setIsSubmitted(true);
                },

                onError: (error) => {
                    console.error(
                        "Quiz submission failed",
                        error
                    );
                },
            }
        );
    };

    // Fetches only once submitted — the result endpoint 404s on an
    // unattempted quiz, and this is the same endpoint/shape the full
    // /student/result page uses, including each question's correctAnswer
    // (stripped from useQuiz above so a student can't see it mid-attempt).
    const { data: resultData, isLoading: isResultLoading } = useQuizResult(quizId, {
        enabled: isSubmitted,
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
                q.type || "MCQ_SINGLE",
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
                correctCount={correctCount}
                totalQuestions={questions.length}
                percentage={submissionResult?.percentage ?? 0}
                passed={Boolean(submissionResult?.passed)}
                resultHref={resultHref}
                onNextContent={onNextContent}
            />
        );
    }

    return (
        <>
            <div className="space-y-2 sm:space-y-3">
                <QuizHeader
                    quiz={quiz}
                    onBack={onBack}
                    onTimeUp={handleTimeUp}
                    answeredCount={answeredQuestions}
                />

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
