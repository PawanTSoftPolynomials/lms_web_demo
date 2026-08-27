"use client";

import Link from "next/link";
import { Calendar, FolderOpen, ArrowRight } from "lucide-react";

export default function NewsCard({ item, onOpen }) {
  return (
    <div className="relative flex items-start gap-3 sm:gap-4 pb-3">
      <span
        aria-hidden="true"
        className="relative z-10 mt-5 sm:mt-6 h-[17px] w-[17px] sm:h-[21px] sm:w-[21px] shrink-0 rounded-full border-2 border-orange-500 bg-[#080B11]"
      />
      <div
        onClick={() => onOpen(item)}
        className="flex-1 min-w-0 rounded-2xl border border-card-border bg-card p-4 hover:border-slate-700 transition duration-200 cursor-pointer group shadow-sm hover:shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${item.badgeColor}`}>
            {item.categoryLabel}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Calendar size={11} className="text-slate-500" />
            {item.timestamp}
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
          {item.title}
        </h3>

        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
          {item.summary}
        </p>

        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-300 border-t border-slate-800/60 pt-2.5">
          <FolderOpen size={13} className="text-orange-400 shrink-0" />
          <span className="truncate">{item.courseTag}</span>
        </div>

        <div className="pt-2.5 mt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold">
          <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">
            Click for details
          </span>
          <Link
            href={item.actionLink}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition text-[11px] font-black uppercase tracking-wider"
          >
            <span>START</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
