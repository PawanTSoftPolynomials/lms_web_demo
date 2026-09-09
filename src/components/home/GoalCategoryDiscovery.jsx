"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLandingData } from "@/hooks/queries/useLandingData";
import Eyebrow from "@/components/ui/Eyebrow";

export default function GoalCategoryDiscovery() {
  const { data, isLoading } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);

  // Real categories only — derived from real published courses, never a
  // fabricated fallback list, and never shown with a misleading "(0)".
  const categories = useMemo(() => {
    const counts = {};
    allCourses.forEach((c) => {
      const cat = c.category?.trim();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allCourses]);

  // Only hide once loading has genuinely finished with no real categories —
  // never during the loading window itself, which is what let this section
  // race ahead of its own data and render nothing.
  if (!isLoading && categories.length === 0) return null;

  return (
    <section id="discovery" className="scroll-mt-20 py-14 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Eyebrow>Explore by Domain</Eyebrow>
        <h2 className="mt-3 max-w-xl font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          What can you learn here?
        </h2>

        {isLoading ? (
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div className="h-9 w-40 animate-pulse rounded bg-muted" />
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="h-7 w-28 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-4">
            {categories.map(([cat, count], i) => (
              <Link
                key={cat}
                href="#courses"
                className={`group inline-flex items-baseline gap-2 font-display font-black tracking-tight text-foreground transition hover:text-primary ${
                  i === 0 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl text-foreground/70 hover:text-primary"
                }`}
              >
                <span>{cat}</span>
                <ArrowUpRight
                  size={i === 0 ? 20 : 15}
                  className="text-muted-foreground/50 transition group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
                <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground self-center">
                  {count} course{count === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
