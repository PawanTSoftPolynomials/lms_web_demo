"use client";

import Card from "@/components/ui/Card";
import UserAvatar from "@/components/admin/users/UserAvatar";

export default function RecentUsers({
  users = [],
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-6">
        Recent Users
      </h2>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border-b border-white/10 pb-4 last:border-none"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                name={user.name}
                size="sm"
              />

              <div>
                <p className="font-medium">
                  {user.name}
                </p>

                <p className="text-sm text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-1 rounded-full">
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}