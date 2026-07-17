"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

export default function InstructorRow({
                                          instructor,
                                          onView,
                                          onEdit,
                                          onDelete,
                                      }) {

    const statusColors = {
        ACTIVE:
            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        INACTIVE:
            "bg-gray-500/15 text-gray-400 border border-gray-500/20",
        BLOCKED:
            "bg-red-500/15 text-red-400 border border-red-500/20",
    };

    return (
        <tr
            onClick={() => onView?.(instructor)}
            className="border-b border-white/5 transition hover:bg-white/5 cursor-pointer"
        >
            {/* Instructor */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={instructor.user.name}
                    />

                    <div>
                        <p className="font-medium text-white">
                            {instructor.user.name}
                        </p>

                        <p className="text-sm text-gray-400">
                            {instructor.user.email}
                        </p>
                    </div>
                </div>
            </td>

            {/* Specialization */}
            <td className="px-6 py-4 text-gray-300">
                {instructor.specialization ||
                    "-"}
            </td>

            {/* Qualification */}
            <td className="px-6 py-4 text-gray-300">
                {instructor.qualification ||
                    "-"}
            </td>

            {/* Experience */}
            <td className="px-6 py-4 text-gray-300">
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
                "bg-gray-700 text-white"
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
                            label: "View",
                            onClick: () =>
                                onView?.(
                                    instructor
                                ),
                        },
                        {
                            label: "Edit",
                            onClick: () =>
                                onEdit?.(
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