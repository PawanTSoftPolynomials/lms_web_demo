"use client";

import { Filter, RotateCcw, Check } from "lucide-react";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useLessons } from "@/hooks/queries/instructor/useLessons";
import { useCourseBatches } from "@/hooks/queries/instructor/useBatches";
import { useWorkFilters } from "@/context/WorkFilterContext";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const selectClass =
  "w-full bg-[#0D1021] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#0D1021] [&>option]:text-slate-200";
const labelClass = "text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

const DEFAULT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

/**
 * The shared Course / Batch / Module / Lesson / Status / Date Range toolbar
 * used across every /instructor/work page (and reused standalone by Batches).
 * `fields` picks which selectors render; selections live in WorkFilterContext
 * so they persist across Work page navigation until Apply/Reset.
 */
export default function WorkFilterBar({
  fields = ["course", "batch", "module", "lesson", "status", "dateRange"],
  statusOptions = DEFAULT_STATUS_OPTIONS,
}) {
  const { filters, updateFilter, applyFilters, resetFilters } = useWorkFilters();

  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();
  const { data: modules = [], isLoading: loadingModules } = useModules(filters.courseId);
  const { data: lessons = [], isLoading: loadingLessons } = useLessons(filters.moduleId);
  const { data: batches = [], isLoading: loadingBatches } = useCourseBatches(filters.courseId);

  const show = (field) => fields.includes(field);

  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <Filter size={13} className="text-orange-450" />
        <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">Filters</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {show("course") && (
          <div>
            <label className={labelClass}>Course</label>
            <select
              className={selectClass}
              value={filters.courseId}
              onChange={(e) => updateFilter("courseId", e.target.value)}
              disabled={loadingCourses}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {show("batch") && (
          <div>
            <label className={labelClass}>Batch</label>
            <select
              className={selectClass}
              value={filters.batchId}
              onChange={(e) => updateFilter("batchId", e.target.value)}
              disabled={!filters.courseId || loadingBatches}
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {show("module") && (
          <div>
            <label className={labelClass}>Module</label>
            <select
              className={selectClass}
              value={filters.moduleId}
              onChange={(e) => updateFilter("moduleId", e.target.value)}
              disabled={!filters.courseId || loadingModules}
            >
              <option value="">All Modules</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {show("lesson") && (
          <div>
            <label className={labelClass}>Lesson</label>
            <select
              className={selectClass}
              value={filters.lessonId}
              onChange={(e) => updateFilter("lessonId", e.target.value)}
              disabled={!filters.moduleId || loadingLessons}
            >
              <option value="">All Lessons</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {show("status") && (
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={selectClass}
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {show("dateRange") && (
          <div>
            <label className={labelClass}>Date Range</label>
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(nextStart, nextEnd) => {
                updateFilter("startDate", nextStart);
                updateFilter("endDate", nextEnd);
              }}
              triggerClassName="w-full py-2.5"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3.5 border-t border-[#1A1F35]">
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 transition"
        >
          <RotateCcw size={12} />
          Reset
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition"
        >
          <Check size={12} />
          Apply
        </button>
      </div>
    </div>
  );
}
