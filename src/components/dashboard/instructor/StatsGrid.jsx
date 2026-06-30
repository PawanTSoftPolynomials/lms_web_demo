import DashboardStatCard from "../shared/DashboardStatCard";

export default function StatsGrid({ stats = [] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <DashboardStatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
}