"use client";

import {useParams, useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import TopicForm from "@/components/instructor/topics/TopicForm";
import {useToast} from "@/components/ui/ToastProvider";

import {useTopic} from "@/hooks/queries/instructor/useTopic";
import {useUpdateTopic} from "@/hooks/queries/instructor/useUpdateTopic";

export default function EditTopicPage() {
    const {topicId} = useParams();

    const router = useRouter();
    const {showToast} = useToast();

    const {
        data: topic,
        isLoading,
        isError,
    } = useTopic(topicId);

    const updateTopicMutation =
        useUpdateTopic();

    const handleSubmit = async (
        values
    ) => {
        try {
            await updateTopicMutation.mutateAsync({
                topicId,
                topicData: {
                    ...values,
                    lessonId: topic.lessonId,
                    order: topic.order,
                },
            });

            router.push(
                `/instructor/topics/${topicId}`
            );
        } catch (error) {
            console.error(error);
            showToast(
                error?.response?.data?.message || "Failed to update topic.",
                "error",
                "Update failed"
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (isError || !topic) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Topic Not Found
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        Unable to load topic.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <TopicForm
            mode="edit"
            initialValues={topic}
            contentsCount={topic.contents?.length ?? 0}
            loading={
                updateTopicMutation.isPending
            }
            onSubmit={handleSubmit}
        />
    );
}
