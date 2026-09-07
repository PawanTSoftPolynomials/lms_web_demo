"use client";

import ActionMenu from "@/components/menus/ActionMenu";
import CourseStatusBadge from "@/components/courses/CourseStatusBadge";

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
                <h3 className="text-lg font-semibold text-foreground">
                    No Courses Found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    There are no courses available.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop & Tablet */}
            <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black text-left">
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
                    <tbody className="divide-y divide-border">
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
                        className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:bg-foreground/5 transition"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-3">
                                <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-border">

                                </div>

                                <div>
                                    <h3 className="line-clamp-2 font-semibold text-foreground">
                                        {course.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-muted-foreground">
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

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Category
                                </p>

                                <span className="font-medium text-foreground">
                  {course.category}
                </span>
                            </div>

                            <div>
                                <p className="text-muted-foreground">
                                    Level
                                </p>

                                <span className="font-medium text-foreground">
                  {course.level}
                </span>
                            </div>

                            <div>
                                <p className="text-muted-foreground">
                                    Status
                                </p>

                                <CourseStatusBadge status={course.status} />
                            </div>

                            <div>
                                <p className="text-muted-foreground">
                                    Created
                                </p>

                                <span className="text-foreground">
                  {new Date(
                      course.createdAt
                  ).toLocaleDateString()}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Description
                                </p>

                                <p className="mt-1 line-clamp-3 text-foreground">
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