"use client";

import Link from "next/link";
import UserAvatar from "@/components/admin/users/UserAvatar";

/**
 * The newest sign-ups, so an admin can see who just arrived.
 *
 * The role is a read-only indicator rendered as plain muted text — it was a
 * filled pill, which reads as something you can press.
 */
export default function RecentUsers({ users = [], isLoading }) {
  if (isLoading) {
    return <div className="h-full min-h-[13rem] animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent sign-ups</h2>
        <Link
          href="/admin/students"
          className="inline-flex min-h-11 shrink-0 items-center text-xs font-medium text-link hover:text-link-hover hover:underline"
        >
          View all
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No one has signed up yet.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {users.slice(0, 5).map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{user.role}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
