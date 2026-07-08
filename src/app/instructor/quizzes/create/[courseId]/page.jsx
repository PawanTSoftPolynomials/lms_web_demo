"use client";

import {useParams, useRouter} from "next/navigation";

import QuizForm from "@/components/instructor/quizzes/QuizForm";

import {useCreateQuiz} from "@/hooks/queries/instructor/useCreateQuiz";

export default function CreateQuizPage() {
    const {courseId} = useParams();

    const router = useRouter();

    const createQuizMutation =
        useCreateQuiz();

    const handleSubmit = async (
        values
    ) => {
        try {
            await createQuizMutation.mutateAsync({
                ...values,
                courseId,
            });

            router.push(
                `/instructor/quizzes/${courseId}`
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <QuizForm
            mode="create"
            onSubmit={handleSubmit}
            loading={
                createQuizMutation.isPending
            }
        />
    );
}