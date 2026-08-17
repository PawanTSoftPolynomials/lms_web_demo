"use client";

import { useMemo, useState } from "react";
import { HelpCircle, Search, Send, Loader2, RotateCcw } from "lucide-react";

import { WorkFilterProvider, useWorkFilters } from "@/context/WorkFilterContext";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useLessons } from "@/hooks/queries/instructor/useLessons";
import { useCourseBatches } from "@/hooks/queries/instructor/useBatches";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import {
  useMyLessonQueries,
  useReplyToLessonQuery,
} from "@/hooks/queries/instructor/useLessonQueries";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ANSWERED", label: "Answered" },
];

const STATUS_META = {
  PENDING: { label: "Unanswered", dot: "bg-amber-400", text: "text-amber-400" },
  ANSWERED: { label: "Answered", dot: "bg-emerald-400", text: "text-emerald-400" },
};

const toolbarControlClass =
  "h-9 bg-[#0D1021] border border-[#1A1F35] text-xs px-3 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#0D1021] [&>option]:text-slate-200";

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
};

/** Compact inline replacement for the old bordered WorkFilterBar panel — same
 * useWorkFilters() context/logic (Course/Batch/Module/Lesson/Status/Date),
 * just laid out as a single wrapping toolbar row instead of a large grid. */
function FilterToolbar({ onResetAll }) {
  const { filters, updateFilter, resetFilters } = useWorkFilters();
  const { data: courses = [] } = useInstructorCourses();
  const { data: batches = [] } = useCourseBatches(filters.courseId);
  const { data: modules = [] } = useModules(filters.courseId);
  const { data: lessons = [] } = useLessons(filters.moduleId);

  const handleReset = () => {
    resetFilters();
    onResetAll();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.courseId}
        onChange={(e) => updateFilter("courseId", e.target.value)}
        className={toolbarControlClass}
      >
        <option value="">All Courses</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      <select
        value={filters.batchId}
        onChange={(e) => updateFilter("batchId", e.target.value)}
        disabled={!filters.courseId}
        className={toolbarControlClass}
      >
        <option value="">All Batches</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <select
        value={filters.moduleId}
        onChange={(e) => updateFilter("moduleId", e.target.value)}
        disabled={!filters.courseId}
        className={toolbarControlClass}
      >
        <option value="">All Modules</option>
        {modules.map((m) => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>

      <select
        value={filters.lessonId}
        onChange={(e) => updateFilter("lessonId", e.target.value)}
        disabled={!filters.moduleId}
        className={toolbarControlClass}
      >
        <option value="">All Lessons</option>
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>{l.title}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => updateFilter("status", e.target.value)}
        className={toolbarControlClass}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={(nextStart, nextEnd) => {
          updateFilter("startDate", nextStart);
          updateFilter("endDate", nextEnd);
        }}
        triggerClassName="h-9 py-0"
      />

      <button
        type="button"
        onClick={handleReset}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-400 transition hover:text-white"
      >
        <RotateCcw size={12} />
        Reset
      </button>
    </div>
  );
}

function ReplyBox({ queryId }) {
  const [reply, setReply] = useState("");
  const replyMutation = useReplyToLessonQuery();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    replyMutation.mutate({ queryId, reply: reply.trim() }, { onSuccess: () => setReply("") });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2.5">
      <input
        type="text"
        placeholder="Write a reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
      />
      <button
        type="submit"
        disabled={replyMutation.isPending || !reply.trim()}
        className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 transition"
      >
        {replyMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
      </button>
    </form>
  );
}

function QuestionCard({ query: q }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[q.status] || STATUS_META.PENDING;
  const studentName = q.student?.user?.name || "Student";
  const contextLabel = [q.lesson?.module?.course?.title, q.lesson?.module?.title, q.lesson?.title]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="p-4 rounded-xl border border-[#1A1F35] bg-[#0D1021]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] text-slate-500 font-semibold truncate min-w-0">{contextLabel}</p>
        <span className="shrink-0 text-[10px] text-slate-500 font-mono">{timeAgo(q.createdAt)}</span>
      </div>

      <p className={`text-[13px] font-bold text-slate-100 mt-2 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
        {q.question}
      </p>

      <p className="text-[10.5px] text-slate-500 mt-2">
        Student: <span className="text-slate-300 font-semibold">{studentName}</span>
      </p>

      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1A1F35]/60">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${meta.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[10.5px] font-bold text-orange-400 hover:text-orange-300 transition"
        >
          {expanded ? "Hide question ↑" : "View Question →"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3">
          {q.reply && (
            <div className="pl-3 border-l-2 border-orange-500/30">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-wide">Your reply</p>
              <p className="text-xs text-slate-300 mt-1">{q.reply}</p>
            </div>
          )}
          {q.status !== "ANSWERED" && <ReplyBox queryId={q.id} />}
        </div>
      )}
    </div>
  );
}

function QAContent() {
  const { appliedFilters } = useWorkFilters();
  const { data: queries = [], isLoading } = useMyLessonQueries(appliedFilters);
  const [search, setSearch] = useState("");

  const filteredQueries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return queries;
    return queries.filter((q) => {
      const haystack = [
        q.question,
        q.student?.user?.name,
        q.lesson?.title,
        q.lesson?.module?.title,
        q.lesson?.module?.course?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [queries, search]);

  const hasAnyQuestions = queries.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Q&amp;A</h1>
        <p className="text-xs text-slate-400 mt-1">Student doubts raised across every lesson in your courses.</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions, students, lessons..."
          className="w-full h-11 bg-[#0D1021] border border-[#1A1F35] text-sm pl-10 pr-4 rounded-xl outline-none text-slate-200 placeholder-slate-500 focus:border-orange-500/60 transition"
        />
      </div>

      <FilterToolbar onResetAll={() => setSearch("")} />

      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1F35]">
          <h2 className="text-sm font-black text-white tracking-tight">Questions</h2>
          <span className="text-xs font-bold text-slate-500">{filteredQueries.length}</span>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-slate-800/40 rounded-xl" />
              ))}
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-2">
              <HelpCircle size={20} className="text-slate-600" />
              <p className="text-sm font-bold text-slate-300">
                {hasAnyQuestions ? "No questions match your search or filters." : "No questions yet"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                {hasAnyQuestions
                  ? "Try adjusting or resetting your search and filters."
                  : "Student questions will appear here when they raise doubts from your courses."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQueries.map((q) => (
                <QuestionCard key={q.id} query={q} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QAPage() {
  return (
    <WorkFilterProvider>
      <QAContent />
    </WorkFilterProvider>
  );
}
