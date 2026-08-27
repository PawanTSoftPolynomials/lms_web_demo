"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import CourseGridCard from "@/components/courses/CourseGridCard";
import { useInstructorCoursesTable } from "@/hooks/queries/instructor/useInstructorCoursesTable";

const INITIAL_FILTERS = { search: "", status: "", category: "", level: "", sortBy: "newest", page: 1, limit: 10 };

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const { data, isLoading, isError, refetch } = useInstructorCoursesTable(filters);

  const courses = data?.courses || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value, page: key === "page" ? value : 1 }));

  // Mobile carousel: tracks which card is centered so the pagination dots below
  // can highlight it. Rides the native scroll-snap — no external state drives
  // the scroll position itself, we just observe where it landed.
  const sliderRef = useRef(null);
  const scrollRaf = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const firstCourseId = courses[0]?.id;

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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="shrink-0">
          <h1 className="text-xl md:text-4xl font-bold text-white">
            My Courses{!isLoading && pagination.total ? ` (${pagination.total})` : ""}
          </h1>
          <p className="hidden md:block text-slate-400 mt-2 text-sm md:text-base">
            Manage, edit and monitor all your courses from one place.
          </p>
        </div>

        {/* Collapses to direct flex children of the row above at md+ (identical
            to the original 3-item layout); stays a combined row on mobile so
            search + actions share one line instead of stacking separately. */}
        <div className="flex items-center gap-2 md:contents">
          <div className="relative w-full min-w-0 md:max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={filters.search}
              onChange={(e) => set("search")(e.target.value)}
              className="w-full rounded-xl border border-[#1A1F35] bg-[#0D1021] pl-9 pr-4 py-2 md:py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-orange-500/60"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link
              href="/instructor/courses/import"
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 border border-amber-500/40 px-3 md:px-4 py-2 md:py-2.5 text-xs font-bold text-amber-400 transition hover:bg-slate-700 hover:border-amber-400 whitespace-nowrap"
            >
              <span className="md:hidden">Import</span>
              <span className="hidden md:inline">Import Course</span>
            </Link>
            <button
              onClick={() => router.push("/instructor/courses/create")}
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 md:px-5 py-2 md:py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 whitespace-nowrap"
            >
              <span className="md:hidden">+ Create</span>
              <span className="hidden md:inline">+ Create Course</span>
            </button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] py-16 text-center space-y-3">
          <p className="text-sm font-bold text-slate-300">Unable to load courses.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] py-16 text-center space-y-3">
          <div className="mx-auto w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 && pagination.total === 0 && !filters.search && !filters.status && !filters.category && !filters.level ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Yet"
          description="Start creating your first course."
          actionText="+ Create Course"
          onAction={() => router.push("/instructor/courses/create")}
        />
      ) : (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] px-3 py-4 md:px-12 md:py-6">
          <div className="md:max-h-[68vh] md:overflow-y-auto md:pr-1 md:-mr-1">
            {/* Mobile: centered peek carousel — the active card snaps to the middle
                of the viewport with a small sliver of its neighbors visible on
                each side (App Store / Apple Music style), one card in focus at a
                time instead of vertical scrolling. Desktop/tablet keep the
                original grid, unchanged, via md:grid overriding the flex display. */}
            <div
              ref={sliderRef}
              onScroll={courses.length > 0 ? handleSliderScroll : undefined}
              className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none pb-1 md:gap-6 md:pb-0 md:grid md:justify-center md:grid-cols-[repeat(auto-fill,320px)] md:overflow-visible md:snap-none"
            >
              {courses.length === 0 ? (
                <div className="w-full col-span-full">
                  <EmptyState title="No courses match the current filters." />
                </div>
              ) : (
                courses.map((course, index) => <CourseGridCard key={course.id} course={course} index={index} />)
              )}
            </div>

            {!isLoading && courses.length > 1 && (
              <div className="flex md:hidden items-center justify-center gap-1.5 pt-3" role="tablist" aria-label="Course slides">
                {courses.map((course, i) => (
                  <button
                    key={course.id}
                    role="tab"
                    aria-selected={i === activeSlide}
                    aria-label={`Go to ${course.title}`}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeSlide ? "w-2 h-2 bg-orange-500" : "w-1.5 h-1.5 bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {!isLoading && courses.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={filters.limit}
              onPageChange={set("page")}
              onLimitChange={(limit) => setFilters((f) => ({ ...f, limit, page: 1 }))}
            />
          )}
        </div>
      )}
    </div>
  );
}
