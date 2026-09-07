"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

const STATUS_COLORS = {
    "Top Performer":
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    "Behind Average":
        "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    "Struggling":
        "bg-red-500/15 text-red-400 border border-red-500/20",
    "Not Started":
        "bg-muted text-muted-foreground border border-border",
};

export default function StudentRow({
                                       student,
                                       onView,
                                       onDelete,
                                       onChangeRole,
                                   }) {
    return (
        <tr
            onClick={() => onView?.(student)}
            className="hover:bg-foreground/5 cursor-pointer transition"
        >
            {/* Student */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={student.name}
                    />

                    <div>
                        <p className="font-medium text-foreground">
                            {student.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {student.email}
                        </p>
                    </div>
                </div>
            </td>

            {/* Course */}
            <td className="px-6 py-4 text-muted-foreground">
                {student.course || "-"}
            </td>

            {/* Progress */}
            <td className="px-6 py-4 text-muted-foreground">
                {student.progress ?? 0}%
            </td>

            {/* Status */}
            <td className="px-6 py-4">
        <span
            className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${
                STATUS_COLORS[
                    student.status
                    ] ||
                "bg-muted text-foreground"
            }
          `}
        >
          {student.status}
        </span>
            </td>

            {/* Joined */}
            <td className="px-6 py-4 text-muted-foreground">
                {student.joinedDate || "-"}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                    items={[
                        {
                            label: "View",
                            onClick: () =>
                                onView?.(student),
                        },
                        {
                            label: "Change Role",
                            onClick: () =>
                                onChangeRole?.(student),
                        },
                        {
                            label: "Delete",
                            danger: true,
                            onClick: () =>
                                onDelete?.(student),
                        },
                    ]}
                />
            </td>
        </tr>
    );
}
