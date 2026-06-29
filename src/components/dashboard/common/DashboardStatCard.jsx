import Card from "@/components/ui/Card";
import TrendBadge from "@/components/dashboard/components/TrendBadge";

export default function DashboardStatCard({
  title,
  value,
  icon,
  iconBgClass = "bg-orange-500/15",
  trend,
  trendLabel,
  onClick,
  className = "",
}) {


  return (
    <Card
      onClick={onClick}
      className={`
        group h-full border border-slate-700/50
        bg-slate-900/60 backdrop-blur-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:border-orange-500/40
        hover:shadow-lg hover:shadow-orange-500/10
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>

          {typeof trend === "number" && (
            <div className="mt-4">
              <TrendBadge value={trend} label={trendLabel} />
            </div>
          )}
        </div>

        <div
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-2xl
            ${iconBgClass}
          `}
        >
          <div className="text-2xl text-white">{icon}</div>
        </div>
      </div>
    </Card>
  );
}
