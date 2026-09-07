"use client";

import { MessageCircle, ChevronDown, ChevronUp, CircleCheckBig, Clock } from "lucide-react";
import { timeAgo } from "@/lib/dateUtils";

export default function ThreadCard({ thread, expanded, onToggle }) {
  const answered = thread.status === "ANSWERED";
  const contextLabel = [thread.lesson?.module?.course?.title, thread.lesson?.module?.title, thread.lesson?.title]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-2xl border border-border/80 bg-background/50 shadow-luxury-md backdrop-blur-md transition hover:border-primary/30">
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {contextLabel || "General question"}
          </span>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${
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
          <p className={`text-sm font-bold leading-snug text-foreground ${expanded ? "" : "line-clamp-2"}`}>{thread.question}</p>
        </button>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => onToggle(thread.id)}
            className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <MessageCircle size={13} />
            {answered ? "1 reply" : "No reply yet"}
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <span className="text-[10px] text-muted-foreground">{timeAgo(new Date(thread.createdAt).getTime())}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/80 px-5 py-4">
          {answered ? (
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-[10px] font-black text-purple-400">
                I
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-border/80 bg-background/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                    Instructor
                    <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-purple-400">
                      Reply
                    </span>
                  </span>
                  {thread.answeredAt && <span className="text-[9px] text-muted-foreground">{timeAgo(new Date(thread.answeredAt).getTime())}</span>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{thread.reply}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Your instructor hasn&apos;t replied to this question yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
