"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import MyCourseCard from "@/components/student/my-courses/MyCourseCard";
import StudentWelcomeCard from "@/components/student/my-courses/StudentWelcomeCard";
import useMyCourses from "@/hooks/queries/student/useMyCourses";

export default function MyCoursesPage() {
  const router = useRouter();
  const { data: myEnrollments = [], isLoading, isError, refetch } = useMyCourses();

  const [yearFilter, setYearFilter] = useState("all");

  // Years the student has an enrollment in, newest first — drives the Year filter.
  const enrollmentYears = useMemo(() => {
    const years = new Set(
      myEnrollments
        .map((e) => (e.enrolledAt ? new Date(e.enrolledAt).getFullYear() : null))
        .filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [myEnrollments]);

  const yearFilteredEnrollments = useMemo(() => {
    if (yearFilter === "all") return myEnrollments;
    return myEnrollments.filter(
      (e) => e.enrolledAt && new Date(e.enrolledAt).getFullYear() === Number(yearFilter)
    );
  }, [myEnrollments, yearFilter]);

  // `/enrollments` returns everything at once (no server-side pagination), so
  // paging happens client-side over the year-filtered list — same
  // Pagination component the Instructor Courses page uses, just fed a local
  // slice instead of a server page.
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(yearFilteredEnrollments.length / limit));
  const pagedEnrollments = yearFilteredEnrollments.slice((page - 1) * limit, page * limit);

  // Snap back to the last valid page if the Year filter or an unenroll
  // shrinks the list out from under the current page.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  // Mobile carousel: tracks centered card for pagination dots
  const sliderRef = useRef(null);
  const scrollRaf = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const firstCourseId = pagedEnrollments[0]?.id || pagedEnrollments[0]?.courseId;

  useEffect(() => {
    sliderRef.current?.scrollTo({ left: 0 });
    setActiveSlide(0);
  }, [firstCourseId]);

  const handleSliderScroll = (e) => {
    const el = e.currentTarget;
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveSlide(closest);
    });
  };

  const goToSlide = (i) => {
    const child = sliderRef.current?.children[i];
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="-m-3 sm:-m-6 -mt-4 sm:-mt-6 md:-mt-16 -mx-4 sm:-mx-6 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-4 md:space-y-6 flex flex-col flex-1 min-h-0">
      <div className="shrink-0">
        <StudentWelcomeCard />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center space-y-3">
          <p className="text-sm font-bold text-foreground">Unable to load your courses.</p>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !isLoading && myEnrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Enrolled Courses Yet"
          description="Browse the course catalog and start learning today."
          actionText="Browse Courses"
          onAction={() => router.push("/student/courses")}
        />
      ) : (
        <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 mb-4 md:mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">Enrolled Courses</h2>
            </div>

            {enrollmentYears.length > 0 && (
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-border bg-card px-3 py-2 md:py-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer hover:border-transparent transition [&>option]:bg-card [&>option]:text-foreground shrink-0"
              >
                <option value="all">All Years</option>
                {enrollmentYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1 md:-mr-1">
            <div
              ref={sliderRef}
              onScroll={!isLoading && pagedEnrollments.length > 0 ? handleSliderScroll : undefined}
              className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none pb-1 md:gap-6 md:pb-0 md:grid md:justify-center md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:overflow-visible md:snap-none"
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[70%] shrink-0 max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-56 md:shrink h-52 md:h-64 rounded-2xl border border-slate-200 bg-white/10 animate-pulse"
                    />
                  ))
                : pagedEnrollments.length === 0
                ? (
                  <div className="w-full col-span-full">
                    <EmptyState title="No courses enrolled in the selected year." />
                  </div>
                )
                : pagedEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id || enrollment.courseId}
                      className="w-[70%] shrink-0 snap-center max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-56 md:shrink"
                    >
                      <MyCourseCard enrollment={enrollment} />
                    </div>
                  ))}
            </div>

            {!isLoading && pagedEnrollments.length > 1 && (
              <div className="flex md:hidden items-center justify-center gap-1.5 pt-3" role="tablist" aria-label="Course slides">
                {pagedEnrollments.map((enrollment, i) => (
                  <button
                    key={enrollment.id || i}
                    role="tab"
                    aria-selected={i === activeSlide}
                    aria-label={`Go to course slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeSlide ? "w-2 h-2 bg-primary" : "w-1.5 h-1.5 bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            )}

            {!isLoading && myEnrollments.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={yearFilteredEnrollments.length}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(next) => {
                  setLimit(next);
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
