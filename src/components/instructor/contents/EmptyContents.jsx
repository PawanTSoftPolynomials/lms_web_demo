"use client";

import Link from "next/link";

import {
    FaFileAlt,
    FaPlus,
} from "react-icons/fa";

export default function EmptyContents({
                                          topicId,
                                      }) {
    return (
        <div
            className="
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-transparent
        bg-background
        px-8
        py-20
        text-center
      "
        >
            <div
                className="
          mb-6
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          bg-primary/10
          text-primary
        "
            >
                <FaFileAlt size={34} />
            </div>

            <h2 className="text-3xl font-bold text-foreground">
                No Content Available
            </h2>

            <p className="mt-3 max-w-lg text-muted-foreground">
                This topic doesn't have any learning content yet.
                Add videos, PDFs, external links, or HTML content
                to help students learn.
            </p>

            {topicId && (
                <Link
                    href={`/instructor/contents/create/${topicId}`}
                    className="
            mt-8
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-orange-600
            px-6
            py-3
            font-medium
            text-foreground
            transition
            hover:bg-orange-700
          "
                >
                    <FaPlus />

                    Add First Content
                </Link>
            )}
        </div>
    );
}