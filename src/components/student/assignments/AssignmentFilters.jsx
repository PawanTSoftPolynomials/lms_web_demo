"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import Input from "@/components/ui/Input";
import { ASSIGNMENT_STATUSES } from "@/features/student/constants/assignmentsConfig";

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
  hideCourseFilter = false,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount = [
    hideCourseFilter ? "" : courseFilter,
    statusFilter,
    sortBy && sortBy !== "due-earliest" ? sortBy : "",
  ].filter(Boolean).length;

  const courseSelect = (
    <select
      value={courseFilter}
      onChange={(e) => setCourseFilter(e.target.value)}
      className="w-full rounded-lg border border-transparent bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary [&>option]:bg-card [&>option]:text-foreground"
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
      className="w-full rounded-lg border border-transparent bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary [&>option]:bg-card [&>option]:text-foreground"
    >
      <option value="">All Statuses</option>
      {ASSIGNMENT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );

  const sortSelect = (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="w-full rounded-lg border border-transparent bg-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary [&>option]:bg-card [&>option]:text-foreground"
    >
      <option value="due-earliest">Due Date (Earliest)</option>
      <option value="due-latest">Due Date (Latest)</option>
      {/* Sorting by course name is meaningless once every visible assignment
          already belongs to the same (scoped) course. */}
      {!hideCourseFilter && <option value="course">Course Name</option>}
    </select>
  );

  const hasChips = Boolean((!hideCourseFilter && courseFilter) || statusFilter);

  return (
    <div className="rounded-2xl border border-border bg-background p-3 xl:p-4">
      {/* Desktop (xl+): unchanged single-row layout, matches this page's own
          xl:grid-cols breakpoint. Course-scoped pages drop one column since
          there's nothing left to pick a course from. */}
      <div
        className={`hidden xl:grid xl:gap-4 ${
          hideCourseFilter ? "xl:grid-cols-[1.5fr_1fr_1fr]" : "xl:grid-cols-[1.5fr_1fr_1fr_1fr]"
        }`}
      >
        <Input
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!hideCourseFilter && courseSelect}
        {statusSelect}
        {sortSelect}
      </div>

      {/* Mobile & tablet: search bar + a Filters toggle button carrying the
          course/status/sort controls, instead of stacking 4 full-width
          fields inline every time. */}
      <div className="xl:hidden">
        <div className="flex items-center gap-2.5">
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
            className={`relative flex items-center gap-2 rounded-xl border px-3.5 py-2.5 min-h-[44px] text-sm font-semibold transition-colors duration-200 cursor-pointer shrink-0 ${
              showMobileFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent bg-muted text-foreground hover:border-transparent"
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-slate-950">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips — at a glance, what's currently narrowing the
            list, each removable independently without opening the panel. */}
        {hasChips && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {!hideCourseFilter && courseFilter && (
              <button
                type="button"
                onClick={() => setCourseFilter("")}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 min-h-[32px] text-xs font-semibold text-orange-300 transition-colors duration-200 cursor-pointer"
              >
                Course: {courseFilter}
                <X size={12} />
              </button>
            )}
            {statusFilter && (
              <button
                type="button"
                onClick={() => setStatusFilter("")}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 min-h-[32px] text-xs font-semibold text-orange-300 transition-colors duration-200 cursor-pointer"
              >
                Status: {statusFilter}
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {showMobileFilters && (
          <div className="mt-2.5 space-y-2.5">
            {!hideCourseFilter && courseSelect}
            {statusSelect}
            {sortSelect}
          </div>
        )}
      </div>
    </div>
  );
}
