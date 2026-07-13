'use client';

import { ArrowRight } from 'lucide-react';

import ChartCard from '@/components/ui/ChartCard';
import HealthBadge from '@/components/ui/HealthBadge';

export default function StudentsNeedingAttention({ role, data }) {
  const isAuthor = role === 'course-author';

  return (
    <ChartCard
      title={isAuthor ? 'Content Pending Review' : 'Students Needing Attention'}
      subtitle={
        isAuthor
          ? 'Items that need a content review pass'
          : 'Students requiring instructor intervention'
      }
      action="View All"
    >
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 p-4 transition hover:border-orange-500"
          >
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.course}</p>
              <p className="mt-2 text-sm text-orange-400">{item.issue}</p>
              <p className="mt-1 text-xs text-slate-500">
                Last activity • {item.lastActivity}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <HealthBadge status={item.severity} />
              <button className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300">
                {isAuthor ? 'Review Item' : 'View Profile'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
