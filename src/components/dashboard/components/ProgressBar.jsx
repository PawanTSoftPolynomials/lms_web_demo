export default function ProgressBar({
  value = 0,
  max = 100,
  showLabel = true,
  colorClass = "bg-orange-500",
  className = "",
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Progress</span>
          <span className="font-medium text-slate-200">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}