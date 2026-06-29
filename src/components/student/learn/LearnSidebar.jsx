"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

import ModuleItem from "./ModuleItem";

export default function LearnSidebar({
  course,
  activeLesson,
  setActiveLesson,
}) {
  const router = useRouter();

  const [expandedModules, setExpandedModules] = useState(
    course.modules?.map((module) => module.id) || []
  );

  const toggleModule = (moduleId) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(
        expandedModules.filter((id) => id !== moduleId)
      );
    } else {
      setExpandedModules([
        ...expandedModules,
        moduleId,
      ]);
    }
  };

  return (
    <aside className="w-80 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
      <div className="p-5 border-b border-zinc-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-500 transition-colors mb-4"
        >
          <FaArrowLeft className="text-xs" />
          
        </button>

        <h2 className="text-lg font-semibold text-white">
          Course Content
        </h2>
      </div>

      <div className="py-2">
        {course.modules?.map((module) => (
          <ModuleItem
            key={module.id}
            module={module}
            expanded={expandedModules.includes(
              module.id
            )}
            toggleModule={toggleModule}
            activeLesson={activeLesson}
            setActiveLesson={setActiveLesson}
          />
        ))}
      </div>
    </aside>
  );
}