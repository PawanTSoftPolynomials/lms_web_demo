"use client";

import Link from "next/link";
import { Video, Megaphone, ChevronRight, Clock } from "lucide-react";

function CircularProgress({ percent }) {
  const size = 96;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1A1F35" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f97316"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
      <text
        x="50%"
        y="50%"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white text-[20px] font-black"
      >
        {percent}%
      </text>
    </svg>
  );
}

// Compact right-rail widgets for the My Courses page — real data only:
// next calendar event, most recent notifications, and a progress summary
// derived from the same enrolledCoursesList already powering the cards.
export default function CoursesSidebar({ nextClass, announcements = [], progressSummary }) {
  return (
    <div className="space-y-4">
      {/* Today's Next Class */}
      <div className="rounded-xl bg-card border border-card-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-white">Today&apos;s Next Class</h3>
          <Link href="/student/calendar" className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5">
            View calendar <ChevronRight size={11} />
          </Link>
        </div>

        {nextClass ? (
          <div className="rounded-lg bg-[#141930] border border-card-border p-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Video size={16} className="text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{nextClass.courseName || nextClass.title}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{nextClass.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-2.5">
              <Clock size={11} className="text-orange-400" /> {nextClass.startTime || "Time TBA"}
            </div>
            {nextClass.link ? (
              <a
                href={nextClass.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-2 min-h-[36px] rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-[11px] font-black transition"
              >
                <Video size={12} /> Join Class
              </a>
            ) : null}
          </div>
        ) : (
          <div className="py-5 text-center text-[11px] text-slate-500 border border-dashed border-card-border rounded-lg">
            Nothing scheduled for today.
          </div>
        )}
      </div>

      {/* Latest Announcements */}
      <div className="rounded-xl bg-card border border-card-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-white">Announcements</h3>
          <Link href="/student/announcements" className="text-[10px] font-bold text-orange-400 hover:text-orange-300">
            View all
          </Link>
        </div>

        {announcements.length === 0 ? (
          <p className="text-[11px] text-slate-500 text-center py-4">No announcements yet.</p>
        ) : (
          <div className="space-y-2.5">
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Megaphone size={14} className="text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{a.title}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{a.time || ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="rounded-xl bg-card border border-card-border p-4">
        <h3 className="text-xs font-black text-white mb-3">Overall Progress</h3>
        <div className="flex items-center gap-4">
          <CircularProgress percent={progressSummary.overall} />
          <div className="flex-1 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Completed</span>
              <span className="text-white font-black">{progressSummary.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">In Progress</span>
              <span className="text-white font-black">{progressSummary.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Not Started</span>
              <span className="text-white font-black">{progressSummary.notStarted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
