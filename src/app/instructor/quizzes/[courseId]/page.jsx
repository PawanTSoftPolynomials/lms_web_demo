"use client";

import Link from "next/link";
import {useParams} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import QuizGrid from "@/components/instructor/quizzes/QuizGrid";

import {useQuizzes} from "@/hooks/queries/instructor/useQuizzes";
import {useDeleteQuiz} from "@/hooks/queries/instructor/useDeleteQuiz";

export default function QuizListPage() {
    const {courseId} = useParams();

    const {
        data: quizzes = [],
        isLoading,
        isError,
    } = useQuizzes(courseId);
    const deleteQuizMutation =
        useDeleteQuiz();

    const handleDelete = async (
        quizId
    ) => {
        if (
            !window.confirm(
                "Delete this quiz?"
            )
        ) {
            return;
        }

        try {
            await deleteQuizMutation.mutateAsync({
                quizId,
                courseId,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (isError) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Failed to Load Quizzes
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Please try again later.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        Quizzes
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Manage quizzes and their
                        questions.
                    </p>
                </div>

                <Link
                    href={`/instructor/quizzes/create/${courseId}`}
                    className="
            rounded-xl
            bg-orange-600
            px-5
            py-3
            text-white
            transition
            hover:bg-orange-700
          "
                >
                    Add Quiz
                </Link>
            </div>

            <QuizGrid
                quizzes={quizzes}
                courseId={courseId}
                onDelete={handleDelete}
            />
        </div>
    );
}