"use client";

import { useState, useMemo } from "react";
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Loader2,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  RadioTower,
} from "lucide-react";
import { useLiveClasses } from "@/hooks/queries/student/useLiveClasses";

const statusBadge = (status) => {
  switch (status) {
    case "LIVE":
      return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-red-500 text-white rounded-full animate-pulse"><RadioTower size={10} /> Live Now</span>;
    case "COMPLETED":
      return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full"><CheckCircle size={10} /> Completed</span>;
    case "CANCELLED":
      return <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-800 border border-slate-700/50 text-slate-400 rounded-full">Cancelled</span>;
    default:
      return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full"><Calendar size={10} /> Scheduled</span>;
  }
};

export default function LiveClassesPage() {
  const [statusFilter, setStatusFilter] = useState("upcoming");

  const { data: liveClasses = [], isLoading, isError } = useLiveClasses(
    statusFilter === "all" ? { all: true } : statusFilter === "completed" ? { status: "COMPLETED" } : {}
  );

  const now = new Date();

  // Separate live vs upcoming
  const liveNow = useMemo(() => liveClasses.filter((c) => c.status === "LIVE"), [liveClasses]);
  const upcoming = useMemo(() =>
    liveClasses
      .filter((c) => c.status === "SCHEDULED" && new Date(c.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
    [liveClasses]
  );

  const displayed = statusFilter === "completed"
    ? liveClasses
    : statusFilter === "all"
    ? liveClasses
    : [...liveNow, ...upcoming];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Live Classes</h1>
          <p className="text-xs text-slate-400 mt-1">Join instructor-led live sessions for your courses</p>
        </div>
      </div>

      {/* Live Now Banner */}
      {liveNow.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <RadioTower size={22} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Happening Now</p>
                <h2 className="text-base font-black leading-tight">{liveNow[0].title}</h2>
                <p className="text-xs opacity-80 mt-0.5">{liveNow[0].topic || liveNow[0].course?.title}</p>
              </div>
            </div>
            {liveNow[0].meetingUrl && (
              <a
                href={liveNow[0].meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-white text-red-600 font-black text-xs px-5 py-2.5 rounded-xl shadow hover:shadow-md transition cursor-pointer"
              >
                <PlayCircle size={15} /> Join Now
              </a>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: "upcoming", label: "Upcoming" },
          { value: "completed", label: "Completed" },
          { value: "all", label: "All" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
              statusFilter === tab.value
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-slate-900/50 text-slate-400 border-slate-800/80 hover:border-orange-500/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading classes…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-red-500 gap-2 text-sm">
          <AlertCircle size={18} /> Failed to load live classes.
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <Video size={40} className="mx-auto mb-3 opacity-40 text-slate-450" />
          <p className="text-sm font-semibold text-white">No classes scheduled</p>
          <p className="text-xs mt-1 text-slate-400">Your instructor hasn't scheduled any live classes yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((cls) => {
            const date = new Date(cls.scheduledAt);
            return (
              <div key={cls.id} className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md hover:border-orange-500/30 transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl flex-shrink-0">
                      <Video size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="text-sm font-black text-white">{cls.title}</h3>
                        {statusBadge(cls.status)}
                      </div>
                      {cls.topic && <p className="text-xs text-slate-400 mb-2">{cls.topic}</p>}
                      {cls.course && (
                        <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                          {cls.course.title}
                        </span>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1"><Calendar size={11} />{date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        {cls.duration && <span className="flex items-center gap-1"><Clock size={11} />{cls.duration} min</span>}
                      </div>
                    </div>
                  </div>

                  {cls.meetingUrl && cls.status !== "COMPLETED" && cls.status !== "CANCELLED" && (
                    <a
                      href={cls.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition flex-shrink-0 cursor-pointer ${
                        cls.status === "LIVE"
                          ? "bg-red-650 text-white hover:bg-red-700 shadow"
                          : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20"
                      }`}
                    >
                      <ExternalLink size={13} />
                      {cls.status === "LIVE" ? "Join Live" : "Meeting Link"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
