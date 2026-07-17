"use client";

import UserAvatar from "./UserAvatar";
import UserRow from "./UserRow";
import ActionMenu from "@/components/menus/ActionMenu";

export default function UserTable({
  users = [],
  onView,
  onEdit,
  onDelete,
}) {
  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold text-white">
          No Users Found
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          There are no users available.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop & Tablet */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr className="text-left text-sm uppercase tracking-wider text-gray-400">
              <th className="px-6 py-4 font-medium">
                User
              </th>

              <th className="px-6 py-4 font-medium">
                Role
              </th>

              <th className="px-6 py-4 font-medium">
                Status
              </th>

              <th className="px-6 py-4 font-medium">
                Joined
              </th>

              <th className="px-6 py-4 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
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
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onView?.(user)}
            className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <UserAvatar name={user.name} />

                <div>
                  <h3 className="font-semibold text-white">
                    {user.name}
                  </h3>

                  <p className="text-xs text-gray-400 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
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
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">
                  Role
                </p>

                <span className="font-medium text-white">
                  {user.role}
                </span>
              </div>

              <div>
                <p className="text-gray-400">
                  Status
                </p>

                <span
                  className={`font-medium ${
                    user.status === "ACTIVE"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <div className="col-span-2">
                <p className="text-gray-400">
                  Joined
                </p>

                <span className="text-white">
                  {new Date(
                    user.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}