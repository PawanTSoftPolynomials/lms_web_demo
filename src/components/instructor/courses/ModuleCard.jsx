"use client";

import ActionMenu from "@/components/menus/ActionMenu";

export default function ModuleCard({
                                       module,
                                       onManage,
                                       onLessons,
                                       onQuizzes,
                                       onEdit,
                                       onDelete,
                                   }) {
    return (
        <div
            className="
        flex
        min-h-[220px]
        flex-col
        justify-between
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-5
        transition
        hover:border-orange-500
      "
        >
            <div>
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-white">
                            {module.title}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                Order {module.order}
              </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    module.isPublished
                                        ? "bg-green-500/15 text-green-400"
                                        : "bg-yellow-500/15 text-yellow-400"
                                }`}
                            >
                {module.isPublished
                    ? "Published"
                    : "Draft"}
              </span>
                        </div>
                    </div>

                    <ActionMenu
                        items={[
                            {
                                label: "Lessons",
                                onClick: () => onLessons(module),
                            },
                            {
                                label: "Quizzes",
                                onClick: () => onQuizzes(module),
                            },
                            {
                                label: "Edit",
                                onClick: () => onEdit(module),
                            },
                            {
                                label: "Delete",
                                onClick: () => onDelete(module),
                            },
                        ]}
                    />
                </div>

                <p className="line-clamp-4 text-sm text-slate-400">
                    {module.description || "No description available."}
                </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    Module #{module.order}
                </div>

                <button
                    onClick={() => onManage(module)}
                    className="
            rounded-lg
            bg-orange-500
            px-5
            py-2.5
            font-medium
            text-white
            transition
            hover:bg-orange-600
          "
                >
                    Manage Module
                </button>
            </div>
        </div>
    );
}