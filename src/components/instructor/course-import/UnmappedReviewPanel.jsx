"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

export default function UnmappedReviewPanel({ unmapped = [], brokenReferences = [] }) {
  const [open, setOpen] = useState(false);

  if (!unmapped.length && !brokenReferences.length) return null;

  return (
    <div className="rounded-3xl bg-amber-950/20 border border-amber-800/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-amber-300">
          <AlertTriangle size={16} />
          {unmapped.length} unmapped element{unmapped.length === 1 ? "" : "s"}
          {brokenReferences.length ? `, ${brokenReferences.length} broken reference${brokenReferences.length === 1 ? "" : "s"}` : ""}
        </span>
        {open ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-amber-400" />}
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-3">
          {unmapped.map((item, i) => (
            <div key={i} className="text-xs text-amber-200/90 rounded-lg border border-amber-900/50 bg-slate-950/40 px-3 py-2">
              <span className="font-semibold">{item.module}</span> → <span className="font-semibold">{item.lesson}</span>
              {item.original?.sourcePath && <span className="block text-amber-300/70 mt-0.5">Source: {item.original.sourcePath}</span>}
              {item.original?.reason && <span className="block text-amber-300/70">Reason: {item.original.reason}</span>}
            </div>
          ))}
          {brokenReferences.map((item, i) => (
            <div key={`b-${i}`} className="text-xs text-rose-200/90 rounded-lg border border-rose-900/50 bg-slate-950/40 px-3 py-2">
              Broken local reference in <span className="font-semibold">{item.module}</span> → <span className="font-semibold">{item.lesson}</span>: {item.path}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
