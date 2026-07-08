"use client";

import Card from "@/components/ui/Card";
import { HiOutlineClock } from "react-icons/hi";

export default function RecentActivity({ activities = [] }) {
  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>

        <p className="mt-1 text-sm text-slate-400">
          Latest instructor activity
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/30">
          <HiOutlineClock size={36} className="mb-3 text-slate-500" />

          <p className="text-base font-medium text-slate-300">
            No recent activity
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Activity will appear here once available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800/40 p-4 transition-colors hover:border-orange-500/40"
            >
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                  activity.iconBgClass || "bg-orange-500/10 text-orange-400"
                }`}
              >
                {activity.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white">{activity.title}</h3>

                {activity.description && (
                  <p className="mt-1 text-sm text-slate-400">
                    {activity.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
