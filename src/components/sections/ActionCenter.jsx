'use client';

import ActionCard from '../actions/ActionCard';

export default function ActionCenter({ role, data }) {
  const priorities = data?.priorities ?? [];

  // Categorize and sort tasks
  const categorizedPriorities = priorities.map((item) => {
    let severity = 'Upcoming';
    let color = item.color;

    // Unread messages or Inactive students need immediate attention
    if (
      (item.title.includes('Messages') && item.value !== '0') ||
      (item.title.includes('Students') && item.value !== '0' && item.value !== 'Active')
    ) {
      severity = 'Urgent';
      color = 'red';
    } 
    // If they are clear, mark as Completed
    else if (
      item.value === '0' || 
      item.value === 'Active' || 
      item.value === 'Published' || 
      item.title.includes('Clear') || 
      item.title.includes('Solid') || 
      item.title.includes('All Live')
    ) {
      severity = 'Completed';
      color = 'green';
    } 
    // Draft courses or preparation tasks are Upcoming
    else if (item.title.includes('Draft')) {
      severity = 'Upcoming';
      color = 'blue';
    }

    return {
      ...item,
      severity,
      color,
    };
  });

  // Sort priorities: Urgent first, then Upcoming, then Completed
  const severityOrder = { Urgent: 0, Upcoming: 1, Completed: 2 };
  const sortedPriorities = [...categorizedPriorities].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Action Center</h2>
          <p className="mt-1 text-xs text-slate-400">
            {role === 'course-author'
              ? 'High-impact next steps for your authored content.'
              : 'Immediate actions requiring your attention, categorized by urgency.'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {sortedPriorities.map((item) => (
          <ActionCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
