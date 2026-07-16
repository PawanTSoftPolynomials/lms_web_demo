'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import { ArrowDownRight, ArrowRight, ArrowUpRight, AlertTriangle, RefreshCw } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import HealthBadge from '@/components/ui/HealthBadge';
import ProgressBar from '@/components/ui/ProgressBar';

export default function ConceptMastery({ courseId, role = 'instructor' }) {
  const { data: conceptData = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    select: (data) => data?.conceptMastery ?? [],
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const isAuthor = role === 'course-author';
  const title = isAuthor ? 'Course Health' : 'Concept Mastery';
  const subtitle = isAuthor
    ? 'Health signals across your authored content portfolio'
    : 'Student mastery across key learning concepts';
  const labelKey = isAuthor ? 'course' : 'concept';
  const valueKey = isAuthor ? 'completion' : 'mastery';
  const countKey = isAuthor ? 'students' : 'students';
  const statusKey = isAuthor ? 'health' : 'status';

  if (isLoading && conceptData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="space-y-4 py-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-4 w-12 bg-slate-800 rounded" />
              <div className="h-4 w-28 bg-slate-800 rounded" />
              <div className="h-4 w-16 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </ChartCard>
    );
  }

  if (isError) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="flex justify-center text-red-400">
            <AlertTriangle size={32} />
          </div>
          <h4 className="font-bold text-white text-sm">Failed to load Concept Mastery</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{error?.message || 'Error occurred while loading concept statistics.'}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-650 rounded-lg transition"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </ChartCard>
    );
  }

  if (conceptData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-bold text-white text-sm">No Concept Data</h4>
          <p className="mt-1.5 text-xs text-slate-400 max-w-[240px] leading-relaxed">
            There are no lessons or progress statistics available to assess concept mastery.
          </p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle} action="View Report">
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto pr-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
            <tr className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md">
              <th className="pb-4 pt-2 text-left text-xs font-bold text-slate-400 uppercase pl-3">
                {isAuthor ? 'Course' : 'Concept'}
              </th>
              <th className="pb-4 pt-2 text-center text-xs font-bold text-slate-400 uppercase">
                {isAuthor ? 'Learners' : 'Students'}
              </th>
              <th className="pb-4 pt-2 text-center text-xs font-bold text-slate-400 uppercase">
                {isAuthor ? 'Completion' : 'Mastery'}
              </th>
              <th className="pb-4 pt-2 text-center text-xs font-bold text-slate-400 uppercase">
                Status
              </th>
              <th className="pb-4 pt-2 text-center text-xs font-bold text-slate-400 uppercase pr-3">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {conceptData.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-slate-800/30 group"
              >
                <td className="py-4 pl-3 text-left">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold text-sm text-white group-hover:text-orange-400 transition-colors">{item[labelKey]}</span>
                    {item.context && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.context}
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center font-bold text-sm text-slate-200">{item[countKey]}</td>
                <td className="px-3 py-4 w-40">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Percentage</span>
                      <span>{item[valueKey]}%</span>
                    </div>
                    <ProgressBar
                      value={item[valueKey]}
                      color={
                        item[valueKey] >= 85
                          ? 'green'
                          : item[valueKey] >= 70
                            ? 'blue'
                            : item[valueKey] >= 60
                              ? 'yellow'
                              : 'red'
                      }
                    />
                  </div>
                </td>
                <td className="text-center">
                  <HealthBadge status={item[statusKey]} />
                </td>
                <td className="py-4 pr-3 text-center">
                  {item.trend === 'up' ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-400">
                      <ArrowUpRight size={16} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-red-400">
                      <ArrowDownRight size={16} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
