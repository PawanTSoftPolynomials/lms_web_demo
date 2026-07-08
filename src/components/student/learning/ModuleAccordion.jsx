"use client";

import {useState} from "react";
import {
    ChevronDown,
    ChevronRight,
} from "lucide-react";

import LessonItem from "./LessonItem";

export default function ModuleAccordion({
                                            module,
                                            index,
                                            activeLesson,
                                            setActiveLesson,
                                            completedLessons = [],
                                        }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border-b border-slate-800 last:border-b-0">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-slate-800/50"
            >
                <div className="text-left">
                    <h3 className="font-semibold text-white">
                        Module {index + 1}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        {module.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {module.lessons?.length || 0} Lessons
                    </p>
                </div>

                {expanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400"/>
                ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400"/>
                )}
            </button>

            {expanded && (
                <div className="space-y-1 px-3 pb-3">
                    {module.lessons?.length ? (
                        module.lessons.map((lesson, lessonIndex) => (
                            <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                index={lessonIndex}
                                active={activeLesson?.id === lesson.id}
                                completed={completedLessons.includes(
                                    lesson.id
                                )}
                                onClick={() =>
                                    setActiveLesson(lesson)
                                }
                            />
                        ))
                    ) : (
                        <div className="rounded-lg bg-slate-800/40 p-4 text-center text-sm text-slate-500">
                            No lessons available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}