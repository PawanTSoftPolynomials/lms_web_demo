"use client";

import { Search, RefreshCw, Download, LayoutGrid, Table2 } from "lucide-react";

const CATEGORY_OPTIONS = ["Programming", "Business", "Marketing", "Design", "Others"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "most_students", label: "Most Students" },
  { value: "alphabetical", label: "Alphabetical" },
];

const selectClass =
  "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500/60 transition";

/** Search + Status/Category/Level filters + Sort + Refresh + Export + view toggle for My Courses. */
export default function CourseToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
  sortBy,
  onSortChange,
  onRefresh,
  onExport,
  view,
  onViewChange,
}) {
  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, category, creator, tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-orange-500/60 transition"
          />
        </div>

        <select className={selectClass} value={status} onChange={(e) => onStatusChange(e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select className={selectClass} value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className={selectClass} value={level} onChange={(e) => onLevelChange(e.target.value)}>
          <option value="">All Levels</option>
          {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select className={selectClass} value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button
          onClick={onRefresh}
          title="Refresh"
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
        >
          <RefreshCw size={14} />
        </button>

        <button
          onClick={onExport}
          title="Export CSV"
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
        >
          <Download size={14} />
        </button>

        <div className="flex items-center rounded-xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => onViewChange("table")}
            title="Table view"
            className={`p-2 transition ${view === "table" ? "bg-orange-500/15 text-orange-450" : "text-slate-400 hover:text-white"}`}
          >
            <Table2 size={14} />
          </button>
          <button
            onClick={() => onViewChange("grid")}
            title="Grid view"
            className={`p-2 transition ${view === "grid" ? "bg-orange-500/15 text-orange-450" : "text-slate-400 hover:text-white"}`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
