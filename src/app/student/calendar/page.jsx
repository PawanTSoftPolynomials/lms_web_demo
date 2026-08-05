"use client";

import CalendarView from "@/components/calendar/CalendarView";
import MobileCalendarView from "@/components/student/calendar/MobileCalendarView";

export default function StudentCalendarPage() {
  return (
    <>
      <div className="sm:hidden">
        <MobileCalendarView />
      </div>
      <div className="hidden sm:block">
        <CalendarView role="STUDENT" />
      </div>
    </>
  );
}
