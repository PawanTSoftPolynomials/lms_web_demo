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

  // Map activities dynamically to match the backend timestamps & tags
  const activities = summaryList.map((item, idx) => {
    const text = typeof item === 'string' ? item : (item.text || JSON.stringify(item));
    const badge = typeof item === 'object' && item.badge ? item.badge : 'Activity';
    const badgeColor = typeof item === 'object' && item.badgeColor ? item.badgeColor : 'border-blue-500/20 bg-blue-500/10 text-blue-400';
    const time = typeof item === 'object' && item.time ? item.time : 'Just Now';

    return {
      id: typeof item === 'object' && item.id ? item.id : idx,
      text,
      badge,
      badgeColor,
      time
    };
  });

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
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No Recent Activity</p>
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between gap-4 p-2.5 rounded-xl border border-slate-850/65 bg-slate-955/10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[9px] font-bold text-slate-500 shrink-0 w-16 uppercase tracking-wider">{act.time}</span>
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[210px]">{act.text}</p>
              </div>
              <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border shrink-0 ${act.badgeColor}`}>
                {act.badge}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
