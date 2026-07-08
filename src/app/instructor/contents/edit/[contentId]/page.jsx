"use client";

import {useParams, useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import ContentForm from "@/components/instructor/contents/ContentForm";

import {useContent} from "@/hooks/queries/instructor/useContent";
import {useUpdateContent} from "@/hooks/queries/instructor/useUpdateContent";

export default function EditContentPage() {
    const {contentId} = useParams();

    const router = useRouter();

    const {
        data: content,
        isLoading,
        isError,
    } = useContent(contentId);

    const updateContentMutation =
        useUpdateContent();

    const handleSubmit = async (values) => {
        try {
            await updateContentMutation.mutateAsync({
                contentId,
                contentData: {
                    ...values,
                    lessonId: content.lessonId,
                    order: content.order,

                    ...(values.type === "VIDEO" && {
                        duration: Number(values.duration || 0),
                    }),
                },
            });

            router.push(
                `/instructor/contents/${contentId}`
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

    if (isError || !content) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Content Not Found
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Unable to load content.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <ContentForm
            mode="edit"
            initialValues={content}
            loading={updateContentMutation.isPending}
            onSubmit={handleSubmit}
        />
    );
}