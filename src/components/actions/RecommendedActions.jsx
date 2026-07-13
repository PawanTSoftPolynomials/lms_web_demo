'use client';

import { ArrowRight } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';
import HealthBadge from '@/components/ui/HealthBadge';

export default function RecommendedActions({ role, data }) {
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
