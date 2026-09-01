"use client";

import { useMemo, useState } from "react";
import { Newspaper, Search, RotateCcw } from "lucide-react";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const toolbarControlClass =
  "h-9 bg-card border border-border text-xs px-3 rounded-xl outline-none text-foreground focus:border-primary/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-card [&>option]:text-foreground";

/** Compact search + filter toolbar, structurally ready for a future News API
 * (search/course/date all operate on real state already) — Category is left
 * out of the toolbar entirely since no news-category taxonomy exists anywhere
 * in the app yet, and inventing one here would be fabricated data. */
function NewsFilters({ search, setSearch, courseId, setCourseId, startDate, endDate, setDateRange }) {
  const { data: courses = [] } = useInstructorCourses();
  const hasAnyFilter = Boolean(courseId || startDate || endDate);

  const handleReset = () => {
    setCourseId("");
    setDateRange("", "");
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news, announcements, updates..."
          className="w-full h-11 bg-card border border-border text-sm pl-10 pr-4 rounded-xl outline-none text-foreground placeholder-slate-500 focus:border-primary/60 transition"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className={toolbarControlClass}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(nextStart, nextEnd) => setDateRange(nextStart, nextEnd)}
          triggerClassName="h-9 py-0"
        />

        {hasAnyFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-muted-foreground transition hover:text-foreground"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/** Renders one news item. Shaped to match what a future News API would return
 * (id/title/description/category/course/author/publishedAt) — unused until
 * that API exists, kept here so wiring it in later needs no UI rewrite. */
function NewsCard({ item }) {
  const publishedLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[9.5px] font-black uppercase tracking-widest text-primary">{item.category}</span>
        {publishedLabel && <span className="shrink-0 text-[10px] text-muted-foreground font-mono">{publishedLabel}</span>}
      </div>
      <p className="text-[13px] font-bold text-foreground mt-2 leading-relaxed">{item.title}</p>
      {item.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.description}</p>}
      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/60">
        <span className="text-[10.5px] text-muted-foreground">{item.course || ""}</span>
        <button type="button" className="text-[10.5px] font-bold text-primary hover:text-orange-300 transition">
          Read More →
        </button>
      </div>
    </div>
  );
}

function NewsEmptyState() {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center gap-2 text-center py-14">
      <Newspaper size={22} className="text-slate-600" />
      <p className="text-sm font-bold text-foreground">No news yet</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Platform and course updates will appear here when they are published.
      </p>
    </div>
  );
}

export default function InstructorNewsPage() {
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredItems = useMemo(() => {
    // No News API exists yet — this stays an empty list rather than
    // fabricated items. Swap in a real `useNews({ courseId, startDate,
    // endDate })` query here once one exists; the filtering below already
    // expects that exact shape, so only the data source needs to change.
    const newsItems = [];

    const term = search.trim().toLowerCase();
    return newsItems.filter((item) => {
      if (courseId && item.courseId !== courseId) return false;
      if (startDate && new Date(item.publishedAt) < new Date(startDate)) return false;
      if (endDate && new Date(item.publishedAt) > new Date(endDate)) return false;
      if (!term) return true;
      const haystack = [item.title, item.description, item.category, item.course]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [search, courseId, startDate, endDate]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="sr-only">News</h1>
          <p className="sr-only">Platform and course-related news for instructors.</p>
        </div>
      </div>

      <NewsFilters
        search={search}
        setSearch={setSearch}
        courseId={courseId}
        setCourseId={setCourseId}
        startDate={startDate}
        endDate={endDate}
        setDateRange={(nextStart, nextEnd) => {
          setStartDate(nextStart);
          setEndDate(nextEnd);
        }}
      />

      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-sm font-black text-foreground tracking-tight">Latest Updates</h2>
          <span className="text-xs font-bold text-muted-foreground">
            {filteredItems.length} update{filteredItems.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4">
          {filteredItems.length === 0 ? (
            <NewsEmptyState />
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
