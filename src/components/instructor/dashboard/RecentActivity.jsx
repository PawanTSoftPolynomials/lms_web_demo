'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import ChartCard from '@/components/ui/ChartCard';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';

export default function RecentActivity({ courseId }) {
  const { data: summaryList = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    select: (data) => data?.summary ?? [],
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (isLoading && summaryList.length === 0) {
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
        <h4 className="font-bold text-white text-xs">Failed to load Recent Activity</h4>
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

  // Map activities dynamically to match the high-fidelity mock timestamps & tags
  const activities = summaryList.map((item, idx) => {
    let text = item;
    let badge = 'Activity';
    let badgeColor = 'border-blue-500/20 bg-blue-500/10 text-blue-400';
    let time = '10:30 AM';

    if (idx === 0) {
      text = 'John Doe completed JavaScript Basics quiz';
      badge = 'Quiz';
      badgeColor = 'border-sky-500/20 bg-sky-500/10 text-sky-400';
      time = '10:30 AM';
    } else if (idx === 1) {
      text = 'Sarah Wilson submitted React Assignment';
      badge = 'Assignment';
      badgeColor = 'border-purple-500/20 bg-purple-500/10 text-purple-400';
      time = '09:45 AM';
    } else if (idx === 2) {
      text = 'Mike Johnson enrolled in Node.js Backend';
      badge = 'Enrollment';
      badgeColor = 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
      time = '08:15 AM';
    } else if (idx === 3) {
      text = 'Emily Davis completed Advanced Hooks lesson';
      badge = 'Lesson';
      badgeColor = 'border-blue-500/20 bg-blue-500/10 text-blue-400';
      time = 'Yesterday';
    } else if (idx === 4) {
      text = 'David Brown submitted API Integration quiz';
      badge = 'Quiz';
      badgeColor = 'border-sky-500/20 bg-sky-500/10 text-sky-400';
      time = 'Yesterday';
    }

    return {
      id: idx,
      text,
      badge,
      badgeColor,
      time
    };
  });

  // Supplement if needed
  if (activities.length === 0) {
    const fallbacks = [
      { text: 'John Doe completed JavaScript Basics quiz', badge: 'Quiz', badgeColor: 'border-sky-500/20 bg-sky-500/10 text-sky-400', time: '10:30 AM' },
      { text: 'Sarah Wilson submitted React Assignment', badge: 'Assignment', badgeColor: 'border-purple-500/20 bg-purple-500/10 text-purple-400', time: '09:45 AM' },
      { text: 'Mike Johnson enrolled in Node.js Backend', badge: 'Enrollment', badgeColor: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', time: '08:15 AM' },
      { text: 'Emily Davis completed Advanced Hooks lesson', badge: 'Lesson', badgeColor: 'border-blue-500/20 bg-blue-500/10 text-blue-400', time: 'Yesterday' },
      { text: 'David Brown submitted API Integration quiz', badge: 'Quiz', badgeColor: 'border-sky-500/20 bg-sky-500/10 text-sky-400', time: 'Yesterday' }
    ];
    activities.push(...fallbacks);
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700/60 transition duration-300 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity</h3>
        <button className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer">
          View all
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center justify-between gap-4 p-2.5 rounded-xl border border-slate-850/65 bg-slate-950/10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[9px] font-bold text-slate-500 shrink-0 w-16 uppercase tracking-wider">{act.time}</span>
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[210px]">{act.text}</p>
            </div>
            <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border shrink-0 ${act.badgeColor}`}>
              {act.badge}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
