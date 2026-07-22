"use client";

import { MessageSquare, ArrowRight, ChevronRight } from "lucide-react";

export default function MessagesSupportPanel({ messagesData, onOpenAction }) {
  const { unreadCount = 0, items = [] } = messagesData || {};

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Messages & Support
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  {unreadCount} Unread
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Urgent tickets & inquiries requiring response</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "support_desk", title: "Institutional Support Desk" })}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
        >
          Open Inbox <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Items List */}
      <div className="mt-3.5 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {items.map((msg) => (
          <div
            key={msg.id}
            className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 transition ${
              msg.unread
                ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50"
                : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{msg.role}</span>
                {msg.priority === "Urgent" && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                    Urgent
                  </span>
                )}
                <span className="text-[10px] text-slate-400">{msg.time}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{msg.sender}</h4>
              <p className="text-[11px] text-slate-300 line-clamp-1">{msg.subject}</p>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => onOpenAction({ type: "open_conversation", title: `Conversation with ${msg.sender}`, data: msg })}
                className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition"
              >
                <span>Open Message</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
