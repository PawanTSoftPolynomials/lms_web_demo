"use client";

import { PlayCircle } from "lucide-react";

export default function LessonItem({
  lesson,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-8 py-3 text-left transition
      ${
        active
          ? "bg-orange-500 text-white"
          : "text-zinc-400 hover:bg-zinc-800"
      }`}
    >
      <PlayCircle size={18} />

      <span className="text-sm">
        {lesson.title}
      </span>
    </button>
  );
}