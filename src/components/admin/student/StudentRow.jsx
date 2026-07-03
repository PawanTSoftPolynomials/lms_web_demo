"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

export default function StudentRow({
                                       student,
                                       onView,
                                       onDelete,
                                   }) {
    const createdAt = new Date(
        student.createdAt
    ).toLocaleDateString();

    const statusColors = {
        ACTIVE:
            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        INACTIVE:
            "bg-gray-500/15 text-gray-400 border border-gray-500/20",
        BLOCKED:
            "bg-red-500/15 text-red-400 border border-red-500/20",
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition">
            {/* Student */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={student.user.name}
                    />

                    <div>
                        <p className="font-medium text-white">
                            {student.user.name}
                        </p>

                        <p className="text-sm text-gray-400">
                            {student.user.email}
                        </p>
                    </div>
                </div>
            </td>

            {/* Phone */}
            <td className="px-6 py-4 text-gray-300">
                {student.phone || "-"}
            </td>

            {/* Education */}
            <td className="px-6 py-4 text-gray-300">
                {student.education || "-"}
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
                statusColors[
                    student.user.status
                    ] ||
                "bg-gray-700 text-white"
            }
          `}
        >
          {student.user.status}
        </span>
            </td>

            {/* Joined */}
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
                                onView?.(student),
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