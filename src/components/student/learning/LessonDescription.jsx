"use client";

import {
    BookOpen,
    FileText,
    Layers,
} from "lucide-react";

export default function LessonDescription({
                                              lesson,
                                          }) {
    if (!lesson) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-600"/>

                <h2 className="mt-4 text-xl font-semibold text-white">
                    No Lesson Selected
                </h2>

                <p className="mt-2 text-slate-400">
                    Select a lesson from the course sidebar to begin learning.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900">
            {/* Header */}
            <div className="border-b border-slate-800 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500/10 p-3">
                        <BookOpen className="h-5 w-5 text-orange-500"/>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {lesson.title}
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Lesson Details
                        </p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-8 p-6">
                <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                        <FileText className="h-5 w-5 text-orange-500"/>
                        Description
                    </h3>

                    <p className="whitespace-pre-line leading-8 text-slate-300">
                        {lesson.description ||
                            "No description available for this lesson."}
                    </p>
                </div>

                <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                        <Layers className="h-5 w-5 text-orange-500"/>
                        Lesson Information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-sm text-slate-400">
                                Contents
                            </p>

                            <h4 className="mt-2 text-xl font-semibold text-white">
                                {lesson.contents?.length || 0}
                            </h4>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-sm text-slate-400">
                                Lesson Order
                            </p>

                            <h4 className="mt-2 text-xl font-semibold text-white">
                                #{lesson.order ?? "-"}
                            </h4>
                        </div>
                    </div>
                </div>

                {lesson.contents?.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-white">
                            Available Content
                        </h3>

                        <div className="space-y-3">
                            {lesson.contents.map((content) => (
                                <div
                                    key={content.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium text-white">
                                            {content.title}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {content.type}
                                        </p>
                                    </div>

                                    <span
                                        className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                    {content.type}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}