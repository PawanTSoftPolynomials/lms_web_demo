"use client";

import {
  ChevronDown,
} from "lucide-react";

import LessonItem from "./LessonItem";

export default function ModuleItem({
  module,
  expanded,
  toggleModule,
  activeLesson,
  setActiveLesson,
}) {
  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() =>
          toggleModule(module.id)
        }
        className="w-full flex items-center justify-between px-5 py-4 text-white hover:bg-zinc-800 transition"
      >
        <span className="font-medium">
          {module.title}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform ${
            expanded
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {expanded && (
        <div>
          {module.lessons?.map(
            (lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                active={
                  activeLesson?.id ===
                  lesson.id
                }
                onClick={() =>
                  setActiveLesson(
                    lesson
                  )
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}