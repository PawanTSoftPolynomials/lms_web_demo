"use client";

import {useRouter} from "next/navigation";

import ActionMenu from "@/components/menus/ActionMenu";

export default function LessonCard({
                                       lesson,
                                       onDelete,
                                   }) {
    const router = useRouter();

    return (
        <div
            onClick={() =>
                router.push(
                    `/instructor/lessons/${lesson.id}`
                )
            }
            className="
        cursor-pointer
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-500
      "
        >
            <div className="flex h-full flex-col justify-between">
                {/* Header */}
                <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="line-clamp-1 text-2xl font-semibold text-white">
                                {lesson.title}
                            </h3>

                            <p className="mt-2 line-clamp-3 text-slate-400">
                                {lesson.description}
                            </p>
                        </div>

                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <ActionMenu
                                items={[
                                    {
                                        label: "View",
                                        onClick: () =>
                                            router.push(
                                                `/instructor/lessons/${lesson.id}`
                                            ),
                                    },
                                    {
                                        label: "Edit",
                                        onClick: () =>
                                            router.push(
                                                `/instructor/lessons/edit/${lesson.id}`
                                            ),
                                    },
                                    {
                                        label: "Delete",
                                        onClick: () =>
                                            onDelete?.(lesson.id),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Lesson Order
                            </p>

                            <p className="font-semibold text-white">
                                #{lesson.order}
                            </p>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                router.push(
                                    `/instructor/lessons/${lesson.id}`
                                );
                            }}
                            className="
                rounded-lg
                bg-orange-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-orange-700
              "
                        >
                            Manage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}