"use client";

import {useState} from "react";
import {ChevronDown, ChevronRight} from "lucide-react";

import Card from "@/components/ui/Card";
import LessonList from "./LessonList";

export default function ModuleAccordion({
                                            modules = [],
                                        }) {
    const [expandedModules, setExpandedModules] =
        useState(
            modules.map((module) => module.id)
        );

    const toggleModule = (moduleId) => {
        setExpandedModules((previous) =>
            previous.includes(moduleId)
                ? previous.filter(
                    (id) => id !== moduleId
                )
                : [...previous, moduleId]
        );
    };

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

    return (
        <div className="space-y-4">
            {modules.map((module, index) => {
                const expanded =
                    expandedModules.includes(module.id);

                return (
                    <Card
                        key={module.id}
                        className="overflow-hidden p-0"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                toggleModule(module.id)
                            }
                            className="
                flex
                w-full
                items-center
                justify-between
                p-5
                text-left
                transition
                hover:bg-slate-800/50
              "
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Module {index + 1}:{" "}
                                    {module.title}
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    {module.description}
                                </p>

                                <p className="mt-3 text-xs text-orange-400">
                                    {module.lessons?.length || 0} Lesson
                                    {(module.lessons?.length || 0) !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            {expanded ? (
                                <ChevronDown className="h-5 w-5 text-orange-500"/>
                            ) : (
                                <ChevronRight className="h-5 w-5 text-orange-500"/>
                            )}
                        </button>

                        {expanded && (
                            <div className="border-t border-slate-800 px-5 py-4">
                                <LessonList
                                    lessons={module.lessons}
                                />
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}