"use client";

import {
    CheckCircle2,
    CirclePlay,
    Lock,
} from "lucide-react";

export default function LessonItem({
                                       lesson,
                                       index,
                                       active = false,
                                       completed = false,
                                       locked = false,
                                       onClick,
                                   }) {
    return (
        <button
            type="button"
            disabled={locked}
            onClick={onClick}
            className={`
        w-full
        rounded-xl
        border
        px-4
        py-3
        transition-all
        duration-200
        ${
                active
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-transparent hover:border-slate-700 hover:bg-slate-800/60"
            }
        ${
                locked
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
            }
      `}
        >
            <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-1 shrink-0">
                    {locked ? (
                        <Lock className="h-5 w-5 text-slate-500"/>
                    ) : completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500"/>
                    ) : (
                        <CirclePlay
                            className={`h-5 w-5 ${
                                active
                                    ? "text-orange-500"
                                    : "text-slate-400"
                            }`}
                        />
                    )}
                </div>

                {/* Lesson Details */}
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Lesson {index + 1}
                    </p>

                    <h4
                        className={`mt-1 font-medium ${
                            active
                                ? "text-orange-400"
                                : "text-white"
                        }`}
                    >
                        {lesson.title}
                    </h4>

                    {lesson.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                            {lesson.description}
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        {lesson.contents?.length > 0 && (
                            <span>
                {lesson.contents.length} Content
                                {lesson.contents.length > 1
                                    ? "s"
                                    : ""}
              </span>
                        )}

                        {completed && (
                            <span className="font-medium text-green-500">
                Completed
              </span>
                        )}

                        {active && (
                            <span className="font-medium text-orange-400">
                Currently Learning
              </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}