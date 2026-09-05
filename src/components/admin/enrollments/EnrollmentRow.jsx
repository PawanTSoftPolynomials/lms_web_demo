"use client";

import ActionMenu from "@/components/menus/ActionMenu";

export default function EnrollmentRow({
                                          enrollment,
                                          onView,
                                          onDelete,
                                      }) {
    return (
        <tr className="hover:bg-foreground/5 transition">
            {/* Student */}
            <td className="px-6 py-4">
                <div>
                    <p className="font-semibold text-foreground">
                        {
                            enrollment.student?.user
                                ?.name
                        }
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {
                            enrollment.student?.user
                                ?.email
                        }
                    </p>
                </div>
            </td>

            {/* Course */}
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-foreground">
                        {
                            enrollment.course
                                ?.title
                        }
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {
                            enrollment.course
                                ?.description
                        }
                    </p>
                </div>
            </td>

            {/* Phone */}
            <td className="px-6 py-4 text-muted-foreground">
                {enrollment.student?.phone ||
                    "-"}
            </td>

            {/* Enrolled On */}
            <td className="px-6 py-4 text-muted-foreground">
                {new Date(
                    enrollment.enrolledAt
                ).toLocaleDateString()}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <ActionMenu
                    items={[
                        {
                            label: "View",
                            onClick: () =>
                                onView?.(
                                    enrollment
                                ),
                        },
                        {
                            label: "Delete",
                            danger: true,
                            onClick: () =>
                                onDelete?.(
                                    enrollment
                                ),
                        },
                    ]}
                />
            </td>
        </tr>
    );
}