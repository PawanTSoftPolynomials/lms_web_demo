"use client";

import ActionMenu from "@/components/menus/ActionMenu";

import CourseRow from "./CourseRow";

export default function CourseTable({
                                        courses = [],
                                        onView,
                                        onEdit,
                                        onDelete,
                                    }) {
    if (!courses.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-white">
                    No Courses Found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                    There are no courses available.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop & Tablet */}
            <div className="hidden overflow-x-auto rounded-xl border border-white/10 md:block">
                <table className="min-w-full">
                    <thead className="bg-white/5">
                    <tr className="text-left text-sm uppercase tracking-wider text-gray-400">
                        <th className="px-6 py-4 font-medium">
                            Course
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Category
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Level
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Status
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Creator
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Created
                        </th>

                        <th className="px-6 py-4 text-right font-medium">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                    {courses.map((course) => (
                        <CourseRow
                            key={course.id}
                            course={course}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => onView?.(course)}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-3">
                                <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-white/10">

                                </div>

                                <div>
                                    <h3 className="line-clamp-2 font-semibold text-white">
                                        {course.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {course.creator
                                            ?.name || "-"}
                                    </p>
                                </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    items={[
                                        {
                                            label: "View",
                                            onClick: () =>
                                                onView?.(
                                                    course
                                                ),
                                        },
                                        {
                                            label: "Edit",
                                            onClick: () =>
                                                onEdit?.(
                                                    course
                                                ),
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
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400">
                                    Category
                                </p>

                                <span className="font-medium text-white">
                  {course.category}
                </span>
                            </div>

                            <div>
                                <p className="text-gray-400">
                                    Level
                                </p>

                                <span className="font-medium text-white">
                  {course.level}
                </span>
                            </div>

                            <div>
                                <p className="text-gray-400">
                                    Status
                                </p>

                                <span
                                    className={`font-medium ${
                                        course.status ===
                                        "PUBLISHED"
                                            ? "text-green-400"
                                            : "text-yellow-400"
                                    }`}
                                >
                  {course.status}
                </span>
                            </div>

                            <div>
                                <p className="text-gray-400">
                                    Created
                                </p>

                                <span className="text-white">
                  {new Date(
                      course.createdAt
                  ).toLocaleDateString()}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-gray-400">
                                    Description
                                </p>

                                <p className="mt-1 line-clamp-3 text-white">
                                    {
                                        course.description
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}