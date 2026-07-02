"use client";

import Link from "next/link";
import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ActionMenu from "@/components/menus/ActionMenu";

import ContentPreview from "@/components/instructor/contents/ContentPreview";

import {useContent} from "@/hooks/queries/instructor/useContent";
import {useDeleteContent} from "@/hooks/queries/instructor/useDeleteContent";

export default function ContentDetailsPage() {
    const {contentId} = useParams();

    const router = useRouter();

    const {
        data: content,
        isLoading,
        isError,
    } = useContent(contentId);
    console.log(content);
    const deleteContentMutation =
        useDeleteContent();

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${content.title}"?`
        );

        if (!confirmed) return;

        try {
            await deleteContentMutation.mutateAsync({
                contentId,
                lessonId: content.lessonId,
            });

            router.push(
                `/instructor/contents/${content.lessonId}`
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
                        Unable to load this content.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <Card className="p-8">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
              <span
                  className="
                  rounded-full
                  bg-orange-500/15
                  px-3
                  py-1
                  text-sm
                  font-medium
                  text-orange-400
                "
              >
                {content.type}
              </span>

                            <span className="text-sm text-slate-500">
                Order #{content.order}
              </span>
                        </div>

                        <h1 className="text-4xl font-bold text-white">
                            {content.title}
                        </h1>
                    </div>

                    <ActionMenu
                        items={[
                            {
                                label: "Edit",
                                onClick: () =>
                                    router.push(
                                        `/instructor/contents/edit/${content.id}`
                                    ),
                            },
                            {
                                label: "Delete",
                                onClick: handleDelete,
                            },
                        ]}
                    />
                </div>
            </Card>

            {/* Preview */}
            <Card className="p-8">
                <h2 className="mb-6 text-2xl font-semibold">
                    Preview
                </h2>

                <ContentPreview content={content}/>
            </Card>

            {/* Footer */}
            <div className="flex justify-between">
                <Link
                    href={`/instructor/contents/${content.lessonId}`}
                    className="
            rounded-xl
            border
            border-slate-700
            px-5
            py-3
            text-white
            transition
            hover:border-orange-500
          "
                >
                    Back to Contents
                </Link>

                <Link
                    href={`/instructor/contents/edit/${content.id}`}
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
                    Edit Content
                </Link>
            </div>
        </div>
    );
}