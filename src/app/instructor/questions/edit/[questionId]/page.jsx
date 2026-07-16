"use client";

import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import QuestionForm from "@/components/forms/QuestionForm";

import {useQuestion} from "@/hooks/queries/instructor/useQuestion";
import {useUpdateQuestion} from "@/hooks/queries/instructor/useUpdateQuestion";

export default function EditQuestionPage() {
    const {questionId} = useParams();

    const router = useRouter();

    const {
        data: question, isLoading, isError,
    } = useQuestion(questionId);

    const updateQuestionMutation = useUpdateQuestion();

    const handleSubmit = async (questionData, action) => {
        try {
            await updateQuestionMutation.mutateAsync({
                questionId, quizId: question.quizId, questionData,
            });

            router.push(`/instructor/quizzes`);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    if (isLoading) {
        return (<div className="flex justify-center py-20">
            <Loader/>
        </div>);
    }

    if (isError || !question) {
        return (<Card>
            <div className="py-16 text-center">
                <h2 className="text-2xl font-semibold">
                    Failed to Load Question
                </h2>

                <p className="mt-2 text-slate-400">
                    Please try again later.
                </p>
            </div>
        </Card>);
    }

    return (<QuestionForm
        mode="edit"
        initialValues={question}
        loading={updateQuestionMutation.isPending}
        onSubmit={handleSubmit}
    />);
}