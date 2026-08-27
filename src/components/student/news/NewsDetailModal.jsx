"use client";

import Link from "next/link";
import { FolderOpen, X, ExternalLink } from "lucide-react";

export default function NewsDetailModal({ news, onClose }) {
  if (!news) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-card-border bg-card p-5 sm:p-6 shadow-2xl space-y-4 relative text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${news.badgeColor}`}>
            {news.categoryLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {news.timestamp}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
          <FolderOpen size={14} className="shrink-0" />
          <span>{news.courseTag}</span>
        </div>

        <h2 className="text-lg font-black text-white leading-tight">
          {news.title}
        </h2>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-card-border text-xs text-slate-300 leading-relaxed space-y-2">
          <p>{news.content}</p>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
          >
            Close
          </button>
          <Link href={news.actionLink}>
            <button className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer">
              <span>{news.actionLabel}</span>
              <ExternalLink size={13} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
