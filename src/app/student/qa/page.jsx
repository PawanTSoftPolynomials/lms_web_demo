"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  Plus,
  ThumbsUp,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CircleCheckBig,
  Clock,
  X,
  BookOpen,
  LayoutGrid,
} from "lucide-react";

import { useQa } from "@/context/QaContext";

function timeAgo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const STATUS_FILTERS = ["All", "Unanswered", "Answered"];

function AskQuestionModal({ enrolledCourses, defaultCourseId, onClose, onSubmit }) {
  const [courseId, setCourseId] = useState(defaultCourseId || enrolledCourses[0]?.courseId || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const canSubmit = !!courseId && title.trim().length > 3 && body.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const course = enrolledCourses.find((c) => c.courseId === courseId);
    onSubmit({ courseId, courseTitle: course?.title || "", title, body });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-black text-white">Ask a Question</h2>
          <button onClick={onClose} className="cursor-pointer text-slate-400 transition hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500"
            >
              {enrolledCourses.map((c) => (
                <option key={c.courseId} value={c.courseId} className="bg-slate-950">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Question title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How does async/await handle errors?"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Details *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add any context that will help others answer your question..."
              rows={5}
              required
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-slate-800 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 cursor-pointer rounded-xl bg-orange-500 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ThreadCard({ thread, expanded, onToggle, onUpvote, onReply }) {
  const [replyText, setReplyText] = useState("");
  const answered = thread.replies.length > 0;

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(thread.id, replyText);
    setReplyText("");
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-luxury-md backdrop-blur-md transition hover:border-orange-500/30">
      <div className="flex gap-4 p-5">
        {/* Upvote column */}
        <button
          onClick={() => onUpvote(thread.id)}
          className={`flex h-fit shrink-0 flex-col items-center gap-1 rounded-xl border px-2.5 py-2 transition cursor-pointer ${
            thread.upvotedByMe
              ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
              : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-orange-500/30 hover:text-orange-400"
          }`}
        >
          <ThumbsUp size={14} className={thread.upvotedByMe ? "fill-orange-400" : ""} />
          <span className="text-[11px] font-black">{thread.upvotes}</span>
        </button>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-black text-orange-400">
                {initials(thread.askedByName)}
              </span>
              <span className="text-xs font-bold text-white">{thread.askedByName}</span>
              <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {thread.courseTitle}
              </span>
            </div>
            <span
              className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${
                answered
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}
            >
              {answered ? <CircleCheckBig size={10} /> : <Clock size={10} />}
              {answered ? "Answered" : "Awaiting reply"}
            </span>
          </div>

          <button onClick={() => onToggle(thread.id)} className="mt-3 block w-full cursor-pointer text-left">
            <h3 className="text-sm font-black leading-snug text-white">{thread.title}</h3>
            <p className={`mt-1.5 text-xs leading-relaxed text-slate-400 ${expanded ? "" : "line-clamp-2"}`}>{thread.body}</p>
          </button>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => onToggle(thread.id)}
              className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-slate-300"
            >
              <MessageCircle size={13} />
              {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <span className="text-[10px] text-slate-500">{timeAgo(thread.createdAt)}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-slate-800/80 px-5 py-4">
          {thread.replies.map((r) => (
            <div key={r.id} className="flex gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                  r.authorRole === "INSTRUCTOR" ? "bg-purple-500/15 text-purple-400" : "bg-orange-500/15 text-orange-400"
                }`}
              >
                {initials(r.authorName)}
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                    {r.authorName}
                    {r.authorRole === "INSTRUCTOR" && (
                      <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-purple-400">
                        Instructor
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-slate-500">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{r.body}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleReply} className="flex gap-2 pt-1">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none transition focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={12} /> Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function QaPage() {
  const { threads, enrolledCourses, askQuestion, addReply, toggleUpvote } = useQa();

  const [activeCourseId, setActiveCourseId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);

  // Per-course counters for the course chip row.
  const courseStats = useMemo(() => {
    const stats = new Map();
    for (const t of threads) {
      const entry = stats.get(t.courseId) || { total: 0, unanswered: 0 };
      entry.total += 1;
      if (t.replies.length === 0) entry.unanswered += 1;
      stats.set(t.courseId, entry);
    }
    return stats;
  }, [threads]);

  // If the previously active course is no longer enrolled, fall back to "all".
  useEffect(() => {
    if (activeCourseId === "all") return;
    if (!enrolledCourses.some((c) => c.courseId === activeCourseId)) {
      setActiveCourseId("all");
    }
  }, [enrolledCourses, activeCourseId]);

  const filteredThreads = useMemo(() => {
    return threads
      .filter((t) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q);
        const matchesCourse = activeCourseId === "all" || t.courseId === activeCourseId;
        const answered = t.replies.length > 0;
        const matchesStatus =
          statusFilter === "All" || (statusFilter === "Answered" ? answered : !answered);
        return matchesSearch && matchesCourse && matchesStatus;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [threads, searchQuery, activeCourseId, statusFilter]);

  const handleAsk = ({ courseId, courseTitle, title, body }) => {
    const id = askQuestion({ courseId, courseTitle, title, body });
    setShowAskModal(false);
    setExpandedId(id);
  };

  if (enrolledCourses.length === 0) {
    return (
      <div className="space-y-6 text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Q&amp;A</h1>
          <p className="mt-1 text-xs text-slate-400">Ask questions about your courses and get answers from instructors and classmates.</p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 py-20 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-600 opacity-40" />
          <p className="text-sm font-semibold text-white">No enrolled courses yet</p>
          <p className="mt-1 text-xs text-slate-400">Q&amp;A is organized by course — enroll in a course to start asking questions.</p>
          <Link
            href="/student/courses"
            className="mt-4 inline-block cursor-pointer rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-650"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Q&amp;A</h1>
          <p className="mt-1 text-xs text-slate-400">
            Ask questions about your courses and get answers from instructors and classmates.
          </p>
        </div>
        <button
          onClick={() => setShowAskModal(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-orange-600"
        >
          <Plus size={15} /> Ask a Question
        </button>
      </div>

      {/* Course-wise selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCourseId("all")}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeCourseId === "all"
              ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
              : "border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-white"
          }`}
        >
          <LayoutGrid size={14} />
          All Courses
          <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-black text-slate-300">{threads.length}</span>
        </button>

        {enrolledCourses.map((c) => {
          const stats = courseStats.get(c.courseId) || { total: 0, unanswered: 0 };
          const active = activeCourseId === c.courseId;
          return (
            <button
              key={c.courseId}
              onClick={() => setActiveCourseId(c.courseId)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                active
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              <span className="max-w-[160px] truncate">{c.title}</span>
              <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-black text-slate-300">{stats.total}</span>
              {stats.unanswered > 0 && (
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                  {stats.unanswered} pending
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800/80 bg-slate-900/50 py-2 pl-9 pr-4 text-xs text-white outline-none transition focus:border-orange-500"
          />
        </div>

        <div className="flex gap-1 rounded-xl border border-slate-800/80 bg-slate-900/50 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[10.5px] font-black transition ${
                statusFilter === f ? "bg-orange-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      {filteredThreads.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 py-20 text-center text-slate-400">
          <HelpCircle size={40} className="mx-auto mb-3 text-slate-600 opacity-40" />
          <p className="text-sm font-semibold text-white">No questions found</p>
          <p className="mt-1 text-xs text-slate-400">Be the first to ask something about this course.</p>
          <button
            onClick={() => setShowAskModal(true)}
            className="mt-4 cursor-pointer rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-650"
          >
            Ask a Question
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              expanded={expandedId === thread.id}
              onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              onUpvote={toggleUpvote}
              onReply={addReply}
            />
          ))}
        </div>
      )}

      {showAskModal && (
        <AskQuestionModal
          enrolledCourses={enrolledCourses}
          defaultCourseId={activeCourseId !== "all" ? activeCourseId : undefined}
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAsk}
        />
      )}
    </div>
  );
}
