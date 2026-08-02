"use client";

import { useState } from "react";
import { HelpCircle, Send, Loader2, CheckCircle2, Clock } from "lucide-react";

import { WorkFilterProvider, useWorkFilters } from "@/context/WorkFilterContext";
import WorkFilterBar from "@/components/instructor/work/WorkFilterBar";
import {
  useMyLessonQueries,
  useReplyToLessonQuery,
} from "@/hooks/queries/instructor/useLessonQueries";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ANSWERED", label: "Answered" },
];

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

function QAContent() {
  const { appliedFilters } = useWorkFilters();
  const { data: queries = [], isLoading } = useMyLessonQueries(appliedFilters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Q&amp;A</h1>
        <p className="text-xs text-slate-400 mt-1">Student doubts raised across every lesson in your courses.</p>
      </div>

      <WorkFilterBar statusOptions={STATUS_OPTIONS} />

      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={14} className="text-orange-450" />
          <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">{queries.length} Questions</h3>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 size={20} className="animate-spin text-orange-450" /></div>
        ) : queries.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <HelpCircle size={22} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No questions found for the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-[#1A1F35] bg-white/[0.015]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-semibold truncate">
                      {q.lesson?.module?.course?.title} • {q.lesson?.module?.title} • {q.lesson?.title}
                    </p>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">{q.student?.user?.name || "Student"}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    q.status === "ANSWERED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {q.status === "ANSWERED" ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                    {q.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{q.question}</p>

                {q.reply && (
                  <div className="mt-2.5 pl-3 border-l-2 border-orange-500/30">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-wide">Your reply</p>
                    <p className="text-xs text-slate-300 mt-1">{q.reply}</p>
                  </div>
                )}

                {q.status !== "ANSWERED" && <ReplyBox queryId={q.id} />}
              </div>
            ))}
          </div>
        )}
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
