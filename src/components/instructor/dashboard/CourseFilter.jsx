'use client';

import { ChevronDown } from 'lucide-react';
import { useInstructorCourses } from '@/hooks/queries/instructor/useInstructorDashboard';

export default function CourseFilter({ selectedCourse, setSelectedCourse }) {
  const { data: courses = [], isLoading } = useInstructorCourses(selectedCourse);

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-855 bg-slate-900/60 p-5">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-52 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-10 w-56 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">Course Focus</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Filter your dashboard stats, performance charts, and concept metrics by course
        </p>
      </div>
      <div className="relative">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-56 appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-200 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
        >
          <option value="all">All Courses (Unified)</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}
