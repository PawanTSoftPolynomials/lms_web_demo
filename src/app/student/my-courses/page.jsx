"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search } from "lucide-react";

import PageHeader from "@/components/layouts/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MyCourseCard from "@/components/student/my-courses/MyCourseCard";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import { STATUS_OPTIONS, SORT_OPTIONS } from "@/features/student/constants/myCoursesConfig";

export default function MyCoursesPage() {
  const router = useRouter();
  const { data: myEnrollments = [], isLoading, isError, refetch } = useMyCourses();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const instructors = useMemo(
    () => Array.from(new Set(myEnrollments.map((e) => e.course?.instructor).filter(Boolean))),
    [myEnrollments]
  );

  const filteredCourses = useMemo(() => {
    let list = [...myEnrollments];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.course?.title?.toLowerCase().includes(q) ||
          e.course?.description?.toLowerCase().includes(q)
      );
    }
    if (statusFilter === "in-progress") {
      list = list.filter((e) => (e.progress ?? 0) < 100);
    } else if (statusFilter === "completed") {
      list = list.filter((e) => (e.progress ?? 0) >= 100);
    }
    if (instructorFilter !== "all") {
      list = list.filter((e) => e.course?.instructor === instructorFilter);
    }

    if (sortBy === "progress") {
      list.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.course?.title || "").localeCompare(b.course?.title || ""));
    }
    return list;
  }, [myEnrollments, search, statusFilter, instructorFilter, sortBy]);

  // Mobile carousel: tracks centered card for pagination dots
  const sliderRef = useRef(null);
  const scrollRaf = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const firstCourseId = filteredCourses[0]?.id || filteredCourses[0]?.courseId;

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
        title={`My Courses${!isLoading && myEnrollments.length ? ` (${filteredCourses.length})` : ""}`}
        subtitle="Track your progress and continue learning your enrolled courses."
        className="mb-0 sm:mb-0"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full min-w-0 md:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#1A1F35] bg-[#0D1021] pl-9 pr-4 py-2 md:py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-orange-500/60"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#1A1F35] bg-[#0D1021] px-3 py-2 md:py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer hover:border-slate-700 transition"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="rounded-xl border border-[#1A1F35] bg-[#0D1021] px-3 py-2 md:py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer hover:border-slate-700 transition"
            >
              <option value="all">All Instructors</option>
              {instructors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#1A1F35] bg-[#0D1021] px-3 py-2 md:py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer hover:border-slate-700 transition"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      {isError ? (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] py-16 text-center space-y-3">
          <p className="text-sm font-bold text-slate-300">Unable to load your courses.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer"
          >
            Retry
          </button>
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
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] px-3 py-4 md:px-12 md:py-6">
          <div className="md:max-h-[68vh] md:overflow-y-auto md:pr-1 md:-mr-1">
            <div
              ref={sliderRef}
              onScroll={!isLoading && filteredCourses.length > 0 ? handleSliderScroll : undefined}
              className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none pb-1 md:gap-6 md:pb-0 md:grid md:justify-center md:grid-cols-[repeat(auto-fill,320px)] md:overflow-visible md:snap-none"
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[90%] shrink-0 max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-80 md:shrink h-64 md:h-[26rem] rounded-2xl border border-slate-200 bg-white/10 animate-pulse"
                    />
                  ))
                : filteredCourses.length === 0
                ? (
                  <div className="w-full col-span-full">
                    <EmptyState title="No courses match your current filters." />
                  </div>
                )
                : filteredCourses.map((enrollment) => (
                    <MyCourseCard key={enrollment.id || enrollment.courseId} enrollment={enrollment} />
                  ))}
            </div>

            {!isLoading && filteredCourses.length > 1 && (
              <div className="flex md:hidden items-center justify-center gap-1.5 pt-3" role="tablist" aria-label="Course slides">
                {filteredCourses.map((enrollment, i) => (
                  <button
                    key={enrollment.id || i}
                    role="tab"
                    aria-selected={i === activeSlide}
                    aria-label={`Go to course slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeSlide ? "w-2 h-2 bg-orange-500" : "w-1.5 h-1.5 bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
