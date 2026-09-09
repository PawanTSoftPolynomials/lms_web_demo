"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "@/components/layouts/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import BrowseCourseCard from "@/components/instructor/courses/BrowseCourseCard";
import { useInstructorCoursesTable } from "@/hooks/queries/instructor/useInstructorCoursesTable";

const INITIAL_FILTERS = { search: "", category: "", level: "", sortBy: "newest", page: 1, limit: 12, scope: "all" };

/** Platform-wide, read-only course catalog for instructors — every published
 *  course, not just their own (that's My Courses). No edit/delete/export;
 *  cards link out to the public course details page. */
export default function InstructorBrowseCoursesPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const { data, isLoading, isError, refetch } = useInstructorCoursesTable(filters);

  const courses = data?.courses || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value, page: key === "page" ? value : 1 }));

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
      <PageHeader
        title="New Courses"
        subtitle="Browse every published course on the platform."
      />

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
      ) : (
        <div className="flex flex-col min-h-[70vh] rounded-2xl border border-[#1A1F35] bg-[#0D1021] px-3 py-4 md:px-12 md:py-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 mb-2 md:mb-3">
            <div className="relative w-full min-w-0 md:max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => set("search")(e.target.value)}
                className="w-full rounded-xl border border-[#1A1F35] bg-[#0D1021] pl-9 pr-4 py-1 md:py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-orange-500/60"
              />
            </div>
          </div>

          <div className="flex-1">
            <div
              ref={sliderRef}
              onScroll={courses.length > 0 ? handleSliderScroll : undefined}
              className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none pb-1 md:gap-4 md:pb-0 md:grid md:justify-center md:grid-cols-[repeat(auto-fill,224px)] md:overflow-visible md:snap-none"
            >
              {courses.length === 0 ? (
                <div className="w-full col-span-full">
                  <EmptyState title="No courses match the current filters." />
                </div>
              ) : (
                courses.map((course) => <BrowseCourseCard key={course.id} course={course} />)
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
        </div>
      )}
    </div>
  );
}
