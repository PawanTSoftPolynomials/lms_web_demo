"use client";

import Link from "next/link";
import {useParams} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import ContentGrid from "@/components/instructor/contents/ContentGrid";

import {useContents} from "@/hooks/queries/instructor/useContents";
import {useDeleteContent} from "@/hooks/queries/instructor/useDeleteContent";

export default function TopicContentsPage() {
    const {topicId} = useParams();

    const {
        data: contents = [],
        isLoading,
        isError,
    } = useContents(topicId);

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
                topicId,
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

                    <p className="mt-2 text-muted-foreground">
                        Please try again later.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <div>
                    <h1 className="sr-only">
                        Contents
                    </h1>

                    <p className="sr-only">
                        Manage topic contents.
                    </p>
                </div>

                <Link
                    href={`/instructor/contents/create/${topicId}`}
                    className="
            rounded-xl
            bg-orange-600
            px-5
            py-3
            text-foreground
            transition
            hover:bg-orange-700
          "
                >
                    Add Content
                </Link>
            </div>

            <ContentGrid
                contents={contents}
                topicId={topicId}
                onDelete={handleDelete}
            />
        </div>
    );
}
