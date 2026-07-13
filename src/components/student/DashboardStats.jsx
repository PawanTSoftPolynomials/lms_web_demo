import StatCard from "./StatCard";

export default function DashboardStats({
  stats,
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <StatCard
        title="Enrolled Courses"
        value={stats.enrolled}
        color="text-orange-500"
      />

      <StatCard
        title="Completed Lessons"
        value={stats.completed}
        color="text-green-500"
      />

      <StatCard
        title="Progress"
        value={`${stats.progress}%`}
        color="text-blue-500"
      />
    </div>
  );
}