"use client";

import Image from "next/image";
import { BookOpen, Users, BarChart3 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useCourseStatusCounts } from "@/hooks/queries/instructor/useDashboardHome";

/**
 * The greeting banner at the top of Instructor > My Courses.
 *
 * Distinct from `HomeHeader`, which is deliberately prose-only ("the KPI strip
 * below it already covers the scannable numbers"). Here there is no KPI strip —
 * the page is a course grid — so the banner carries the three totals itself.
 *
 * Every number is server-computed by GET /courses/stats/mine. None of them is
 * derived from the course list this page renders: that list is paginated at 12,
 * so summing it would silently under-report for any instructor past one page.
 */
export default function InstructorWelcomeCard() {
  const { user } = useAuth();
  const { data, isLoading } = useCourseStatusCounts();

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "Instructor";

  // One word each: the tile is three numbers side by side in a column that can
  // get as narrow as ~100px, and "Total Courses" truncated to "T." there. The
  // figure already reads as a total, so the prefix only cost legibility.
  const stats = [
    { label: "Courses", value: data?.total, icon: BookOpen },
    { label: "Students", value: data?.students, icon: Users },
    { label: "Lessons", value: data?.lessons, icon: BarChart3 },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Ambient wash, same device the student dashboard hero uses — two blurred
          primary-tinted circles rather than a gradient on the surface itself, so
          the card keeps its normal `bg-card` in both themes. */}
      <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[70px]" />
      <div className="pointer-events-none absolute right-1/3 -bottom-28 h-64 w-64 rounded-full bg-primary/[0.07] blur-[70px]" />

      {/* Decoration only, so it is the first thing to go when width is scarce.
          It bleeds to the card's own edges rather than sitting inside the
          padding — the parent's rounded overflow does the clipping — and its
          left edge is masked to transparent so the artwork dissolves into the
          surface instead of reading as a second card pasted on top. */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 select-none lg:block xl:w-[22rem]"
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 55%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 55%)",
        }}
      >
        <Image
          src="/images/instructor_3d.jpg"
          alt=""
          fill
          sizes="352px"
          className="object-cover object-center"
          priority={false}
        />
      </div>

      {/* The right padding matches the artwork's width at each breakpoint, so the
          tiles stop exactly where it begins and never sit under it. */}
      {/* Side by side only from lg. Between md and lg the greeting still claimed
          max-w-sm while the tiles divided what was left of a ~768px card, which
          gave each one about 90px — the same squeeze as the narrow view. The
          greeting also gives width back at lg, where the artwork's pr-72 is
          already spoken for, and takes it again at xl. */}
      <div className="relative flex flex-col gap-6 px-5 py-6 md:px-10 md:py-7 lg:flex-row lg:items-center lg:gap-8 lg:pr-72 xl:pr-[22rem]">
        <div className="min-w-0 shrink-0 md:max-w-sm lg:max-w-[17rem] xl:max-w-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Welcome back
          </p>

          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Hi {firstName} !
            <span className="inline-block origin-bottom-right animate-wave" aria-hidden="true">
              👋
            </span>
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Keep creating amazing learning experiences. Pick a course to continue building.
          </p>
        </div>

        {/* Stacked below sm: three across a phone-width card left roughly 30px
            for the label, so every one of them truncated to "T.". */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 md:gap-3 lg:flex-1">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 px-3 py-3 md:px-4 backdrop-blur-sm"
            >
              <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                <Icon size={16} className="text-primary" aria-hidden />
              </div>

              <div className="min-w-0">
                {isLoading ? (
                  <div className="h-5 w-8 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-lg font-black leading-none text-foreground">
                    {(value ?? 0).toLocaleString()}
                  </p>
                )}
                <p className="mt-1 truncate text-[10.5px] font-semibold tracking-wide text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
