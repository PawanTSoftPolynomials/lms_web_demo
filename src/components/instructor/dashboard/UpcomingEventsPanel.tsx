"use client";

import Link from "next/link";
import { Clock, Calendar as CalendarIcon, Video } from "lucide-react";
import type { ScheduleEvent } from "@/types/instructor-dashboard";

export function UpcomingEventsPanel({ events, isLoading }: { events: ScheduleEvent[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl"></div>;
  }

  const upcomingEvents = events.filter((e) => e.status === "upcoming" || e.status === "live").slice(0, 4);

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
        <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
          <CalendarIcon size={14} className="text-orange-400" />
          Upcoming Events
        </h3>
        <Link href="/instructor/calendar" className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
          Full Schedule
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-2">
              <Clock size={16} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Nothing scheduled for today</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className={`p-3 rounded-xl border transition ${
                event.status === "live" 
                  ? "bg-rose-500/10 border-rose-500/20" 
                  : "bg-[#141930] border-[#1A1F35] hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {event.status === "live" && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-white">{event.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400">{event.courseName}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black ${event.status === "live" ? "text-rose-400" : "text-sky-400"}`}>
                    {event.time}
                  </p>
                  <p className="text-[9px] text-slate-500">{event.type === "live" ? "Live Class" : "Meeting"}</p>
                </div>
              </div>
              
              {event.joinLink && (
                <div className="mt-3">
                  <a 
                    href={event.joinLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition ${
                      event.status === "live"
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
                    }`}
                  >
                    <Video size={12} />
                    {event.status === "live" ? "Join Now" : "Link"}
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
