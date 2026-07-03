"use client";

import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    Clock3,
} from "lucide-react";

import ProgressBar from "@/components/student/courses/ProgressBar";

export default function LearnHeader({
                                        course,
                                        progress = 0,
                                    }) {
    if (!course) return null;

    const totalLessons =
        course.modules?.reduce(
            (total, module) =>
                total + (module.lessons?.length || 0),
            0
        ) || 0;

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left */}
                <div className="space-y-4">
                    <Link
                        href="/student/my-courses"
                        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-orange-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Courses
                    </Link>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {course.title}
                        </h1>

                        <p className="mt-2 max-w-3xl text-slate-400">
                            {course.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            {course.modules?.length || 0} Modules
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-orange-500" />
                            {totalLessons} Lessons
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="w-full max-w-xs space-y-3">
                    <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Course Progress
            </span>

                        <span className="font-semibold text-orange-400">
              {progress}%
            </span>
                    </div>

                    <ProgressBar value={progress} />

                    <p className="text-xs text-slate-500">
                        Complete every lesson to finish
                        this course.
                    </p>
                </div>
            </div>
        </div>
    );
}