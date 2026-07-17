'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import { Users, AlertTriangle, RefreshCw, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

const iconMap = {
  High: Users,
  Medium: GraduationCap,
  Low: BookOpen
};

export default function RecommendedActions({ courseId }) {
  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    select: (data) => data?.recommendedActions ?? [],
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
        <h4 className="font-bold text-white text-xs">Failed to load Recommended Actions</h4>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition self-center"
        >
          <RefreshCw size={10} />
          Retry
        </button>
      </div>
    );
  }

  // Map backend recommendations to mockup items
  const recommendations = dashboardData ?? [];
  const displayItems = recommendations.map((item, idx) => {
    const priority = item.priority === 'Critical' ? 'High' : item.priority === 'Needs Review' ? 'Medium' : 'Low';

    return {
      id: item.id || idx,
      title: item.title,
      description: item.description,
      priority,
      action: 'Take Action'
    };
  });

  const badgeColors = {
    High: 'border-red-500/20 bg-red-500/10 text-red-400',
    Medium: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
    Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
  };

  const iconStyles = {
    High: 'bg-red-500/10 text-red-400 border-red-500/25',
    Medium: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700/60 transition duration-300 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Recommended Actions</h3>
        <button className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer">
          View all
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No Recommended Actions</p>
          </div>
        ) : (
          displayItems.map((item) => {
            const Icon = iconMap[item.priority] || Sparkles;
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/20 hover:border-slate-800 transition duration-200"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${iconStyles[item.priority]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className="font-bold text-xs text-white leading-tight truncate">{item.title}</h5>
                    <p className="text-[10px] text-slate-400 truncate max-w-[210px]">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${badgeColors[item.priority]}`}>
                    {item.priority}
                  </span>
                  <button className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-800 transition cursor-pointer select-none">
                    {item.action}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
