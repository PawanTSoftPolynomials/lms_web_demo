"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AskQuestionModal({ enrolledCourses, defaultCourseId, onClose, onSubmit }) {
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
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground">Ask a Question</h2>
          <button onClick={onClose} className="cursor-pointer text-muted-foreground transition hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            >
              {enrolledCourses.map((c) => (
                <option key={c.courseId} value={c.courseId} className="bg-background">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Question title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How does async/await handle errors?"
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add any context that will help others answer your question..."
              rows={5}
              required
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-border py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 cursor-pointer rounded-xl bg-primary py-2 text-sm font-bold text-foreground transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
