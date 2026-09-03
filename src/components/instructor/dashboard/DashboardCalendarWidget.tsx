"use client";

import MiniCalendar from "@/components/dashboard/MiniCalendar";

export function DashboardCalendarWidget() {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-luxury-sm">
      <div className="mb-2">
        <h3 className="text-sm font-extrabold text-foreground">Calendar</h3>
      </div>
      <div className="dashboard-calendar-wrapper text-foreground scale-[0.95] origin-top">
        <MiniCalendar role="INSTRUCTOR" />
      </div>
    </div>
  );
}
