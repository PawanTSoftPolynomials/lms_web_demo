"use client";

import ProgressBar from "./ProgressBar";

export default function LearnHeader({
  course,
  activeLesson,
}) {
  return (
    <header className="h-20 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">
          {course?.title}
        </h1>

        <p className="text-sm text-zinc-400">
          {activeLesson?.title}
        </p>
      </div>

      <div className="w-64">
        <ProgressBar progress={45} />
      </div>
    </header>
  );
}