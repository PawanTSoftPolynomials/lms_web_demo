"use client";

import { HelpCircle } from "lucide-react";
import { getQuizActionItems } from "@/features/student/constants/quizzesConfig";

export default function QuizCourseCard({ course, setViewingCourseId, setActiveTab }) {
  const actionItems = getQuizActionItems(course.id, setViewingCourseId, setActiveTab);

  return (
    <div
      className="rounded-3xl border border-border/80 bg-background/80 p-4 sm:p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-transparent select-none max-w-sm w-full mx-auto sm:max-w-none"
    >
      {/* Card Header */}
      <div className="pb-3 text-center border-b border-border/50">
        <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-snug truncate" title={course.title}>
          {course.title}
        </h3>
        <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mt-1">
          Theory, Practical
        </span>
      </div>

      {/* List of Navigation Actions */}
      <div className="space-y-1 my-3">
        {actionItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={item.onClick}
              className="flex items-center gap-2.5 sm:gap-3 text-xs font-bold text-foreground hover:text-foreground transition group py-2 px-2.5 sm:px-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-transparent/50 min-h-[44px] cursor-pointer"
            >
              <Icon size={16} className={`${item.iconColor} shrink-0 stroke-[2]`} />
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Right Help Icon */}
      <div className="flex justify-end pt-1 text-muted-foreground hover:text-foreground transition select-none">
        <HelpCircle size={16} />
      </div>
    </div>
  );
}
