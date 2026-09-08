"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";

import { useLandingData } from "@/hooks/queries/useLandingData";
import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-3.5 space-y-3">
      <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function CourseDiscovery() {
  const { data, isLoading, isError } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...allCourses].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)),
    [allCourses]
  );
  const visibleCourses = showAll ? sorted : sorted.slice(0, 3);

  return (
    <section id="courses" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-12">
          <Eyebrow>Course Discovery</Eyebrow>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            Find something worth learning.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Real courses, built with structured modules and interactive assessments.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : isError || sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-border bg-card/40">
            <BookOpen size={24} className="text-muted-foreground mb-2" />
            <h3 className="text-sm font-bold text-foreground">No courses found</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              No courses published yet. Check back soon for new learning releases.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <p className="text-sm font-bold text-foreground">All courses</p>
              {!showAll && sorted.length > 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="text-xs font-extrabold uppercase tracking-wider !min-h-0 !py-2 inline-flex items-center gap-1.5"
                >
                  <span>Explore All</span>
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {visibleCourses.map((course) => (
                <FeaturedCourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
