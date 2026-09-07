"use client";


import ActionMenu from "@/components/menus/ActionMenu";
import CourseStatusBadge from "@/components/courses/CourseStatusBadge";

export default function CourseRow({
                                      course,
                                      onView,
                                      onEdit,
                                      onDelete,
                                  }) {
    const createdAt = new Date(
        course.createdAt
    ).toLocaleDateString();

    return (
        <tr
            onClick={() => onView?.(course)}
            className="hover:bg-foreground/5 cursor-pointer transition"
        >
            {/* Course */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">


                    <div className="max-w-xs">
                        <p className="line-clamp-1 font-semibold text-foreground">
                            {course.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {
                                course.description
                            }
                        </p>
                    </div>
                </div>
            </td>

            {/* Category */}
            <td className="px-6 py-4 text-muted-foreground">
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
                <CourseStatusBadge status={course.status} />
            </td>

            {/* Creator */}
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-foreground">
                        {
                            course.creator
                                ?.name
                        }
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {
                            course.creator
                                ?.email
                        }
                    </p>
                </div>
            </td>

            {/* Created */}
            <td className="px-6 py-4 text-muted-foreground">
                {createdAt}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
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