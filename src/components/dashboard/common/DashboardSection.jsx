import Card from "@/components/ui/Card";

export default function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <Card
      className={`h-full border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div className="flex shrink-0 items-center">
              {action}
            </div>
          )}
        </div>
      )}

      <div className={contentClassName}>
        {children}
      </div>
    </Card>
  );
}