"use client";

import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import ContentForm from "@/components/instructor/contents/ContentForm";

import {useContents} from "@/hooks/queries/instructor/useContents";
import {useCreateContent} from "@/hooks/queries/instructor/useCreateContent";

export default function CreateContentPage() {
    const {lessonId} = useParams();

    const router = useRouter();

    const createContentMutation =
        useCreateContent();

    const {
        data: contents = [],
        isLoading,
    } = useContents(lessonId);

    const handleSubmit = async (
        values
    ) => {
        const nextOrder =
            contents.length > 0
                ? Math.max(
                ...contents.map(
                    (content) =>
                        content.order || 0
                )
            ) + 1
                : 1;

        try {
            await createContentMutation.mutateAsync({
                ...values,
                lessonId,
                order: nextOrder,

                ...(values.type ===
                    "VIDEO" && {
                        duration: Number(
                            values.duration || 0
                        ),
                    }),
            });

            router.push(
                `/instructor/lessons/${lessonId}`
            );
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

    return (
        <ContentForm
            mode="create"
            loading={
                createContentMutation.isPending
            }
            onSubmit={handleSubmit}
        />
    );
}