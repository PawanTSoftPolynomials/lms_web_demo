"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const STAT_LABELS = {
  text: "Text blocks",
  image: "Images",
  video: "Videos",
  audio: "Audio",
  document: "Documents",
  slideshow: "Slideshows",
  interactive: "Embeds",
  link: "Links",
  quiz: "Quiz questions",
  code: "Code blocks",
  unknown: "Unmapped",
};

export default function ValidationReportCard({ report }) {
  if (!report) return null;

  const { summary, errors = [], warnings = [] } = report;

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        {errors.length ? (
          <XCircle className="w-5 h-5 text-rose-400" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        )}
        <h3 className="text-base font-bold text-slate-100">Import Validation</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-mono">Modules</span>
          <p className="text-lg font-bold text-slate-200">{summary?.totalModules ?? 0}</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-mono">Lessons</span>
          <p className="text-lg font-bold text-slate-200">{summary?.totalLessons ?? 0}</p>
        </div>
        {Object.entries(summary?.counts || {}).map(([type, count]) => (
          <div key={type} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono">{STAT_LABELS[type] || type}</span>
            <p className={`text-lg font-bold ${type === "unknown" ? "text-amber-400" : "text-slate-200"}`}>{count}</p>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-rose-300">
              <XCircle size={14} className="shrink-0" /> {e}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-amber-300">
              <AlertTriangle size={14} className="shrink-0" /> {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
