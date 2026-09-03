"use client";

import { Inbox } from "lucide-react";

/**
 * Generic table shell reused across the Work module (Question Repository,
 * Upload Documents' file table), the Results student-results table, and the
 * My Courses table.
 *
 * columns: [{ key, header, render?(row), align? }]
 * rows: array of data objects (must have a stable `id` field, or pass rowKey)
 * skeletonRows: when set and isLoading, renders that many skeleton rows
 *   matching the column layout instead of the default centered spinner.
 */
export default function DataTable({
  columns,
  rows = [],
  isLoading = false,
  emptyLabel = "No records found.",
  rowKey = "id",
  onRowClick,
  stickyHeader = false,
  skeletonRows = 0,
}) {
  const headerClass = `border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest ${stickyHeader ? "sticky top-0 z-10 bg-card" : ""}`;

  if (isLoading && skeletonRows > 0) {
    return (
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs min-w-[600px]">
          <thead>
            <tr className={headerClass}>
              {columns.map((col) => (
                <th key={col.key} className="pb-3 pt-1 px-3 first:pl-0 last:pr-0 font-bold">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="py-3.5 px-3 first:pl-0 last:pr-0">
                    <div className="h-3.5 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 7) % 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
          <Inbox size={20} />
        </div>
        <p className="text-xs text-muted-foreground font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className="w-full text-left border-collapse text-xs min-w-[600px]">
        <thead>
          <tr className={headerClass}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-3 pt-1 px-3 first:pl-0 last:pr-0 font-bold ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, idx) => {
            const keyVal = typeof rowKey === "function" ? rowKey(row, idx) : row[rowKey] ?? idx;
            return (
              <tr
                key={keyVal}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-foreground/5 transition ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-2 first:pl-0 last:pr-0 text-foreground ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.render ? col.render(row, idx) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
