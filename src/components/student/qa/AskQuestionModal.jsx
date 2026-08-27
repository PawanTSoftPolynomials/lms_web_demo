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
