"use client";

import Link from "next/link";

import {
    FaBookOpen,
    FaEdit,
    FaFileAlt,
} from "react-icons/fa";

export default function LessonHeader({
                                         lesson,
                                         courseId,
                                         moduleId,
                                     }) {
    return (
        <div
            className="
        rounded-2xl
        border
        border-slate-800
        bg-gradient-to-br from-slate-900 to-slate-950
        p-5
        shadow-lg
      "
        >
            {/* Top */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-orange-500/15
                text-orange-400
                shrink-0
              "
                        >
                            <FaBookOpen size={18} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {lesson.title}
                            </h1>

                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Lesson Details
                            </p>
                        </div>
                    </div>

                    <p className="max-w-4xl text-sm text-slate-400 leading-relaxed mt-1">
                        {lesson.description}
                    </p>
                </div>

                <Link
                    href={courseId && moduleId ? `/instructor/courses/${courseId}/modules/${moduleId}/lessons/edit/${lesson.id}` : `/instructor/lessons/edit/${lesson.id}`}
                    className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-orange-500
            hover:bg-orange-600
            text-slate-950
            font-extrabold
            text-xs
            px-5
            py-2.5
            transition
            shadow-lg
            shadow-orange-500/10
            active:scale-95
            shrink-0
          "
                >
                    <FaEdit size={12} />

                    Edit Lesson
                </Link>
            </div>

            {/* Stats */}
            <div className="mt-5 grid gap-3.5 md:grid-cols-3">
                <div
                    className="
            rounded-xl
            border
            border-slate-800/80
            bg-slate-950/40
            p-3
            px-4.5
          "
                >
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                        Lesson Order
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-200">
                        #{lesson.order}
                    </p>
                </div>

                <div
                    className="
            rounded-xl
            border
            border-slate-800/80
            bg-slate-950/40
            p-3
            px-4.5
          "
                >
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                        Module
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-slate-200">
                        {lesson.module?.title ??
                            "Current Module"}
                    </p>
                </div>

                <div
                    className="
            rounded-xl
            border
            border-slate-800/80
            bg-slate-950/40
            p-3
            px-4.5
          "
                >
                    <div className="flex items-center gap-1.5">
                        <FaFileAlt className="text-orange-400" size={12} />

                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                            Contents
                        </p>
                    </div>

                    <p className="mt-1 text-xl font-black text-slate-200">
                        {lesson.contents?.length ??
                            0}
                    </p>
                </div>
            </div>
        </div>
    );
}