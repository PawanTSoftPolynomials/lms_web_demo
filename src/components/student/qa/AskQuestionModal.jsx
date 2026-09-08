"use client";

import { useMemo, useState } from "react";
import { X, Loader2 } from "lucide-react";

import useCourse from "@/hooks/queries/student/useCourse";

export default function AskQuestionModal({ enrolledCourses, defaultCourseId, onClose, onSubmit, isSubmitting, error }) {
  const [courseId, setCourseId] = useState(defaultCourseId || enrolledCourses[0]?.courseId || "");
  const [lessonId, setLessonId] = useState("");
  const [question, setQuestion] = useState("");

  const { data: course, isLoading: isLoadingLessons } = useCourse(courseId);
  const lessons = useMemo(
    () => (course?.modules || []).flatMap((m) => m.lessons || []),
    [course]
  );

  const canSubmit = !!courseId && !!lessonId && question.trim().length > 3;

  const handleCourseChange = (nextCourseId) => {
    setCourseId(nextCourseId);
    setLessonId("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    onSubmit({ lessonId, question: question.trim() });
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
              onChange={(e) => handleCourseChange(e.target.value)}
              required
              className="w-full cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary [&>option]:bg-card [&>option]:text-foreground"
            >
              {enrolledCourses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lesson *</label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              required
              disabled={!courseId || isLoadingLessons}
              className="w-full cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value="">
                {isLoadingLessons ? "Loading lessons..." : "Select the lesson this is about"}
              </option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does async/await handle errors in this lesson's example?"
              rows={5}
              required
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-400">{error}</p>
          )}

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
              disabled={!canSubmit || isSubmitting}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-bold text-foreground transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
