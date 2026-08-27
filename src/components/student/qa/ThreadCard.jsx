"use client";

import { useState } from "react";
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp, Send, CircleCheckBig, Clock } from "lucide-react";
import { timeAgo } from "@/lib/dateUtils";

function initials(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function ThreadCard({ thread, expanded, onToggle, onUpvote, onReply }) {
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
