"use client";

import { Download } from "lucide-react";
import { getDisplayUrl } from "@/lib/blob";

// Downloadable-file list shared by the learning page's Resources panel and
// LessonTabs' "Notes & Attachments" tab — both filtered the same
// instructorAttachments array into near-identical cards; this is the one
// place that rendering now lives. `columns` / `showReadyBadge` reproduce
// each caller's existing layout so no visual behavior changes.
export default function LessonResourcesPanel({
  attachments = [],
  columns = 1,
  showReadyBadge = false,
  emptyMessage = "No downloadable resources for this lesson.",
}) {
  if (attachments.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={columns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}>
      {attachments.map((file, idx) => (
        <div
          key={file.id || idx}
          className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-orange-500/40 transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Download size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition">
                {file.title || "Class Attachment"}
              </p>
              <span className="text-[10px] text-slate-500 font-mono uppercase">
                {file.type || "FILE"}
                {showReadyBadge ? " • Ready" : ""}
              </span>
            </div>
          </div>
          {file.fileUrl ? (
            <a
              href={getDisplayUrl(file.fileUrl)}
              target="_blank"
              rel="noreferrer"
              download
              className="px-3 py-2 min-h-[44px] flex items-center gap-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase tracking-wider transition shadow-md shrink-0 cursor-pointer"
            >
              <Download size={11} />
              <span>Get</span>
            </a>
          ) : (
            <span className="text-[10px] text-slate-500 italic shrink-0">No File</span>
          )}
        </div>
      ))}
    </div>
  );
}
