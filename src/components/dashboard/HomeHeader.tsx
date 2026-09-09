"use client";

import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";

/**
 * The greeting row at the top of Instructor and Admin Home.
 *
 * Carries three things and nothing else: who you are, what today looks like in
 * one sentence, and the primary way into the work. The summary line is plain
 * prose rather than another row of tiles — the KPI strip below it already
 * covers the scannable numbers, and repeating them as a sentence is how the
 * page says "here is your day" instead of "here is your data".
 *
 * `summary` is a list of already-formatted fragments ("12 to review",
 * "2 drafts"); each role decides what belongs in its own line.
 */

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeHeader({
  name,
  summary = [],
  actionLabel,
  actionHref,
  actionIcon: ActionIcon = Plus,
}: {
  name?: string;
  summary?: string[];
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
}) {
  const now = new Date();
  const firstName = name?.trim().split(/\s+/)[0];

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const parts = summary.filter(Boolean);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {greetingFor(now)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dateLabel}
          {parts.length > 0 && ` · ${parts.join(" · ")}`}
        </p>
      </div>

      {/* Navigation, not an action — it goes to a screen rather than creating
          anything, so it is an anchor in link colour. */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-link transition hover:border-link/40 hover:bg-muted"
        >
          <ActionIcon size={16} aria-hidden />
          {actionLabel}
        </Link>
      )}
    </header>
  );
}
