'use client';

import Link from 'next/link';
import { ArrowRight, Users, BookOpen } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import ChartCard from '@/components/ui/ChartCard';

export default function CoursePerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title="Course Progress" subtitle="Average progress across your courses">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white">No courses available</h3>
          <p className="text-sm text-slate-400 mt-1">You haven't created or been assigned any courses yet.</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard 
      title="Course Progress" 
      subtitle="Average learner completion and performance across all courses"
      action="View All Courses"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {data.map((course) => {
          // Parse lessons count from meta string if possible, e.g. "5 Modules • 10 Lessons"
          const lessonsMatch = course.meta?.match(/(\d+)\s+Lessons/);
          const totalLessons = lessonsMatch ? parseInt(lessonsMatch[1], 10) : 10;
          const completedLessons = Math.round((course.completion / 100) * totalLessons);

          return (
            <div 
              key={course.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/40 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-slate-900/40 hover:shadow-lg hover:shadow-slate-950/40"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-white text-base leading-snug group-hover:text-orange-400 transition-colors">
                    {course.course}
                  </h4>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                    course.type === 'AUTHORED'
                      ? 'border-orange-500/20 bg-orange-500/10 text-orange-400'
                      : 'border-blue-500/20 bg-blue-500/10 text-blue-400'
                  }`}>
                    {course.type === 'AUTHORED' ? 'Authored' : 'Assigned'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-normal flex items-center gap-1.5">
                  <Users size={14} className="text-slate-500 animate-pulse" />
                  <span>{course.enrollments ?? 0} Enrolled Students</span>
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">{completedLessons}/{totalLessons} Lessons Completed</span>
                    <span className="text-orange-400">{course.completion}%</span>
                  </div>
                  <ProgressBar 
                    value={course.completion} 
                    color={
                      course.completion >= 85 ? 'green' :
                      course.completion >= 70 ? 'blue' :
                      course.completion >= 60 ? 'yellow' : 'red'
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-between items-center border-t border-slate-800/80 pt-3">
                <div className="text-[11px] text-slate-500 font-semibold">
                  Quiz Avg: <span className="text-slate-300">{course.quizAverage ?? 0}%</span>
                </div>
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 transition group-hover:text-orange-300"
                >
                  Continue
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
