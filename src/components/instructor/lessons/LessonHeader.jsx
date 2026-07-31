"use client";

import Link from "next/link";

import {
    FaBookOpen,
    FaEdit,
    FaFileAlt,
    FaRocket,
    FaUndo,
} from "react-icons/fa";

export default function LessonHeader({
                                         lesson,
                                         courseId,
                                         moduleId,
                                         onTogglePublish,
                                         isToggling = false,
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
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    {lesson.title}
                                </h1>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                        lesson.isPublished
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}
                                >
                                    {lesson.isPublished ? "Published" : "Draft"}
                                </span>
                            </div>

                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Lesson Details
                            </p>
                        </div>
                    </div>

                    <p className="max-w-4xl text-sm text-slate-400 leading-relaxed mt-1">
                        {lesson.description}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onTogglePublish}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-2 rounded-xl font-extrabold text-xs px-5 py-2.5 transition active:scale-95 shadow-lg disabled:opacity-50 ${
                            lesson.isPublished
                                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10"
                        }`}
                    >
                        {lesson.isPublished ? <FaUndo size={12} /> : <FaRocket size={12} />}
                        {isToggling
                            ? "Updating..."
                            : lesson.isPublished
                            ? "Unpublish"
                            : "Publish Lesson"}
                    </button>

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