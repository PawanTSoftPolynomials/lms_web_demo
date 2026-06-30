import Card from "@/components/ui/Card";
import { FaArrowTrendUp } from "react-icons/fa6";

const colorClasses = {
  blue: {
    icon: "bg-blue-500/15 text-blue-400",
    border: "hover:border-blue-500/40",
  },
  violet: {
    icon: "bg-violet-500/15 text-violet-400",
    border: "hover:border-violet-500/40",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400",
    border: "hover:border-emerald-500/40",
  },
  orange: {
    icon: "bg-orange-500/15 text-orange-400",
    border: "hover:border-orange-500/40",
  },
};

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "orange",
}) {
  const styles = colorClasses[color] ?? colorClasses.orange;

  return (
    <Card
      className={`
        border border-slate-700/50
        transition-all duration-300
        hover:-translate-y-1
        ${styles.border}
      `}
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-12 w-12 items-center justify-center
            rounded-xl
            ${styles.icon}
          `}
        >
          {Icon && <Icon size={22} />}
        </div>

        <FaArrowTrendUp className="text-xs text-emerald-400" />
      </div>

      <div className="mt-6">
        <h2 className="text-3xl font-bold text-white">
          {value}
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-300">
          {title}
        </p>

        {subtitle && (
          <p className="mt-3 text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}