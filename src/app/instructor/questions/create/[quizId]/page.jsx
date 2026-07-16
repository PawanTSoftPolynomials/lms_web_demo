"use client";

import {useParams, useRouter} from "next/navigation";

import QuestionForm from "@/components/forms/QuestionForm";

import {useCreateQuestion} from "@/hooks/queries/instructor/useCreateQuestion";

export default function CreateQuestionPage() {
    const {quizId} = useParams();

    const router = useRouter();

    const createQuestionMutation =
        useCreateQuestion();

    const handleSubmit = async (
        questionData,
        action
    ) => {
        try {
            await createQuestionMutation.mutateAsync({
                ...questionData,
                quizId,
            });

            if (action === "another") {
                return true;
            }

            router.push(`/instructor/quizzes`);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <QuestionForm
            mode="create"
            loading={
                createQuestionMutation.isPending
            }
            onSubmit={handleSubmit}
        />
    );
}