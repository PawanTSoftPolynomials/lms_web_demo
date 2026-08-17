"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import QuizHeader from "@/components/student/attempt/QuizHeader";
import QuizTimer from "@/components/student/attempt/QuizTimer";
import QuestionCard from "@/components/student/attempt/QuestionCard";
import QuizNavigation from "@/components/student/attempt/QuizNavigation";
import QuizSubmitModal from "@/components/student/attempt/QuizSubmitModal";
import useQuiz from "@/hooks/queries/student/useQuiz";
import useSubmitQuiz from "@/hooks/queries/student/useSubmitQuiz";

/**
 * The actual quiz-taking experience (timer, questions, navigation, submit) —
 * shared by the standalone /student/attempt/[quizId] route and anywhere else
 * that launches a quiz (e.g. the Learning Page's modal/full-screen presenter).
 * Presentation (page vs modal vs full-screen) is entirely the caller's job;
 * this component only knows about the quiz itself.
 */
export default function QuizExperience({ quizId, onBack }) {
    const router = useRouter();

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

    const [showSubmitModal, setShowSubmitModal] =
        useState(false);

    const currentQuestion =
        questions[currentQuestionIndex];

    const answeredQuestions =
        Object.keys(answers).length;

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

        // TEMP DIAGNOSTIC — remove after investigation
        console.log("[Adaptive TRACE] SUBMIT_PAYLOAD", {
            answers: submitPayload.answers,
            t: performance.now(),
        });

        submitQuizMutation.mutate(
            submitPayload,
            {
                onSuccess: (data) => {
                    // TEMP DIAGNOSTIC — remove after investigation
                    console.log("[Adaptive TRACE] SUBMIT_RESPONSE", {
                        submissionId: data?.id,
                        answers: data?.answers,
                        t: performance.now(),
                    });

                    setShowSubmitModal(false);

                    router.push(
                        `/student/result/${quizId}`
                    );
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

    if (isLoading) {
        return <Loader />;
    }

    if (isError || !quiz) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                    Quiz not found
                </h2>

                <p className="mt-2 text-slate-400">
                    Unable to load this quiz.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <QuizHeader quiz={quiz} onBack={onBack} />

                <QuizTimer
                    duration={quiz?.timeLimit || quiz?.duration || 15}
                    onTimeUp={handleTimeUp}
                />

                <QuestionCard
                    question={currentQuestion}
                    currentQuestion={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    selectedAnswer={answers[currentQuestion?.id]}
                    onSelectAnswer={handleSelectAnswer}
                />

                <QuizNavigation
                    currentQuestion={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    canGoPrevious={currentQuestionIndex > 0}
                    canGoNext={currentQuestionIndex < questions.length - 1}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSubmit={() => setShowSubmitModal(true)}
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
