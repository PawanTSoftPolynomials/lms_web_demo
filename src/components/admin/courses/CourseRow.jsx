"use client";

import Image from "next/image";

import ActionMenu from "@/components/menus/ActionMenu";

export default function CourseRow({
                                      course,
                                      onView,
                                      onEdit,
                                      onDelete,
                                  }) {
    const createdAt = new Date(
        course.createdAt
    ).toLocaleDateString();

    const statusColors = {
        PUBLISHED:
            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        DRAFT:
            "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
        ARCHIVED:
            "bg-red-500/15 text-red-400 border border-red-500/20",
    };

    return (
        <tr className="border-b border-white/5 transition hover:bg-white/5">
            {/* Course */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-white/10">
                        <Image
                            src={
                                course.thumbnailUrl
                            }
                            alt={course.title}
                            fill
                            sizes="80px"
                            className="object-cover bg-slate-800"
                        />
                    </div>

                    <div className="max-w-xs">
                        <p className="line-clamp-1 font-semibold text-white">
                            {course.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                            {
                                course.description
                            }
                        </p>
                    </div>
                </div>
            </td>

            {/* Category */}
            <td className="px-6 py-4 text-gray-300">
                {course.category}
            </td>

            {/* Level */}
            <td className="px-6 py-4">
        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400">
          {course.level}
        </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusColors[
                    course.status
                    ] ||
                "bg-gray-700 text-white"
            }`}
        >
          {course.status}
        </span>
            </td>

            {/* Creator */}
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-white">
                        {
                            course.creator
                                ?.name
                        }
                    </p>

                    <p className="text-sm text-gray-400">
                        {
                            course.creator
                                ?.email
                        }
                    </p>
                </div>
            </td>

            {/* Created */}
            <td className="px-6 py-4 text-gray-400">
                {createdAt}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <ActionMenu
                    items={[
                        {
                            label: "View",
                            onClick: () =>
                                onView?.(course),
                        },
                        {
                            label: "Edit",
                            onClick: () =>
                                onEdit?.(course),
                        },
                        {
                            label: "Delete",
                            danger: true,
                            onClick: () =>
                                onDelete?.(
                                    course
                                ),
                        },
                    ]}
                />
            </td>
        </tr>
    );
}