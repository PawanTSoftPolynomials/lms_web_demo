"use client";

import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

import Button from "@/components/ui/Button";

export default function LessonNavigation({
                                             previousLesson,
                                             nextLesson,
                                             activeLesson,
                                             onPrevious,
                                             onNext,
                                             onComplete,
                                             isCompleting = false,
                                         }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Previous */}
                <div>
                    {previousLesson ? (
                        <Button
                            onClick={onPrevious}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Previous Lesson
                        </Button>
                    ) : (
                        <Button disabled>
                            First Lesson
                        </Button>
                    )}
                </div>

                {/* Current Lesson */}
                <div className="text-center">
                    <p className="text-sm text-slate-400">
                        Current Lesson
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-white">
                        {activeLesson?.title ||
                            "No Lesson Selected"}
                    </h3>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-3">
                    <Button
                        onClick={onComplete}
                        disabled={
                            !activeLesson || isCompleting
                        }
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle2 className="h-4 w-4" />

                        {isCompleting
                            ? "Completing..."
                            : "Mark Complete"}
                    </Button>

                    {nextLesson ? (
                        <Button
                            onClick={onNext}
                            className="flex items-center gap-2"
                        >
                            Next Lesson
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button disabled>
                            Last Lesson
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}