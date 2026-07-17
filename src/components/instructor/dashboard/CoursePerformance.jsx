'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

export default function CoursePerformance({ courseId }) {
  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    select: (data) => data?.coursePerformance ?? [],
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (isLoading && !dashboardData) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 animate-pulse h-[360px]" />
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center space-y-4 h-[360px] flex flex-col justify-center">
        <div className="flex justify-center text-red-400">
          <AlertTriangle size={24} />
        </div>
        <h4 className="font-bold text-white text-xs">Failed to load Course Performance</h4>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-red-500 hover:bg-red-650 rounded-lg transition self-center"
        >
          <RefreshCw size={10} />
          Retry
        </button>
      </div>
    );
  }

  const courses = dashboardData ?? [];
  const displayCourses = courses.map((course, idx) => {
    const title = course.course || 'Untitled Course';
    const students = course.students ?? 0;
    const completion = course.completion ?? 0;
    const rating = typeof course.rating === 'number' ? course.rating.toFixed(1) : (course.rating || '0.0');
    const status = course.status || (completion >= 70 ? 'Excellent' : completion >= 50 ? 'Good' : 'Needs Attention');

    return {
      id: course.id || idx,
      title,
      students,
      completion,
      rating,
      status
    };
  });

  const statusColors = {
    Excellent: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    Good: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    'Needs Attention': 'border-orange-500/20 bg-orange-500/10 text-orange-400'
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700/60 transition duration-300 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Course Performance</h3>
        <button className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pr-1 flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-500 uppercase text-left tracking-wider">
              <th className="pb-3 pl-2">Course</th>
              <th className="pb-3 text-center">Students</th>
              <th className="pb-3 w-36">Completion</th>
              <th className="pb-3 text-center">Avg. Rating</th>
              <th className="pb-3 text-center pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {displayCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                  No Course Data Available
                </td>
              </tr>
            ) : (
              displayCourses.map((c) => (
                <tr key={c.id} className="text-slate-300 hover:bg-slate-850/30 transition duration-200">
                <td className="py-3 font-semibold text-xs text-white pl-2">{c.title}</td>
                <td className="py-3 text-xs font-bold text-center text-slate-200">{c.students}</td>
                <td className="py-3 w-36">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <ProgressBar 
                        value={c.completion} 
                        color={c.completion >= 70 ? 'green' : c.completion >= 40 ? 'blue' : 'yellow'} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{c.completion}%</span>
                  </div>
                </td>
                <td className="py-3 text-xs font-bold text-center text-slate-200">{c.rating}</td>
                <td className="py-3 text-center pr-2">
                  <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${statusColors[c.status] || 'border-slate-800 text-slate-400'}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
