"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

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
