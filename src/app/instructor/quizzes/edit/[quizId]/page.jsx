"use client";

import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import QuizForm from "@/components/instructor/quizzes/QuizForm";

import { useQuiz } from "@/hooks/queries/instructor/useQuiz";
import { useUpdateQuiz } from "@/hooks/queries/instructor/useUpdateQuiz";

export default function EditQuizPage() {
    const { quizId } = useParams();

    const router = useRouter();

    const {
        data: quiz,
        isLoading,
        isError,
    } = useQuiz(quizId);

    const updateQuizMutation =
        useUpdateQuiz();

    const handleSubmit = async (
        values
    ) => {
        try {
            await updateQuizMutation.mutateAsync({
                quizId,
                quizData: {
                    ...values,
                    courseId: quiz.courseId,
                },
            });

            router.push(
                `/instructor/quizzes/view/${quizId}`
            );
        } catch (error) {
            console.error(error);
        }
    };

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
                    <h2 className="text-2xl font-semibold">
                        Quiz Not Found
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Unable to load the quiz.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <QuizForm
            mode="edit"
            initialValues={quiz}
            loading={
                updateQuizMutation.isPending
            }
            onSubmit={handleSubmit}
        />
    );
}