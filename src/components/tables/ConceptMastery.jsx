'use client';

import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';
import HealthBadge from '@/components/ui/HealthBadge';
import ProgressBar from '@/components/ui/ProgressBar';

export default function ConceptMastery({ role, data }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard
        title={role === 'course-author' ? 'Course Health' : 'Concept Mastery'}
        subtitle={
          role === 'course-author'
            ? 'Health signals across your authored content portfolio'
            : 'Student mastery across key learning concepts'
        }
      >
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

  const isAuthor = role === 'course-author';
  const title = isAuthor ? 'Course Health' : 'Concept Mastery';
  const subtitle = isAuthor
    ? 'Health signals across your authored content portfolio'
    : 'Student mastery across key learning concepts';
  const labelKey = isAuthor ? 'course' : 'concept';
  const valueKey = isAuthor ? 'completion' : 'mastery';
  const countKey = isAuthor ? 'students' : 'students';
  const statusKey = isAuthor ? 'health' : 'status';

  return (
    <ChartCard title={title} subtitle={subtitle} action="View Report">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="pb-4 text-left text-sm font-medium text-slate-400">
                {isAuthor ? 'Course' : 'Concept'}
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-400">
                {isAuthor ? 'Learners' : 'Students'}
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-400">
                {isAuthor ? 'Completion' : 'Mastery'}
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-400">
                Status
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-400">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-800 transition hover:bg-slate-800/40"
              >
                <td className="py-5">
                  <button className="group flex flex-col items-start gap-1 text-left font-medium text-white transition hover:text-orange-400">
                    <span>{item[labelKey]}</span>
                    {item.context && (
                      <span className="text-sm font-normal text-slate-400">
                        {item.context}
                      </span>
                    )}
                    <ArrowRight
                      size={16}
                      className="mt-1 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </button>
                </td>
                <td className="text-center font-semibold">{item[countKey]}</td>
                <td className="px-3 py-5">
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
                </td>
                <td className="text-center">
                  <HealthBadge status={item[statusKey]} />
                </td>
                <td className="text-center">
                  {item.trend === 'up' ? (
                    <ArrowUpRight
                      size={18}
                      className="inline text-emerald-400"
                    />
                  ) : (
                    <ArrowDownRight size={18} className="inline text-red-400" />
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
