"use client";

import Link from "next/link";

import DashboardSection from "@/components/dashboard/common/DashboardSection";
import EmptyState from "@/components/ui/EmptyState";

export default function QuickActions({
  title = "Quick Actions",
  subtitle = "Frequently used actions",
  actions = [],
}) {
  return (
    <DashboardSection
      title={title}
      subtitle={subtitle}
    >
      {actions.length === 0 ? (
        <EmptyState
          title="No actions available"
          description="Quick actions will appear here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const content = (
              <div className="group flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-slate-800/70">
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${
                    action.iconBgClass ??
                    "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {action.icon}
                </div>

                <h4 className="text-sm font-semibold text-white">
                  {action.label}
                </h4>

                {action.description && (
                  <p className="mt-1 text-xs text-slate-400">
                    {action.description}
                  </p>
                )}
              </div>
            );

            if (action.href) {
              return (
                <Link
                  key={action.id ?? index}
                  href={action.href}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={action.id ?? index}
                type="button"
                onClick={action.onClick}
                className="text-left"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}