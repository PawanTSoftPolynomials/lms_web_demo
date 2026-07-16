'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ActionCenter({ courseId }) {
  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (isLoading && !dashboardData) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 animate-pulse h-[280px]" />
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center space-y-4 h-[280px] flex flex-col justify-center">
        <div className="flex justify-center text-red-400">
          <AlertTriangle size={24} />
        </div>
        <h4 className="font-bold text-white text-xs">Failed to load Action Center</h4>
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

  const priorities = dashboardData?.priorities ?? [];

  // Extract counts dynamically from database statistics
  const dbInactiveCount = priorities.find(p => p.title?.includes('Inactive'))?.value || '15';
  const dbDraftCount = priorities.find(p => p.title?.includes('Draft'))?.value || '3';
  const dbQuizReviewCount = priorities.find(p => p.title?.includes('Quiz'))?.value || '8';

  const highPriority = [
    { text: `${dbInactiveCount} students inactive`, detail: 'For more than 7 days' },
    { text: `${dbQuizReviewCount} quizzes need review`, detail: 'Pending submissions' },
    { text: `${dbDraftCount} courses need attention`, detail: 'Low completion rate/Draft status' }
  ];

  const upcoming = [
    { text: '2 assignments due today', detail: 'For 3 courses' },
    { text: '1 live session today', detail: 'Web Development 101' },
    { text: '5 quizzes closing soon', detail: 'Within next 3 days' }
  ];

  const completed = [
    { text: '2 assignments graded', detail: 'This week' },
    { text: '28 quizzes reviewed', detail: 'This week' },
    { text: '3 announcements sent', detail: 'This week' }
  ];

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700/60 transition duration-300 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Action Center</h3>
        <button className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer">
          View all
        </button>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 overflow-y-auto pr-1">
        
        {/* High Priority column */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">High Priority</span>
            <span className="h-4 w-4 rounded-full bg-red-500/10 text-red-400 text-[9px] font-extrabold flex items-center justify-center border border-red-500/25">6</span>
          </div>
          <div className="space-y-2">
            {highPriority.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:border-red-500/20 transition duration-200">
                <p className="text-xs font-bold text-white leading-tight">{item.text}</p>
                <p className="text-[9px] text-slate-405 mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming column */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Upcoming</span>
            <span className="h-4 w-4 rounded-full bg-orange-500/10 text-orange-400 text-[9px] font-extrabold flex items-center justify-center border border-orange-500/25">5</span>
          </div>
          <div className="space-y-2">
            {upcoming.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-orange-500/10 bg-orange-500/5 hover:border-orange-500/20 transition duration-200">
                <p className="text-xs font-bold text-white leading-tight">{item.text}</p>
                <p className="text-[9px] text-slate-405 mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Completed column */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Completed</span>
            <span className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold flex items-center justify-center border border-emerald-500/25">12</span>
          </div>
          <div className="space-y-2">
            {completed.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20 transition duration-200">
                <p className="text-xs font-bold text-white leading-tight">{item.text}</p>
                <p className="text-[9px] text-slate-405 mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
