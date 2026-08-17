"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";
// Role-agnostic — students are already permitted on every /discussions route
// (see discussion.routes.js), so this existing hook is reused as-is rather
// than duplicated under a student-namespaced copy.
import { useDiscussions, useCreateDiscussion } from "@/hooks/queries/instructor/useDiscussions";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BatchDiscussionsPage() {
  const params = useParams();
  const { data: dashboard } = useBatchDashboard(params.batchId);
  const courseId = dashboard?.course?.id;

  const { data: discussions = [], isLoading } = useDiscussions(courseId);
  const createDiscussion = useCreateDiscussion(courseId);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !courseId) return;
    createDiscussion.mutate(
      { courseId, title, body },
      { onSuccess: () => { setTitle(""); setBody(""); } }
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 space-y-2.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Discussion title"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ask a question or start a discussion for this batch's course..."
          rows={2}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition resize-none"
        />
        <button
          type="submit"
          disabled={createDiscussion.isPending || !title.trim() || !body.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black text-slate-950 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition"
        >
          <Send size={12} /> Post
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-2xl">
          No discussions yet — be the first to start one.
        </div>
      ) : (
        <div className="space-y-2.5">
          {discussions.map((d) => (
            <div key={d.id} className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <MessageSquare size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{d.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{d.body}</p>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    {d.author?.name ? `${d.author.name} • ` : ""}
                    {formatDate(d.createdAt)}
                    {typeof d.replies?.length === "number" ? ` • ${d.replies.length} replies` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
