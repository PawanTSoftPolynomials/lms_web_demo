"use client";

import Link from "next/link";

import {
    FaFileAlt,
    FaPlus,
} from "react-icons/fa";

export default function EmptyContents({
                                          lessonId,
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
        border-slate-700
        bg-slate-900
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
          bg-orange-500/10
          text-orange-400
        "
            >
                <FaFileAlt size={34} />
            </div>

            <h2 className="text-3xl font-bold text-white">
                No Content Available
            </h2>

            <p className="mt-3 max-w-lg text-slate-400">
                This lesson doesn't have any learning content yet.
                Add videos, PDFs, external links, or HTML content
                to help students learn.
            </p>

            {lessonId && (
                <Link
                    href={`/instructor/contents/create/${lessonId}`}
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
            text-white
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