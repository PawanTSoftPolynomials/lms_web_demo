"use client";

import { Megaphone, AlertCircle, Sparkles, Bell, Clock, CheckCircle2 } from "lucide-react";

export function getCategoryIcon(type) {
  switch (type) {
    case "ANNOUNCEMENT":
    case "COURSE":
      return <Megaphone className="text-orange-400" size={18} />;
    case "ALERT":
      return <AlertCircle className="text-rose-400" size={18} />;
    case "SYSTEM":
      return <Sparkles className="text-blue-400" size={18} />;
    default:
      return <Bell className="text-purple-400" size={18} />;
  }
}

export function formatTimestamp(dateStr) {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnnouncementCard({ item, onMarkRead }) {
  return (
    <div
      onClick={() => !item.read && onMarkRead(item.id)}
      className={`p-4 rounded-2xl border transition duration-200 flex items-start justify-between gap-4 cursor-pointer ${
        !item.read
          ? "bg-slate-900/90 border-orange-500/30 shadow-md shadow-orange-500/5"
          : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60 opacity-80"
      }`}
    >
      {/* Left Side: Icon & Details */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 shrink-0 mt-0.5">
          {getCategoryIcon(item.type)}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white leading-snug truncate">
              {item.title || "Course Announcement"}
            </h3>

            {!item.read && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                New
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {item.message || item.body || item.content}
          </p>

          <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-slate-500" />
              {formatTimestamp(item.createdAt)}
            </span>
            {item.courseTitle && (
              <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 font-semibold border border-slate-700/40">
                {item.courseTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Mark Read Action */}
      {!item.read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(item.id);
          }}
          title="Mark as read"
          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <CheckCircle2 size={16} />
        </button>
      )}
    </div>
  );
}
