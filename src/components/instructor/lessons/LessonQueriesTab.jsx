'use client';

import { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, Filter, Loader2 } from 'lucide-react';

import {
  useLessonQueries,
  useReplyToLessonQuery,
  useUpdateLessonQueryStatus,
} from '@/hooks/queries/instructor/useLessonQueries';

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`;
};

export default function LessonQueriesTab({ lessonId }) {
  const { data: queries = [], isLoading } = useLessonQueries(lessonId);
  const replyToQuery = useReplyToLessonQuery(lessonId);
  const updateStatus = useUpdateLessonQueryStatus(lessonId);

  const [filter, setFilter] = useState('All'); // All | Pending | Answered
  const [replyTextMap, setReplyTextMap] = useState({});

  const handleSendReply = (id) => {
    const text = replyTextMap[id];
    if (!text || !text.trim()) return;

    replyToQuery.mutate(
      { queryId: id, reply: text.trim() },
      { onSuccess: () => setReplyTextMap((prev) => ({ ...prev, [id]: '' })) }
    );
  };

  const handleToggleStatus = (query) => {
    updateStatus.mutate({
      queryId: query.id,
      status: query.status === 'ANSWERED' ? 'PENDING' : 'ANSWERED',
    });
  };

  const filteredQueries = queries.filter((q) => {
    if (filter === 'Pending') return q.status === 'PENDING';
    if (filter === 'Answered') return q.status === 'ANSWERED';
    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Filter Selector Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
          <Filter size={13} className="text-primary" />
          <span>Queries ({filteredQueries.length})</span>
        </div>

        <div className="flex gap-1 bg-[#05070E] p-1 rounded-xl border border-border">
          {['All', 'Pending', 'Answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition cursor-pointer ${
                filter === f ? 'bg-primary text-slate-950 shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 size={20} className="mx-auto animate-spin" />
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <HelpCircle size={24} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No student queries found.</p>
          </div>
        ) : (
          filteredQueries.map((q) => {
            const studentName = q.student?.user?.name || 'Student';
            return (
              <div key={q.id} className="p-3.5 rounded-xl bg-[#05070E] border border-border space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-black">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-foreground leading-tight">{studentName}</p>
                      <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{timeAgo(q.createdAt)}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                    q.status === 'ANSWERED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {q.status === 'ANSWERED' ? 'Answered' : 'Pending'}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-xs text-foreground leading-relaxed font-normal bg-card p-2.5 rounded-lg border border-white/5">
                  "{q.question}"
                </p>

                {/* Reply Section */}
                {q.reply ? (
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-wider font-mono">Your Instructor Reply</p>
                    <p className="text-xs text-foreground">{q.reply}</p>
                  </div>
                ) : null}

                {/* Reply Form & Resolution Toggle */}
                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={replyTextMap[q.id] || ''}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [q.id]: e.target.value })}
                      className="flex-1 bg-card border border-border text-xs text-foreground placeholder-slate-500 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => handleSendReply(q.id)}
                      disabled={!replyTextMap[q.id]?.trim() || replyToQuery.isPending}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-orange-600 disabled:opacity-40 text-slate-950 font-black text-[10px] flex items-center gap-1 cursor-pointer shadow-md"
                    >
                      <Send size={11} /> Reply
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleToggleStatus(q)}
                      className="text-[9.5px] font-black text-muted-foreground hover:text-emerald-400 flex items-center gap-1 transition"
                    >
                      <CheckCircle2 size={11} /> Mark as {q.status === 'ANSWERED' ? 'Pending' : 'Resolved'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
