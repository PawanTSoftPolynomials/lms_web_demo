'use client';

import ActionCard from '../actions/ActionCard';

export default function ActionCenter({ role, data }) {
  const priorities = data?.priorities ?? [];

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Action Center</h2>
          <p className="mt-1 text-sm text-slate-400">
            {role === 'course-author'
              ? 'High-impact next steps for your authored content.'
              : 'Immediate actions requiring your attention.'}
          </p>
        </div>

        <button className="text-orange-400 hover:underline">View All</button>
      </div>

      <div className={`grid gap-4 grid-cols-1 ${priorities.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        {priorities.map((item) => (
          <ActionCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
