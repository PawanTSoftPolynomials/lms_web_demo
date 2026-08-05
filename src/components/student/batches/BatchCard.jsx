"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, Clock, User, MoreVertical, ArrowRight, BookOpen } from "lucide-react";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// Student-facing batch card — same rounded-2xl / #0D1021 / #1A1F35 card
// language as the Instructor batches grid (KpiTile/EmptyState below are the
// literal same shared components), but built from the lighter
// getStudentBatches() response (no completion/quiz analytics — those come
// from the instructor-only performance-overview endpoint students can't call).
export default function BatchCard({ batch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  const statusClass = STATUS_STYLES[batch.status] || STATUS_STYLES.ACTIVE;
  const scheduleLabel = batch.startTime && batch.endTime ? `${batch.startTime} - ${batch.endTime}` : "Schedule TBA";

  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 flex flex-col gap-3 shadow-sm hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black text-sm shrink-0">
          {batch.course?.title?.[0]?.toUpperCase() || <BookOpen size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-slate-500 truncate">{batch.course?.title}</p>
          <p className="text-sm font-black text-white truncate">{batch.name}</p>
          <span className={`inline-flex items-center mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusClass}`}>
            {batch.status || "ACTIVE"}
          </span>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 rounded-2xl border border-[#1A1F35] bg-[#0A0D1B] p-1.5 shadow-2xl">
              <Link
                href={`/student/batches/${batch.id}/classmates`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition py-2 px-2.5 rounded-xl hover:bg-white/5"
              >
                <Users size={14} /> Classmates
              </Link>
              <Link
                href={`/student/batches/${batch.id}/discussions`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition py-2 px-2.5 rounded-xl hover:bg-white/5"
              >
                <ArrowRight size={14} /> Discussions
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-[#1A1F35]/70">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <User size={12} className="text-slate-500 shrink-0" />
          <span className="truncate">{batch.course?.instructor || "Instructor TBA"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Users size={12} className="text-slate-500 shrink-0" />
          <span>{batch.studentsCount} students</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock size={12} className="text-slate-500 shrink-0" />
          <span className="truncate">{scheduleLabel}</span>
        </div>
      </div>

      <Link
        href={`/student/batches/${batch.id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition"
      >
        Open Batch <ArrowRight size={13} />
      </Link>
    </div>
  );
}
