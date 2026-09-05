import { BookOpen, Calendar, ChevronDown } from "lucide-react";

const TIME_RANGES = ["All Time", "This Week", "This Month"];

export default function ReportFilters({
  courses = [],
  selectedCourseId,
  onCourseChange,
  timeRange,
  onTimeRangeChange,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="relative">
        <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <select
          value={selectedCourseId ?? "all"}
          onChange={(e) => onCourseChange?.(e.target.value)}
          className="w-full appearance-none rounded-xl bg-card border border-card-border !pl-9 !pr-7 !py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 transition cursor-pointer truncate [&>option]:bg-card [&>option]:text-foreground"
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      <div className="relative">
        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange?.(e.target.value)}
          className="w-full appearance-none rounded-xl bg-card border border-card-border !pl-9 !pr-7 !py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 transition cursor-pointer truncate [&>option]:bg-card [&>option]:text-foreground"
        >
          {TIME_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
