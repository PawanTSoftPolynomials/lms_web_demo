"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ActionMenu from "@/components/menus/ActionMenu";

import { useQuiz } from "@/hooks/queries/instructor/useQuiz";
import { useDeleteQuiz } from "@/hooks/queries/instructor/useDeleteQuiz";
import { useDeleteQuestion } from "@/hooks/queries/instructor/useDeleteQuestion";

export default function QuizDetailsPage() {
    const { quizId } = useParams();
    const router = useRouter();

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

            router.push(`/instructor/courses/${quiz.courseId}/quizzes`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm("Delete this question?")) {
            return;
        }

        try {
            await deleteQuestionMutation.mutateAsync({
                questionId,
                quizId,
            });
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
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <button
                            onClick={() =>
                                router.push(`/instructor/courses/${quiz.courseId}/quizzes`)
                            }
                            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-orange-400 font-bold uppercase tracking-wider"
                        >
                            ← Back to Quizzes
                        </button>

                        <div className="flex items-center gap-3">
                            <span className="inline-flex rounded-full bg-orange-500/15 px-3 py-1 text-sm font-medium text-orange-400">
                                Quiz
                            </span>
                        </div>

                        <h1 className="mt-4 text-3xl font-bold text-white">
                            {quiz.title}
                        </h1>

                        {quiz.description && (
                            <p className="mt-3 max-w-3xl text-slate-400">
                                {quiz.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                router.push(`/instructor/courses/${quiz.courseId}/quizzes/${quiz.id}/questions`)
                            }
                            className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-orange-700 shrink-0"
                        >
                            Manage Questions
                        </button>

                        <ActionMenu
                            items={[
                                {
                                    label: "Edit Quiz",
                                    onClick: () =>
                                        router.push(`/instructor/courses/${quiz.courseId}/quizzes/edit/${quiz.id}`),
                                },
                                {
                                    label: "Delete Quiz",
                                    onClick: handleDelete,
                                },
                            ]}
                        />
                    </div>
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

            {quiz.questions?.map((question, index) => {
                const type = question.type || "MCQ_SINGLE";

                return (
                    <Card
                        key={question.id}
                        className="border border-slate-800 transition hover:border-orange-500 p-6 space-y-6"
                    >
                        {/* Top / Header */}
                        <div className="flex items-start justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white">
                                        Question {index + 1}
                                    </h3>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                            type === "MCQ_SINGLE"
                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                : type === "MCQ_MULTI"
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : type === "ARRANGE_TOKENS"
                                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                                : type === "MATCH_PAIRS"
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        }`}
                                    >
                                        {type.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-lg text-slate-100 leading-relaxed font-medium">
                                    {question.question || question.title}
                                </p>
                                {question.concept && (
                                    <span className="inline-block text-[9px] text-purple-400 font-extrabold uppercase bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                                        {question.concept}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className="rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-xs font-bold text-orange-400">
                                    ⭐ {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                                </div>

                                <ActionMenu
                                    items={[
                                        {
                                            label: "Edit",
                                            onClick: () =>
                                                router.push(
                                                    `/instructor/courses/${quiz.courseId}/quizzes/${quiz.id}/questions/edit/${question.id}`
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

                        {/* Options / Dynamic Previews */}
                        <div className="space-y-4">
                            {/* MCQ_SINGLE / MCQ_MULTI */}
                            {(type === "MCQ_SINGLE" || type === "MCQ_MULTI") &&
                                Array.isArray(question.options) && (
                                    <div className="grid gap-3">
                                        {question.options.map((option, i) => {
                                            const isCorrect = type === "MCQ_SINGLE"
                                                ? option === question.correctAnswer
                                                : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option);

                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between rounded-xl border p-4 text-sm transition ${
                                                        isCorrect
                                                            ? "border-green-500/30 bg-green-500/5 text-slate-200"
                                                            : "border-slate-800 bg-slate-950/40 text-slate-300"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                                isCorrect
                                                                    ? "bg-green-500 text-slate-950"
                                                                    : "bg-slate-800 text-slate-400"
                                                            }`}
                                                        >
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <span>{option}</span>
                                                    </div>

                                                    {isCorrect && (
                                                        <span className="text-xs font-bold text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded">
                                                            ✓ Correct Choice
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                            {/* ARRANGE_TOKENS */}
                            {type === "ARRANGE_TOKENS" && Array.isArray(question.options) && (
                                <div className="flex flex-wrap gap-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                                    {question.options.map((token, i) => (
                                        <span
                                            key={i}
                                            className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                                        >
                                            <span className="text-[10px] bg-orange-500/20 px-1 rounded">{i + 1}</span>
                                            {token}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* MATCH_PAIRS */}
                            {type === "MATCH_PAIRS" && question.correctAnswer && (
                                <div className="grid gap-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                                    {Object.entries(question.correctAnswer).map(([leftItem, rightItem], i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950 px-4 py-3 text-xs text-slate-300"
                                        >
                                            <span className="font-semibold text-white">{leftItem}</span>
                                            <span className="text-slate-600 font-bold font-mono">⟷</span>
                                            <span className="text-emerald-400 font-bold">{rightItem}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SELF_ASSESSMENT */}
                            {type === "SELF_ASSESSMENT" && (
                                <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-2">
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
                                        Grading Rubric
                                    </span>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {question.correctAnswer}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Info / Actions Row */}
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
                            <p className="text-slate-500">
                                Created:{" "}
                                {question.createdAt
                                    ? new Date(question.createdAt).toLocaleDateString(
                                          "en-US",
                                          {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                          }
                                      )
                                    : "-"}
                            </p>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/instructor/courses/${quiz.courseId}/quizzes/${quiz.id}/questions/edit/${question.id}`
                                        )
                                    }
                                    className="font-bold text-orange-400 transition hover:text-orange-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="font-bold text-red-400 transition hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}