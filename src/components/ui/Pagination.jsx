"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

/** Reusable page controls + rows-per-page selector for any server-paginated list. */
export default function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-4 border-t border-[#1A1F35]">
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <span>Rows per page</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none focus:border-orange-500/50"
        >
          {ROWS_PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="hidden sm:inline">• {total} total</span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
