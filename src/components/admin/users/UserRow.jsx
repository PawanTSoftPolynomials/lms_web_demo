"use client";

import UserAvatar from "./UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

export default function UserRow({ user, onView, onEdit, onDelete }) {
  const roleColors = {
    ADMIN: "bg-red-500/15 text-red-400 border border-red-500/20",
    INSTRUCTOR: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    STUDENT: "bg-green-500/15 text-green-400 border border-green-500/20",
  };

  const statusColors = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    INACTIVE: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
    BLOCKED: "bg-red-500/15 text-red-400 border border-red-500/20",
  };

  const createdAt = new Date(user.createdAt).toLocaleDateString();

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} />

          <div>
            <p className="font-medium text-white">{user.name}</p>

            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${roleColors[user.role] || "bg-gray-700 text-white"}
          `}
        >
          {user.role}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${statusColors[user.status] || "bg-gray-700 text-white"}
          `}
        >
          {user.status}
        </span>
      </td>

      <td className="px-6 py-4 text-gray-400">{createdAt}</td>

      <td className="px-6 py-4 text-right">
        <ActionMenu
          items={[
            {
              label: "View",
              onClick: () => onView?.(user),
            },
            {
              label: "Edit",
              onClick: () => onEdit?.(user),
            },
            {
              label: "Delete",
              danger: true,
              onClick: () => onDelete?.(user),
            },
          ]}
        />
      </td>
    </tr>
  );
}
