"use client";

import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default function LessonQuizPanel({ quizzes = [], courseId, currentLessonId }) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border border-border/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl p-4 sm:p-5 space-y-4">
      <h4 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
        <ClipboardList size={14} className="text-primary" />
        <span>Assessment Quiz</span>
      </h4>
      {quizzes.length ? (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl border border-border/80 bg-background/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-foreground">{quiz.title}</h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  {quiz.description || "Self-assessment to verify concept mastery."}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground pt-1">
                  <span>Passing: {quiz.passingScore}%</span>
                  <span>&bull;</span>
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const returnTo = `/student/learn/${courseId}${currentLessonId ? `?lessonId=${currentLessonId}` : ""}`;
                  router.push(`/student/attempt/${quiz.id}?from=${encodeURIComponent(returnTo)}`);
                }}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-primary hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shrink-0"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-background/20 border border-border text-center text-muted-foreground text-xs italic">
          No quiz assigned for this course.
        </div>
      )}
    </div>
  );
}
