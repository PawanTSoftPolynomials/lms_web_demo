"use client";

import MiniCalendar from "@/components/dashboard/MiniCalendar";

export function DashboardCalendarWidget() {
  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
      <div className="mb-2">
        <h3 className="text-sm font-black text-slate-200">Calendar</h3>
      </div>
      <div className="dashboard-calendar-wrapper text-white scale-[0.95] origin-top">
        <MiniCalendar role="INSTRUCTOR" />
      </div>
    </div>
  );
}
