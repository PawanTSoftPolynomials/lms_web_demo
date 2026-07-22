"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ActionMenu from "@/components/menus/ActionMenu";
import ImportQuestionsModal from "@/components/instructor/questions/ImportQuestionsModal";

import { useQuiz } from "@/hooks/queries/instructor/useQuiz";
import { useDeleteQuiz } from "@/hooks/queries/instructor/useDeleteQuiz";

export default function QuizDetailsPage() {
    const { quizId } = useParams();
    const router = useRouter();
    const [showImport, setShowImport] = useState(false);


    const {
        data: quiz,
        isLoading,
        isError,
    } = useQuiz(quizId);

    const deleteQuizMutation = useDeleteQuiz();

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
                    <p className="mt-2 text-slate-400">Unable to load this quiz.</p>
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
                            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-orange-400"
                        >
                            ← Back
                        </button>

                        <span className="inline-flex rounded-full bg-orange-500/15 px-3 py-1 text-sm font-medium text-orange-400">
                            Quiz
                        </span>

                        <h1 className="mt-4 text-3xl font-bold text-white">
                            {quiz.title}
                        </h1>

                        {quiz.description && (
                            <p className="mt-3 max-w-3xl text-slate-400">
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
                    <p className="text-sm text-slate-400">Passing</p>
                    <h3 className="mt-3 text-3xl font-bold text-orange-400">
                        {quiz.passingScore}%
                    </h3>
                </Card>

                <Card className="text-center">
                    <p className="text-sm text-slate-400">Time Limit</p>
                    <h3 className="mt-3 text-3xl font-bold text-orange-400">
                        {quiz.timeLimit || 0} mins
                    </h3>
                </Card>

                <Card className="text-center">
                    <p className="text-sm text-slate-400">Questions</p>
                    <h3 className="mt-3 text-3xl font-bold text-orange-400">
                        {quiz.questions?.length || 0}
                    </h3>
                </Card>

                <Card className="text-center">
                    <p className="text-sm text-slate-400">Total Marks</p>
                    <h3 className="mt-3 text-3xl font-bold text-orange-400">
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
                        className="border border-slate-800 transition hover:border-orange-500"
                    >
                        {/* Top */}
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Question {index + 1}
                                </h3>
                                <p className="mt-4 text-lg text-slate-100">
                                    {question.question || question.title}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-orange-500/15 px-4 py-2 text-sm font-semibold text-orange-400">
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
                                            onClick: () => console.log("Delete Question"),
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Options */}
                        {options.length > 0 && (
                            <div className="mt-8 space-y-4">
                                {options.map((option, i) => {
                                    const isCorrect = option === question.correctAnswer;

                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-5 py-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-500">○</span>
                                                <span className="text-slate-200">
                                                    <span className="mr-1 font-semibold">
                                                        {labels[i]}.
                                                    </span>
                                                    {option}
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
                        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-5">
                            <p className="text-sm text-slate-500">
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
                                    className="font-medium text-orange-400 transition hover:text-orange-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => console.log("Delete Question")}
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