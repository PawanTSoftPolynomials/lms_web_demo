import DoughnutChartCard from "@/components/dashboard/common/DoughnutChartCard";

const statusColors = {
  "Not Submitted": "#ef4444",
  "In Progress": "#f59e0b",
  Submitted: "#3b82f6",
  Graded: "#22c55e",
};

export default function AssignmentSummaryPanel({
  statusCounts = {},
  upcomingDeadlines = [],
}) {
  const chartData = Object.entries(statusCounts).map(
    ([status, value]) => ({
      name: status,
      value,
    })
  );

  const total = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Submission Summary
            </p>
            <h2 className="text-2xl font-semibold text-white">{total}</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="text-sm text-slate-400">{status}</p>
              <p className="mt-2 text-xl font-semibold text-white">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <DoughnutChartCard
        title="Assignment Status"
        subtitle="Submission breakdown"
        data={chartData}
        colors={Object.keys(statusCounts).map(
          (status) => statusColors[status] ?? "#64748b"
        )}
        height={280}
      />

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Upcoming Deadlines
            </h2>
            <p className="text-sm text-slate-400">
              Due dates for your next assignments.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.slice(0, 4).map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl bg-slate-950 p-4"
              >
                <p className="text-sm text-slate-200">
                  {assignment.title}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {assignment.course?.title ?? assignment.courseTitle}
                </p>
                <p className="mt-2 text-sm text-orange-400">
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No upcoming deadlines.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
        <h2 className="text-xl font-semibold text-white">Quick Tips</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-400">
          <li>• Review the assignment instructions carefully.</li>
          <li>• Track due dates and prioritize upcoming work.</li>
          <li>• Submit before the deadline for full credit.</li>
          <li>• Keep your files and answers organized.</li>
        </ul>
      </div>
    </div>
  );
}
