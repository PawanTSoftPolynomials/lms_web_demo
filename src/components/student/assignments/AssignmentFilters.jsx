"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import Input from "@/components/ui/Input";

export default function AssignmentFilters({
  search,
  setSearch,
  courseFilter,
  setCourseFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  courseOptions = [],
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = [
    courseFilter,
    statusFilter,
    sortBy && sortBy !== "due-earliest" ? sortBy : "",
  ].filter(Boolean).length;

  const courseSelect = (
    <select
      value={courseFilter}
      onChange={(e) => setCourseFilter(e.target.value)}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
    >
      <option value="">All Courses</option>
      {courseOptions.map((course) => (
        <option key={course} value={course}>
          {course}
        </option>
      ))}
    </select>
  );

  const statusSelect = (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
    >
      <option value="">All Statuses</option>
      <option value="Not Submitted">Not Submitted</option>
      <option value="In Progress">In Progress</option>
      <option value="Submitted">Submitted</option>
      <option value="Graded">Graded</option>
    </select>
  );

  const sortSelect = (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
    >
      <option value="due-earliest">Due Date (Earliest)</option>
      <option value="due-latest">Due Date (Latest)</option>
      <option value="course">Course Name</option>
    </select>
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      {/* Desktop (xl+): unchanged single-row layout, matches this page's own xl:grid-cols breakpoint */}
      <div className="hidden xl:grid xl:grid-cols-[1.5fr_1fr_1fr_1fr] xl:gap-4">
        <Input
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {courseSelect}
        {statusSelect}
        {sortSelect}
      </div>

      {/* Mobile & tablet: search bar + a Filters toggle button carrying the
          course/status/sort controls, instead of stacking 4 full-width
          fields inline every time. */}
      <div className="xl:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className={`relative flex items-center gap-2 rounded-xl border px-4 py-3 min-h-[44px] text-sm font-semibold transition cursor-pointer shrink-0 ${
              showMobileFilters
                ? "border-orange-500 bg-orange-500/10 text-orange-400"
                : "border-slate-700 bg-slate-800 text-white hover:border-slate-600"
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-slate-950">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showMobileFilters && (
          <div className="mt-3 space-y-3">
            {courseSelect}
            {statusSelect}
            {sortSelect}
          </div>
        )}
      </div>
    </div>
  );
}
