"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { PendingAction } from "@/types/instructor-dashboard";

/**
 * The home page's lead section: everything the instructor can act on right
 * now, ordered by urgency (deriveNeedsAttention already sorts high -> low and
 * drops anything with a count of 0).
 *
 * Every row is a navigation link to the screen that resolves it, so the whole
 * row is an anchor and carries link colour — no bordered pills, no buttons
 * that only look like they do something.
 */

// Severity reads off the count and the accent dot alone. These are indicators,
// not controls, so they stay borderless.
const SEVERITY_DOT: Record<PendingAction["severity"], string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground",
};

const SEVERITY_ICON: Record<PendingAction["severity"], string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function NeedsAttentionPanel({
  actions,
  isLoading,
}: {
  actions: PendingAction[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <div className="h-44 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Needs your attention
        </h2>
        {actions.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {actions.length} {actions.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="flex items-center gap-3 py-6">
          <CheckCircle2 size={20} className="shrink-0 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">You&rsquo;re all caught up</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Nothing is waiting on you. Good time to build out a course.
            </p>
          </div>
        </div>
      ) : (
        <ul className="-mx-2 divide-y divide-border">
          {actions.map((action) => (
            <li key={action.id}>
              <Link
                href={action.href}
                className="group flex min-h-11 items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-muted"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[action.severity]}`}
                  aria-hidden
                />
                <action.icon
                  size={17}
                  className={`shrink-0 ${SEVERITY_ICON[action.severity]}`}
                  aria-hidden
                />
                {/* Wraps to a second line rather than truncating: these labels
                    carry counts and a class time, and "Live class today: Graph
                    algo..." loses exactly the part that matters. */}
                <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">
                  {action.label}
                </span>
                <span className="shrink-0 self-center text-sm font-medium text-link group-hover:text-link-hover group-hover:underline">
                  Open
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
