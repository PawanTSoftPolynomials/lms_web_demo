"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

/** Reusable page controls + rows-per-page selector for any server-paginated list. */
export default function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-4 border-t border-border">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Rows per page</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="glass-input rounded-[0.625rem] px-2 py-1 text-foreground outline-none"
        >
          {ROWS_PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="hidden sm:inline">• {total} total</span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="glass-button p-1.5 rounded-[0.625rem] bg-secondary/60 border border-border hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="glass-button p-1.5 rounded-[0.625rem] bg-secondary/60 border border-border hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
