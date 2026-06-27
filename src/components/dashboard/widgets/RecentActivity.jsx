"use client";

import DashboardSection from "@/components/dashboard/common/DashboardSection";
import EmptyState from "@/components/ui/EmptyState";

export default function RecentActivity({
  title = "Recent Activity",
  subtitle = "Latest updates",
  activities = [],
  action,
}) {
  return (
    <DashboardSection
      title={title}
      subtitle={subtitle}
      action={action}
    >
      {activities.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Recent activity will appear here."
        />
      ) : (
        <div className="space-y-5">
          {activities.map((activity, index) => (
            <div
              key={activity.id ?? index}
              className="flex items-start gap-4"
            >
              {/* Icon */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  activity.iconBgClass ??
                  "bg-orange-500/10 text-orange-400"
                }`}
              >
                {activity.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-white">
                      {activity.title}
                    </h4>

                    {activity.description && (
                      <p className="mt-1 text-sm text-slate-400">
                        {activity.description}
                      </p>
                    )}
                  </div>

                  {activity.time && (
                    <span className="shrink-0 text-xs text-slate-500">
                      {activity.time}
                    </span>
                  )}
                </div>

                {index !== activities.length - 1 && (
                  <div className="mt-5 border-b border-slate-800" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}