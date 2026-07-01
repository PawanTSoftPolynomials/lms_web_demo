"use client";

import ActionMenu from "@/components/menus/ActionMenu";

import EnrollmentRow from "./EnrollmentRow";

export default function EnrollmentTable({
                                            enrollments = [],
                                            onView,
                                            onDelete,
                                        }) {
    if (!enrollments.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-white">
                    No Enrollments Found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                    There are no enrollments available.
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
                            Student
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Course
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Phone
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Enrolled On
                        </th>

                        <th className="px-6 py-4 text-right font-medium">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                    {enrollments.map(
                        (enrollment) => (
                            <EnrollmentRow
                                key={
                                    enrollment.id
                                }
                                enrollment={
                                    enrollment
                                }
                                onView={onView}
                                onDelete={
                                    onDelete
                                }
                            />
                        )
                    )}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
                {enrollments.map(
                    (enrollment) => (
                        <div
                            key={
                                enrollment.id
                            }
                            className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {
                                            enrollment
                                                .student
                                                ?.user
                                                ?.name
                                        }
                                    </h3>

                                    <p className="break-all text-xs text-gray-400">
                                        {
                                            enrollment
                                                .student
                                                ?.user
                                                ?.email
                                        }
                                    </p>
                                </div>

                                <ActionMenu
                                    items={[
                                        {
                                            label:
                                                "View",
                                            onClick:
                                                () =>
                                                    onView?.(
                                                        enrollment
                                                    ),
                                        },
                                        {
                                            label:
                                                "Delete",
                                            danger: true,
                                            onClick:
                                                () =>
                                                    onDelete?.(
                                                        enrollment
                                                    ),
                                        },
                                    ]}
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-400">
                                        Course
                                    </p>

                                    <span className="font-medium text-white">
                    {
                        enrollment
                            .course
                            ?.title
                    }
                  </span>
                                </div>

                                <div>
                                    <p className="text-gray-400">
                                        Phone
                                    </p>

                                    <span className="text-white">
                    {enrollment
                            .student
                            ?.phone ||
                        "-"}
                  </span>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-gray-400">
                                        Enrolled
                                    </p>

                                    <span className="text-white">
                    {new Date(
                        enrollment.enrolledAt
                    ).toLocaleDateString()}
                  </span>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    );
}