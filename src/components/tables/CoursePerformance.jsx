'use client';

import ChartCard from '@/components/ui/ChartCard';

export default function CoursePerformance({ data }) {
  return (
    <ChartCard 
      title="Courses & Cohorts" 
      subtitle="Catalog of assigned and authored courses" 
      action="View Catalog"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="pb-4 text-left text-sm font-medium text-slate-400">
                Course
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-400">
                Type
              </th>
              <th className="pb-4 text-right text-sm font-medium text-slate-400">
                Enrolled Students
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((course) => (
              <tr
                key={course.id}
                className="border-b border-slate-800 transition hover:bg-slate-800/40"
              >
                <td className="py-4">
                  <div className="flex flex-col items-start text-left font-medium text-white">
                    <span>{course.course}</span>
                    {course.meta && (
                      <span className="text-xs font-normal text-slate-500">
                        {course.meta}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      course.type === 'AUTHORED'
                        ? 'border border-orange-500/20 bg-orange-500/10 text-orange-400'
                        : 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {course.type === 'AUTHORED' ? 'Authored Course' : 'Assigned Course'}
                  </span>
                </td>
                <td className="py-4 text-right font-semibold text-slate-200">
                  {course.enrolledStudents?.toLocaleString() ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
