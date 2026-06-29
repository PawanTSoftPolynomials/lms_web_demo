import DashboardStatCard from '../common/DashboardStatCard';

export default function StatsGrid({ stats }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      <DashboardStatCard title="Courses" value={stats.courses} />

      <DashboardStatCard title="Modules" value={stats.modules} />

      <DashboardStatCard title="Quizzes" value={stats.quizzes} />

      <DashboardStatCard title="Questions" value={stats.questions} />
    </div>
  );
}
