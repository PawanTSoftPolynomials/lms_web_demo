"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Video, ClipboardList, ClipboardCheck, HelpCircle, CalendarDays } from "lucide-react";

import { getCalendarEvents } from "@/services/calendar.service";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import CalendarView from "@/components/calendar/CalendarView";

const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getEventIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "class" || t === "lecture" || t === "office hours" || t === "session" || t === "live_class") return Video;
  if (t === "assignment" || t === "deadline") return ClipboardList;
  if (t === "exam") return ClipboardCheck;
  if (t === "quiz") return HelpCircle;
  return Clock;
};

const getEventBadge = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "assignment" || t === "deadline") return { label: "Assignment", className: "bg-purple-500/15 text-purple-300" };
  if (t === "exam") return { label: "Exam", className: "bg-rose-500/15 text-rose-300" };
  if (t === "quiz") return { label: "Quiz", className: "bg-orange-500/15 text-orange-300" };
  return { label: "Live Class", className: "bg-blue-500/15 text-blue-300" };
};

function EventRow({ event, showDate = false }) {
  const Icon = getEventIcon(event.type);
  const badge = getEventBadge(event.type);
  return (
    <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-[#141930] border border-[#1A1F35] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-slate-300" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-white truncate">{event.title}</h4>
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
          {showDate ? `${event.date} • ` : ""}
          {event.startTime || "All day"}
          {event.courseName ? ` • ${event.courseName}` : ""}
        </p>
      </div>
      <span className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
    </div>
  );
}

// Mobile-first Student calendar: Today's Schedule + Upcoming Events up top
// (what students actually need at a glance), a compact month preview, and
// the existing full CalendarView only when explicitly requested — instead
// of the desktop month grid compressed into a phone screen.
export default function MobileCalendarView() {
  const [showFull, setShowFull] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  const todayStr = toLocalDateString(new Date());

  const todaySchedule = useMemo(
    () =>
      events
        .filter((e) => e.date === todayStr)
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
    [events, todayStr]
  );

  const upcomingEvents = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const sevenDaysOut = new Date(start);
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

    return events
      .filter((e) => {
        if (!e.date || e.date === todayStr) return false;
        const d = new Date(`${e.date}T00:00:00`);
        return d >= start && d < sevenDaysOut;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
      .slice(0, 6);
  }, [events, todayStr]);

  if (showFull) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowFull(false)}
          className="flex items-center gap-1 text-xs font-bold text-orange-400 active:opacity-70 transition"
        >
          <ChevronLeft size={16} /> Back to Calendar
        </button>
        <CalendarView role="STUDENT" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">Calendar</h1>

      {/* Today's Schedule */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <h2 className="text-xs font-black text-white mb-2.5">Today&apos;s Schedule</h2>
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2].map((n) => (
              <div key={n} className="h-[54px] rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : todaySchedule.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
            Nothing scheduled for today.
          </div>
        ) : (
          <div className="space-y-2.5">
            {todaySchedule.map((event) => (
              <EventRow key={event.id || event._id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <h2 className="text-xs font-black text-white mb-2.5">Upcoming Events</h2>
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2].map((n) => (
              <div key={n} className="h-[54px] rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
            Nothing scheduled for the next 7 days.
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingEvents.map((event) => (
              <EventRow key={event.id || event._id} event={event} showDate />
            ))}
          </div>
        )}
      </div>

      {/* Mini Calendar Preview */}
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
        <h2 className="text-xs font-black text-white mb-2.5 flex items-center gap-2">
          <CalendarDays size={14} className="text-orange-400" /> Month Preview
        </h2>
        <MiniCalendar role="STUDENT" />
      </div>

      {/* View Full Calendar */}
      <button
        type="button"
        onClick={() => setShowFull(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 active:bg-orange-600 text-slate-950 font-black text-sm py-3 min-h-[44px] transition"
      >
        View Full Calendar <ChevronRight size={16} />
      </button>
    </div>
  );
}
