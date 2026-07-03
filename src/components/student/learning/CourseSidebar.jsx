"use client";

import {useState} from "react";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    PlayCircle,
} from "lucide-react";

export default function CourseSidebar({
                                          modules = [],
                                          activeLesson,
                                          setActiveLesson,
                                          completedLessons = [],
                                      }) {
    const [expandedModules, setExpandedModules] = useState(
        modules.map((module) => module.id)
    );

    const toggleModule = (moduleId) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <aside className="h-[720px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900">
            <div className="sticky top-0 border-b border-slate-800 bg-slate-900 px-5 py-4">
                <h2 className="text-xl font-semibold text-white">
                    Course Content
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    {modules.length} Modules
                </p>
            </div>

            <div className="divide-y divide-slate-800">
                {modules.map((module, moduleIndex) => {
                    const expanded =
                        expandedModules.includes(module.id);

                    return (
                        <div key={module.id}>
                            <button
                                onClick={() =>
                                    toggleModule(module.id)
                                }
                                className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-slate-800/50"
                            >
                                <div className="text-left">
                                    <h3 className="font-semibold text-white">
                                        Module {moduleIndex + 1}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {module.title}
                                    </p>
                                </div>

                                {expanded ? (
                                    <ChevronDown className="h-5 w-5 text-slate-400"/>
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-slate-400"/>
                                )}
                            </button>

                            {expanded && (
                                <div className="space-y-1 pb-3">
                                    {(module.lessons || []).map(
                                        (lesson, lessonIndex) => {
                                            const active =
                                                activeLesson?.id ===
                                                lesson.id;

                                            const completed =
                                                completedLessons.includes(
                                                    lesson.id
                                                );

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() =>
                                                        setActiveLesson(lesson)
                                                    }
                                                    className={`mx-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                                                        active
                                                            ? "bg-orange-600 text-white"
                                                            : "hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {completed ? (
                                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400"/>
                                                    ) : (
                                                        <PlayCircle
                                                            className={`h-5 w-5 shrink-0 ${
                                                                active
                                                                    ? "text-white"
                                                                    : "text-orange-400"
                                                            }`}
                                                        />
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium">
                                                            Lesson {lessonIndex + 1}
                                                        </p>

                                                        <p
                                                            className={`truncate text-sm ${
                                                                active
                                                                    ? "text-orange-100"
                                                                    : "text-slate-400"
                                                            }`}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}

                                    {module.lessons?.length ===
                                        0 && (
                                            <div className="px-5 pb-3 text-sm text-slate-500">
                                                No lessons available
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {modules.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No modules found.
                    </div>
                )}
            </div>
        </aside>
    );
}