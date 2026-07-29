"use client";

import { Search, X } from "lucide-react";

export default function QuizFilters({
  search,
  setSearch,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-3.5 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input with Search Icon & Clear Action */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#07080f] pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-500/60 min-h-[44px]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="w-full sm:w-56 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#07080f] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white outline-none transition focus:border-orange-500/60 cursor-pointer min-h-[44px]"
          >
            <option value="latest">Latest Added</option>
            <option value="title">Quiz Name (A-Z)</option>
            <option value="questions">Most Questions</option>
            <option value="passingScore">Highest Passing Score</option>
            <option value="timeLimit">Longest Duration</option>
          </select>
        </div>
      </div>
    </div>
  );
}