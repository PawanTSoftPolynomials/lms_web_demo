"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import CourseToolbar from "@/components/courses/CourseToolbar";
import CourseTable from "@/components/courses/CourseTable";
import CourseGridCard from "@/components/courses/CourseGridCard";
import { useInstructorCoursesTable } from "@/hooks/queries/instructor/useInstructorCoursesTable";
import { useCourseStatusCounts } from "@/hooks/queries/instructor/useCourseStatusCounts";
import { exportCoursesCsv } from "@/lib/exportCourses";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#1A1F35] bg-[#0D1021] px-4 py-3">
      <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white mt-1 tabular-nums">{value ?? "—"}</p>
    </div>
  );
}

const INITIAL_FILTERS = { search: "", status: "", category: "", level: "", sortBy: "newest", page: 1, limit: 10 };

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [view, setView] = useState("table");

  const { data: counts } = useCourseStatusCounts();
  const { data, isLoading, isError, refetch } = useInstructorCoursesTable(filters);

  const courses = data?.courses || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value, page: key === "page" ? value : 1 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Courses</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Manage, edit and monitor all your courses from one place.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/instructor/courses/import"
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 border border-amber-500/40 px-4 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-slate-700 hover:border-amber-400"
          >
            Import (ZIP)
          </Link>
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
          >
            + Create Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Courses" value={counts?.total} />
        <StatCard label="Published" value={counts?.published} />
        <StatCard label="Drafts" value={counts?.draft} />
        <StatCard label="Archived" value={counts?.archived} />
      </div>

      <CourseToolbar
        search={filters.search}
        onSearchChange={set("search")}
        status={filters.status}
        onStatusChange={set("status")}
        category={filters.category}
        onCategoryChange={set("category")}
        level={filters.level}
        onLevelChange={set("level")}
        sortBy={filters.sortBy}
        onSortChange={set("sortBy")}
        onRefresh={refetch}
        onExport={() => exportCoursesCsv(courses)}
        view={view}
        onViewChange={setView}
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
      ) : !isLoading && courses.length === 0 && pagination.total === 0 && !filters.search && !filters.status && !filters.category && !filters.level ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Yet"
          description="Start creating your first course."
          actionText="+ Create Course"
          onAction={() => router.push("/instructor/courses/create")}
        />
      ) : (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
          {view === "table" ? (
            <div className="hidden md:block">
              <CourseTable courses={courses} isLoading={isLoading} />
            </div>
          ) : null}

          <div className={view === "table" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:hidden" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[380px] rounded-2xl border border-[#1A1F35] bg-white/[0.02] animate-pulse" />
                ))
              : courses.length === 0
              ? (
                <div className="col-span-full">
                  <EmptyState title="No courses match the current filters." />
                </div>
              )
              : courses.map((course, index) => <CourseGridCard key={course.id} course={course} index={index} />)}
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
