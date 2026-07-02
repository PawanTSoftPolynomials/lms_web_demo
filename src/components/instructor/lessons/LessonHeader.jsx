"use client";

import Link from "next/link";

import {
    FaBookOpen,
    FaEdit,
    FaFileAlt,
} from "react-icons/fa";

export default function LessonHeader({
                                         lesson,
                                     }) {
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
            {/* Top */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                        <div
                            className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-orange-500/15
                text-orange-400
              "
                        >
                            <FaBookOpen size={22} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {lesson.title}
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Lesson Details
                            </p>
                        </div>
                    </div>

                    <p className="max-w-4xl text-slate-400">
                        {lesson.description}
                    </p>
                </div>

                <Link
                    href={`/instructor/lessons/edit/${lesson.id}`}
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
                    <FaEdit />

                    Edit Lesson
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
                        Lesson Order
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                        #{lesson.order}
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
                        Module
                    </p>

                    <p className="mt-2 truncate text-lg font-semibold">
                        {lesson.module?.title ??
                            "Current Module"}
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
                    <div className="flex items-center gap-2">
                        <FaFileAlt className="text-orange-400" />

                        <p className="text-sm text-slate-400">
                            Contents
                        </p>
                    </div>

                    <p className="mt-2 text-2xl font-bold">
                        {lesson.contents?.length ??
                            0}
                    </p>
                </div>
            </div>
        </div>
    );
}