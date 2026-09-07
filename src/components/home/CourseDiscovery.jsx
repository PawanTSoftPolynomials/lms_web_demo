"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Search, Star } from "lucide-react";

import { useLandingData } from "@/hooks/queries/useLandingData";
import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { getDisplayUrl } from "@/lib/blob";
import { getPriceInfo, formatPrice } from "@/lib/pricing";

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

function FeaturedCourse({ course }) {
  const sessionsCount = course.lessonsCount ?? course.modulesCount ?? 0;
  const { isFree, effectivePrice, listPrice, currency } = getPriceInfo(course.store);
  const rating = course.rating ? Number(course.rating) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-center mb-14 sm:mb-16">
      <Link
        href={`/courses/${course.id}`}
        className="lg:col-span-7 group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-muted shadow-lg shadow-black/10"
      >
        {course.thumbnailUrl && (
          <Image
            src={getDisplayUrl(course.thumbnailUrl)}
            alt={course.title}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-2xs font-bold uppercase tracking-wider text-primary-foreground">
          Featured Course
        </span>
      </Link>

      <div className="lg:col-span-5">
        <p className="text-2xs font-bold uppercase tracking-wider text-primary">{course.category || "Course"}</p>
        <h3 className="mt-2 font-display text-2xl sm:text-3xl font-black leading-tight tracking-tight text-foreground">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{course.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
          {rating !== null && (
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {course.reviewsCount ? ` (${course.reviewsCount})` : ""}
            </span>
          )}
          {sessionsCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers size={13} />
              {sessionsCount} lessons
            </span>
          )}
          {course.level && <span>{course.level}</span>}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="text-lg font-black text-foreground">
            {isFree ? "Free" : formatPrice(effectivePrice, currency)}
          </span>
          {listPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(listPrice, currency)}</span>
          )}
        </div>

        <Button asChild size="lg" className="mt-6 font-bold inline-flex items-center">
          <Link href={`/courses/${course.id}`}>
            <span>View Course</span>
            <ArrowRight size={15} className="ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CourseDiscovery() {
  const { data, isLoading, isError } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);
  const [searchQuery, setSearchQuery] = useState("");

  const sorted = useMemo(
    () => [...allCourses].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)),
    [allCourses]
  );
  const featured = sorted[0];
  const rest = sorted.slice(1);

  const filteredRest = useMemo(() => {
    if (!searchQuery.trim()) return rest;
    const q = searchQuery.toLowerCase();
    return rest.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [rest, searchQuery]);

  return (
    <section id="courses" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <Eyebrow>Course Discovery</Eyebrow>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              Find something worth learning.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Real courses, built with structured modules and interactive assessments.
            </p>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary hover:text-primary-hover transition shrink-0"
          >
            <span>Full Catalog</span>
            <ArrowRight size={14} />
          </Link>
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
            <FeaturedCourse course={featured} />

            {rest.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-bold text-foreground">More courses</p>
                  <div className="relative w-full sm:w-60">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                {filteredRest.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses match &quot;{searchQuery}&quot;.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filteredRest.slice(0, 6).map((course) => (
                      <FeaturedCourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
