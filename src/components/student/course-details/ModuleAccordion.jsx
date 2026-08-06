"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import Card from "@/components/ui/Card";
import LessonList from "./LessonList";

function formatDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return null;

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function getModuleDuration(module) {
    return (module.lessons || []).reduce(
        (sum, lesson) =>
            sum +
            (lesson.contents?.reduce(
                (contentSum, content) => contentSum + (content.duration || 0),
                0
            ) || 0),
        0
    );
}

export default function ModuleAccordion({
                                            modules = [],
                                        }) {
    const [expandedModuleId, setExpandedModuleId] = useState(
        modules.length ? modules[0].id : null
    );

    if (!modules.length) {
        return (
            <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold text-white">
                    No Modules Available
                </h3>

                <p className="mt-2 text-slate-400">
                    This course does not contain any
                    modules yet.
                </p>
            </Card>
        );
    }

    const toggleModule = (moduleId) => {
        setExpandedModuleId((previous) =>
            previous === moduleId ? null : moduleId
        );
    };

    return (
        <div className="space-y-3">
            <div className="px-1">
                <h2 className="text-lg font-semibold text-white">
                    Course Content{" "}
                    <span className="text-sm font-normal text-orange-400">
                        (Preview)
                    </span>
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    {modules.length} Module{modules.length !== 1 ? "s" : ""}
                </p>
            </div>

            <Card className="divide-y divide-slate-800 p-0">
                {modules.map((module, index) => {
                    const expanded = expandedModuleId === module.id;
                    const lessonCount = module.lessons?.length || 0;
                    const durationLabel = formatDuration(getModuleDuration(module));

                    return (
                        <div key={module.id}>
                            <button
                                type="button"
                                onClick={() => toggleModule(module.id)}
                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-800/40"
                            >
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-semibold text-white">
                                        Module {index + 1}: {module.title}
                                    </h3>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {lessonCount} Lesson{lessonCount !== 1 ? "s" : ""}
                                        {durationLabel ? ` • ${durationLabel}` : ""}
                                    </p>
                                </div>

                                {expanded ? (
                                    <ChevronDown className="h-4 w-4 shrink-0 text-orange-500" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 shrink-0 text-orange-500" />
                                )}
                            </button>

                            {expanded && (
                                <div className="border-t border-slate-800">
                                    <LessonList lessons={module.lessons} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </Card>
        </div>
    );
}
