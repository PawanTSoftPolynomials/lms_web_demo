"use client";

import Link from "next/link";

import {
    FaEdit,
    FaFileAlt,
    FaVideo,
    FaLink,
    FaCode,
    FaFilePdf,
} from "react-icons/fa";

const CONTENT_ICONS = {
    VIDEO: FaVideo,
    FILE: FaFilePdf,
    LINK: FaLink,
    HTML: FaCode,
};

export default function ContentHeader({
                                          content,
                                      }) {
    const Icon =
        CONTENT_ICONS[content.type] ||
        FaFileAlt;

    return (
        <div
            className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-8
      "
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Left */}
                <div className="flex-1">
                    <div className="mb-4 flex items-center gap-4">
                        <div
                            className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-xl
                bg-orange-500/15
                text-orange-400
              "
                        >
                            <Icon size={24}/>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {content.title}
                            </h1>

                            <p className="mt-1 text-slate-400">
                                Learning Content
                            </p>
                        </div>
                    </div>

                    <p className="max-w-3xl text-slate-400">
                        {content.description ||
                            "No description available."}
                    </p>
                </div>

                {/* Edit */}
                <Link
                    href={`/instructor/contents/edit/${content.id}`}
                    className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-orange-600
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-orange-700
          "
                >
                    <FaEdit/>

                    Edit Content
                </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div
                    className="
            rounded-xl
            border
            border-slate-800
            bg-slate-950/40
            p-5
          "
                >
                    <p className="text-sm text-slate-400">
                        Content Type
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                        {content.type}
                    </p>
                </div>

                <div
                    className="
            rounded-xl
            border
            border-slate-800
            bg-slate-950/40
            p-5
          "
                >
                    <p className="text-sm text-slate-400">
                        Lesson
                    </p>

                    <p className="mt-2 truncate text-lg font-semibold">
                        {content.lesson?.title ??
                            "Current Lesson"}
                    </p>
                </div>

                <div
                    className="
            rounded-xl
            border
            border-slate-800
            bg-slate-950/40
            p-5
          "
                >
                    <p className="text-sm text-slate-400">
                        Display Order
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                        #{content.order ?? 1}
                    </p>
                </div>
            </div>
        </div>
    );
}