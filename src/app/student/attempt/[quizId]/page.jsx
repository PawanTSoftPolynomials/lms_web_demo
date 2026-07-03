"use client";

import {useMemo, useState} from "react";
import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import QuizHeader from "@/components/student/attempt/QuizHeader";
import QuizTimer from "@/components/student/attempt/QuizTimer";
import QuestionCard from "@/components/student/attempt/QuestionCard";
import QuizNavigation from "@/components/student/attempt/QuizNavigation";
import QuizSubmitModal from "@/components/student/attempt/QuizSubmitModal";
import useQuiz from "@/hooks/queries/student/useQuiz";
import useSubmitQuiz from "@/hooks/queries/student/useSubmitQuiz";

export default function QuizAttemptPage() {
    const {quizId} = useParams();
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
    //console.log("Quiz Response:", data);
    //console.log("Quiz:", quiz);
    // Current Question
    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);

    // Selected Answers
    const [answers, setAnswers] = useState({});

    // Submit Modal
    const [showSubmitModal, setShowSubmitModal] =
        useState(false);

    // Current Question
    const currentQuestion =
        questions[currentQuestionIndex];
    //console.log("Current Question:", currentQuestion);
    // Answer Count
    const answeredQuestions =
        Object.keys(answers).length;

    // Navigation
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

    // Save Answer
    const handleSelectAnswer = (
        answer
    ) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer,
        }));
    };

    // Timer Finished
    const handleTimeUp = () => {
        setShowSubmitModal(true);
    };

    const submitQuizMutation =
        useSubmitQuiz();
    // Submit Quiz
    const handleSubmitQuiz = () => {
        submitQuizMutation.mutate(
            {
                quizId,
                answers: Object.entries(
                    answers
                ).map(
                    ([questionId, selectedOption]) => ({
                        questionId,
                        selectedOption,
                    })
                ),
            },
            {
                onSuccess: () => {
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
        return <Loader/>;
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
                {/* Header */}
                <QuizHeader quiz={quiz}/>

                {/* Timer */}
                <QuizTimer
                    duration={quiz.timeLimit}
                    onTimeUp={handleTimeUp}
                />

                {/* Question */}
                <QuestionCard
                    question={currentQuestion}
                    currentQuestion={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    selectedAnswer={answers[currentQuestion?.id]}
                    onSelectAnswer={handleSelectAnswer}
                />

                {/* Navigation */}
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