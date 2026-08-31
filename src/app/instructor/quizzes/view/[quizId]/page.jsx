"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ActionMenu from "@/components/menus/ActionMenu";
import ImportQuestionsModal from "@/components/instructor/questions/ImportQuestionsModal";

import { useQuiz } from "@/hooks/queries/instructor/useQuiz";
import { useDeleteQuiz } from "@/hooks/queries/instructor/useDeleteQuiz";
import { useDeleteQuestion } from "@/hooks/queries/instructor/useDeleteQuestion";
import { useToast } from "@/components/ui/ToastProvider";

export default function QuizDetailsPage() {
    const { quizId } = useParams();
    const router = useRouter();
    const [showImport, setShowImport] = useState(false);
    const { showToast } = useToast();

    const {
        data: quiz,
        isLoading,
        isError,
    } = useQuiz(quizId);

    const deleteQuizMutation = useDeleteQuiz();
    const deleteQuestionMutation = useDeleteQuestion();

    const handleDelete = async () => {
        const confirmed = window.confirm(`Delete "${quiz.title}"?`);

        if (!confirmed) return;

        try {
            await deleteQuizMutation.mutateAsync({
                quizId,
                courseId: quiz.courseId,
            });

            router.push(`/instructor/quizzes/${quiz.courseId}`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteQuestion = (questionId) => {
        if (!window.confirm("Delete this question?")) return;

        deleteQuestionMutation.mutate(
            { questionId, quizId },
            {
                onSuccess: () => showToast("Question deleted successfully", "success"),
                onError: (error) =>
                    showToast(error?.response?.data?.message || "Failed to delete question.", "error", "Delete Failed"),
            }
        );
    };

    const totalMarks =
        quiz?.questions?.reduce(
            (total, question) => total + (question.marks || 1),
            0
        ) || 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader />
            </div>
        );
    }

    if (isError || !quiz) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">Quiz Not Found</h2>
                    <p className="mt-2 text-muted-foreground">Unable to load this quiz.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <button
                            onClick={() =>
                                router.push(`/instructor/quizzes/${quiz.courseId}`)
                            }
                            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
                        >
                            ← Back
                        </button>

                        <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                            Quiz
                        </span>

                        <h1 className="mt-4 text-3xl font-bold text-foreground">
                            {quiz.title}
                        </h1>

                        {quiz.description && (
                            <p className="mt-3 max-w-3xl text-muted-foreground">
                                {quiz.description}
                            </p>
                        )}
                    </div>

                    <ActionMenu
                        items={[
                            {
                                label: "Manage Questions",
                                onClick: () =>
                                    router.push(`/instructor/questions/${quiz.id}`),
                            },
                            {
                                label: "Add Multiple Questions",
                                onClick: () =>
                                    router.push(`/instructor/questions/bulk/${quiz.id}`),
                            },
                            {
                                label: "Import Questions",
                                onClick: () => setShowImport(true),
                            },
                            {
                                label: "Edit Quiz",
                                onClick: () =>
                                    router.push(`/instructor/quizzes/edit/${quiz.id}`),
                            },
                            {
                                label: "Delete Quiz",
                                onClick: handleDelete,
                            },
                        ]}
                    />
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="text-center">
                    <p className="text-sm text-muted-foreground">Passing</p>
                    <h3 className="mt-3 text-3xl font-bold text-primary">
                        {quiz.passingScore}%
                    </h3>
                </Card>

                <Card className="text-center">
                    <p className="text-sm text-muted-foreground">Time Limit</p>
                    <h3 className="mt-3 text-3xl font-bold text-primary">
                        {quiz.timeLimit || 0} mins
                    </h3>
                </Card>

                <Card className="text-center">
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <h3 className="mt-3 text-3xl font-bold text-primary">
                        {quiz.questions?.length || 0}
                    </h3>
                </Card>

                <Card className="text-center">
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <h3 className="mt-3 text-3xl font-bold text-primary">
                        {totalMarks}
                    </h3>
                </Card>
            </div>

            {/* Added optional chaining below just in case questions is undefined */}
            {quiz.questions?.map((question, index) => {
                const options = [
                    question.optionA,
                    question.optionB,
                    question.optionC,
                    question.optionD,
                ].filter(Boolean);

                const labels = ["A", "B", "C", "D"];

                return (
                    <Card
                        key={question.id}
                        className="border border-transparent transition hover:border-primary"
                    >
                        {/* Top */}
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Question {index + 1}
                                </h3>
                                <p className="mt-4 text-lg text-foreground">
                                    {question.question || question.title}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
                                    ⭐ {question.marks || 1}{" "}
                                    {question.marks === 1 ? "Mark" : "Marks"}
                                </div>

                                <ActionMenu
                                    items={[
                                        {
                                            label: "Edit",
                                            onClick: () =>
                                                router.push(
                                                    `/instructor/questions/edit/${question.id}`
                                                ),
                                        },
                                        {
                                            label: "Delete",
                                            onClick: () => handleDeleteQuestion(question.id),
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Options */}
                        {options.length > 0 && (
                            <div className="mt-8 space-y-4">
                                {options.map((option, i) => {
                                    const optionText = typeof option === "string" ? option : (option?.optionText || option?.text || String(option));
                                    const isCorrect = optionText === question.correctAnswer || (typeof option === "object" && option?.isCorrect);

                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg border border-transparent bg-background px-5 py-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground">○</span>
                                                <span className="text-foreground">
                                                    <span className="mr-1 font-semibold">
                                                        {labels[i]}.
                                                    </span>
                                                    {optionText}
                                                </span>
                                            </div>

                                            {isCorrect && (
                                                <span className="font-medium text-green-400">
                                                    ✅ Correct
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Bottom */}
                        <div className="mt-8 flex items-center justify-between border-t border-transparent pt-5">
                            <p className="text-sm text-muted-foreground">
                                Created:{" "}
                                {question.createdAt
                                    ? new Date(question.createdAt).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )
                                    : "-"}
                            </p>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/instructor/questions/edit/${question.id}`
                                        )
                                    }
                                    className="font-medium text-primary transition hover:text-orange-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="font-medium text-red-400 transition hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Card>
                );
            })}

            {/* Import Modal */}
            {showImport && (
                <ImportQuestionsModal
                    quizId={quizId}
                    onClose={() => setShowImport(false)}
                    onSuccess={() => setShowImport(false)}
                />
            )}
        </div>
    );
}