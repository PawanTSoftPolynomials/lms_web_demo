import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function StatsGrid({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <DashboardStatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconBgClass={stat.iconBgClass}
          trend={stat.trend}
          trendLabel={stat.trendLabel}
          onClick={stat.onClick}
        />
      ))}
    </section>
  );
}