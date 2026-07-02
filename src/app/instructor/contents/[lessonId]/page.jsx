"use client";

import Link from "next/link";
import {useParams} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import ContentGrid from "@/components/instructor/contents/ContentGrid";

import {useContents} from "@/hooks/queries/instructor/useContents";
import {useDeleteContent} from "@/hooks/queries/instructor/useDeleteContent";

export default function LessonContentsPage() {
    const {lessonId} = useParams();

    const {
        data: contents = [],
        isLoading,
        isError,
    } = useContents(lessonId);

    const deleteContentMutation =
        useDeleteContent();

    const handleDelete = async (
        contentId
    ) => {
        if (
            !confirm(
                "Delete this content?"
            )
        ) {
            return;
        }

        try {
            await deleteContentMutation.mutateAsync({
                contentId,
                lessonId,
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
                        Failed to Load Contents
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
                        Contents
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Manage lesson contents.
                    </p>
                </div>

                <Link
                    href={`/instructor/contents/create/${lessonId}`}
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
                    Add Content
                </Link>
            </div>

            <ContentGrid
                contents={contents}
                lessonId={lessonId}
                onDelete={handleDelete}
            />
        </div>
    );
}