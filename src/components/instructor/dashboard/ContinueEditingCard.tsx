"use client";

import Link from "next/link";
import { FilePlus2, PenLine } from "lucide-react";
import type { ContinueEditingItem } from "@/types/instructor-dashboard";

/**
 * "Pick up where you left off" — the most recently edited lesson across all of
 * the instructor's courses, with a single link straight back into it.
 *
 * Its data comes from the deferred GET /modules query, so this card is the one
 * part of the page that shows a skeleton after first paint. That is deliberate:
 * see useIdleAfterPaint in hooks/queries/instructor/useDashboardHome.ts.
 */
export function ContinueEditingCard({
  item,
  isLoading,
}: {
  item: ContinueEditingItem | null;
  isLoading?: boolean;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Pick up where you left off
      </h2>

      {isLoading ? (
        <div className="mt-4 space-y-2.5">
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      ) : item ? (
        <div className="mt-4 flex flex-1 flex-col">
          {/* Breadcrumb of where this lesson lives, smallest first so the eye
              lands on the lesson title below it rather than the course. */}
          <p className="truncate text-xs text-muted-foreground">
            {item.courseTitle} <span aria-hidden>&rsaquo;</span> {item.moduleTitle}
          </p>

          <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
            {item.lessonTitle}
          </p>

          <p className="mt-1.5 text-xs text-muted-foreground">
            Edited {item.lastEditedLabel.toLowerCase()}
          </p>

          <Link
            href={item.href}
            className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-medium text-link hover:text-link-hover hover:underline"
          >
            <PenLine size={15} aria-hidden />
            Resume editing
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-sm text-muted-foreground">
            You haven&rsquo;t edited a lesson yet.
          </p>
          <Link
            href="/instructor/courses"
            className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-medium text-link hover:text-link-hover hover:underline"
          >
            <FilePlus2 size={15} aria-hidden />
            Go to my courses
          </Link>
        </div>
      )}
    </section>
  );
}
