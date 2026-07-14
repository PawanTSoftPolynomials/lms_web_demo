'use client';

import { ArrowRight } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';
import HealthBadge from '@/components/ui/HealthBadge';

export default function RecommendedActions({ role, data }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard
        title={
          role === 'course-author'
            ? 'Recommended Improvements'
            : 'Recommended Actions'
        }
        subtitle={
          role === 'course-author'
            ? 'Content suggestions derived from learner feedback'
            : 'Suggestions generated from teaching analytics'
        }
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="font-bold text-white text-sm">All Tasks Addressed</h4>
          <p className="mt-1.5 text-xs text-slate-400 max-w-[240px] leading-relaxed">
            Your courses are performing optimally and require no immediate interventions.
          </p>
        </div>
      </ChartCard>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    const order = { Critical: 0, 'Needs Review': 1, Good: 2, Excellent: 3 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <ChartCard
      title={
        role === 'course-author'
          ? 'Recommended Improvements'
          : 'Recommended Actions'
      }
      subtitle={
        role === 'course-author'
          ? 'Content suggestions derived from learner feedback'
          : 'Suggestions generated from teaching analytics'
      }
    >
      <div className="space-y-4">
        {sortedData.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800 p-4 transition hover:border-orange-500"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {item.description}
                </p>
              </div>
              <HealthBadge status={item.priority} />
            </div>

            <button className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300">
              {item.action}
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
