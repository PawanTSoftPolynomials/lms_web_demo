import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";

export default function TrendBadge({
  value = 0,
  label = "",
  showSign = true,
  className = "",
}) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const Icon = isPositive
    ? FaArrowTrendUp
    : isNegative
    ? FaArrowTrendDown
    : FaMinus;

  const badgeStyles = isPositive
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    : isNegative
    ? "bg-red-500/10 text-red-400 border border-red-500/20"
    : "bg-slate-700/40 text-slate-400 border border-slate-600";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyles} ${className}`}
    >
      <Icon className="text-[10px]" />

      <span>
        {showSign && value > 0 && "+"}
        {value}
      </span>

      {label && <span>{label}</span>}
    </div>
  );
}