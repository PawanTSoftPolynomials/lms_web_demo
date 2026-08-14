"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Read-only card for content the AI Course Importer couldn't map to a known
 * block type — mirrors ContentBlockCard's existing "legacy" (data:null)
 * fallback so nothing captured by the importer is ever silently dropped.
 */
export default function UnknownBlockView({ block }) {
  const original = block.original || {};

  return (
    <div className="space-y-2 rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wide">
        <AlertTriangle size={14} />
        Unmapped content — review needed
      </div>
      {original.sourcePath && (
        <p className="text-xs text-slate-400">Source: {original.sourcePath}</p>
      )}
      {original.reason && (
        <p className="text-xs text-slate-400">Reason: {original.reason}</p>
      )}
      {original.content && (
        <pre className="max-h-40 overflow-auto rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-400 whitespace-pre-wrap">
          {String(original.content).slice(0, 1000)}
        </pre>
      )}
    </div>
  );
}
