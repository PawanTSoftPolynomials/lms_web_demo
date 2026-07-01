"use client";

import Card from "@/components/ui/Card";
import ModuleCard from "./ModuleCard";

export default function ModuleGrid({
                                       modules = [],
                                       onManage,
                                       onLessons,
                                       onQuizzes,
                                       onEdit,
                                       onDelete,
                                   }) {
    if (!modules.length) {
        return (
            <Card>
                <div className="py-12 text-center">
                    <h3 className="text-xl font-semibold text-white">
                        No Modules Found
                    </h3>

                    <p className="mt-2 text-slate-400">
                        Start by creating your first module.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {modules.map((module) => (
                <ModuleCard
                    key={module.id}
                    module={module}
                    onManage={onManage}
                    onLessons={onLessons}
                    onQuizzes={onQuizzes}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}