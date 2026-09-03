"use client";

import Link from "next/link";
import { Clock, Calendar as CalendarIcon, Video } from "lucide-react";
import type { ScheduleEvent } from "@/types/instructor-dashboard";

export function UpcomingEventsPanel({ events, isLoading }: { events: ScheduleEvent[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  const upcomingEvents = events.filter((e) => e.status === "upcoming" || e.status === "live").slice(0, 4);

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-luxury-sm">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <CalendarIcon size={15} className="text-primary" />
          Upcoming Events
        </h3>
        <Link href="/instructor/calendar" className="text-xs text-primary font-bold hover:underline">
          Full Schedule
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
              <Clock size={16} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Nothing scheduled for today</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className={`p-3 rounded-xl border transition-all duration-200 ${
                event.status === "live" 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-surface-muted/40 border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {event.status === "live" && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-foreground">{event.title}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{event.courseName}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-extrabold ${event.status === "live" ? "text-destructive" : "text-primary"}`}>
                    {event.time}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-medium">{event.type === "live" ? "Live Class" : "Meeting"}</p>
                </div>
              </div>
              
              {event.joinLink && (
                <div className="mt-3">
                  <a 
                    href={event.joinLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                      event.status === "live"
                        ? "bg-destructive hover:brightness-110 text-destructive-foreground shadow-sm"
                        : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
                    }`}
                  >
                    <Video size={13} />
                    {event.status === "live" ? "Join Live Session" : "Join Link"}
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
