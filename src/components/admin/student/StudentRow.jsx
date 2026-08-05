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
        "bg-gray-500/15 text-gray-400 border border-gray-500/20",
};

export default function StudentRow({
                                       student,
                                       onView,
                                       onDelete,
                                   }) {
    return (
        <tr
            onClick={() => onView?.(student)}
            className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
        >
            {/* Student */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={student.name}
                    />

                    <div>
                        <p className="font-medium text-white">
                            {student.name}
                        </p>

                        <p className="text-sm text-gray-400">
                            {student.email}
                        </p>
                    </div>
                </div>
            </td>

            {/* Course */}
            <td className="px-6 py-4 text-gray-300">
                {student.course || "-"}
            </td>

            {/* Progress */}
            <td className="px-6 py-4 text-gray-300">
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
                "bg-gray-700 text-white"
            }
          `}
        >
          {student.status}
        </span>
            </td>

            {/* Joined */}
            <td className="px-6 py-4 text-gray-400">
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
