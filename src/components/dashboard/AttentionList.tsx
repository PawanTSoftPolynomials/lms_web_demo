"use client";

import Link from "next/link";
import { CheckCircle2, type LucideIcon } from "lucide-react";

/**
 * The "what is waiting on me" panel that leads both the Instructor and the
 * Admin home pages.
 *
 * Each role derives its own items — the instructor's come from
 * deriveNeedsAttention, the admin's from deriveAdminReviewQueue — but the
 * presentation is identical, so it lives here once rather than as a near-copy
 * in each role folder.
 *
 * Every row is a whole-row anchor to the screen that clears the item: these are
 * navigation, so they carry link colour, and the severity marker is a plain
 * borderless dot because it is an indicator, not a control.
 */
export interface AttentionItem {
  id: string;
  /** The headline: what is waiting, including the count. */
  label: string;
  /** Optional second line explaining why it matters. */
  detail?: string;
  severity: "high" | "medium" | "low";
  href: string;
  icon?: LucideIcon;
}

const SEVERITY_DOT: Record<AttentionItem["severity"], string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-muted-foreground",
};

const SEVERITY_ICON: Record<AttentionItem["severity"], string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function AttentionList({
  items,
  isLoading,
  title = "Needs your attention",
  emptyTitle = "You’re all caught up",
  emptyDescription = "Nothing is waiting on you right now.",
}: {
  items: AttentionItem[];
  isLoading?: boolean;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isLoading) {
    return <div className="h-44 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {items.length > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 py-6">
          <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{emptyDescription}</p>
          </div>
        </div>
      ) : (
        <ul className="-mx-2 divide-y divide-border">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex min-h-11 items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-muted"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[item.severity]}`}
                    aria-hidden
                  />
                  {Icon && (
                    <Icon size={17} className={`shrink-0 ${SEVERITY_ICON[item.severity]}`} aria-hidden />
                  )}

                  {/* Wraps rather than truncating: these labels carry counts and
                      times, and it is exactly the tail that gets clipped. */}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug text-foreground">{item.label}</span>
                    {item.detail && (
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {item.detail}
                      </span>
                    )}
                  </span>

                  <span className="shrink-0 self-center text-sm font-medium text-link group-hover:text-link-hover group-hover:underline">
                    Open
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
