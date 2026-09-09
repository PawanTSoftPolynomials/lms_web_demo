"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { useLandingData } from "@/hooks/queries/useLandingData";
import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";
import Eyebrow from "@/components/ui/Eyebrow";

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <div className="flex-1 space-y-3 p-6">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCourses() {
  const { data, isLoading, isError } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);
  const [activeCategory, setActiveCategory] = useState("All");

  // Real categories only — derived from the courses actually returned by
  // the backend, never invented. Doubles as a working "browse by category"
  // filter using data already in memory (no extra request, no fake search).
  const categories = useMemo(() => {
    const found = new Set();
    allCourses.forEach((course) => {
      if (course.category) found.add(course.category);
    });
    return ["All", ...Array.from(found)];
  }, [allCourses]);

  const courses = activeCategory === "All"
    ? allCourses
    : allCourses.filter((course) => course.category === activeCategory);

  return (
    <section id="courses" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>Our Courses</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore what you can learn
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Recently published courses, ready to start today.
          </p>
        </div>

        <Link
          href="/register"
          className="flex shrink-0 items-center gap-1 text-sm font-bold uppercase tracking-wider text-primary hover:brightness-110"
        >
          View All Courses
          <ArrowRight size={15} />
        </Link>
      </div>

      {!isLoading && !isError && categories.length > 2 && (
        <div className="scrollbar-none mb-8 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : isError || allCourses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={22} />
          </span>
          <p className="text-sm font-semibold text-foreground">
            {isError ? "Courses are temporarily unavailable." : "New courses are on the way."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {isError
              ? "We couldn't load the course catalogue just now — please check back in a moment."
              : "Check back soon, or create an account to be notified when new courses publish."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <FeaturedCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
