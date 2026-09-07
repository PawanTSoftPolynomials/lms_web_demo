"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

export default function InstructorRow({
                                          instructor,
                                          onDelete,
                                          onChangeRole,
                                      }) {

    const statusColors = {
        ACTIVE:
            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        INACTIVE:
            "bg-muted text-muted-foreground border border-border",
        BLOCKED:
            "bg-red-500/15 text-red-400 border border-red-500/20",
    };

    return (
        <tr
            className="hover:bg-foreground/5 transition"
        >
            {/* Instructor */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={instructor.user.name}
                    />

                    <div>
                        <p className="font-medium text-foreground">
                            {instructor.user.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {instructor.user.email}
                        </p>
                    </div>
                </div>
            </td>

            {/* Specialization */}
            <td className="px-6 py-4 text-muted-foreground">
                {instructor.specialization ||
                    "-"}
            </td>

            {/* Qualification */}
            <td className="px-6 py-4 text-muted-foreground">
                {instructor.qualification ||
                    "-"}
            </td>

            {/* Experience */}
            <td className="px-6 py-4 text-muted-foreground">
                {instructor.experience != null
                    ? `${instructor.experience} Years`
                    : "-"}
            </td>

            {/* Status */}
            <td className="px-6 py-4">
        <span
            className={`
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            ${
                statusColors[
                    instructor.user.status
                    ] ||
                "bg-muted text-foreground"
            }
          `}
        >
          {instructor.user.status}
        </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                    items={[
                        {
                            label: "Change Role",
                            onClick: () =>
                                onChangeRole?.(
                                    instructor
                                ),
                        },
                        {
                            label: "Delete",
                            danger: true,
                            onClick: () =>
                                onDelete?.(
                                    instructor
                                ),
                        },
                    ]}
                />
            </td>
        </tr>
    );
}