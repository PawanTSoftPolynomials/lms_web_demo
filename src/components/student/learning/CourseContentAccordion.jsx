"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle2, Lock, Plus, Minus } from "lucide-react";

// How many module rows show before the list needs a "Show more" tap —
// mirrors the 3-line clamp on the lesson description above it.
const VISIBLE_MODULE_LIMIT = 4;

/**
 * Embedded (non-drawer) module/lesson navigator for the learning page.
 * Only one module is expanded at a time — the module containing the lesson
 * currently playing expands automatically; switching lessons/modules never
 * requires opening or closing an overlay.
 */
export default function CourseContentAccordion({
  modules = [],
  activeModuleId,
  onToggleModule,
  selectedLessonId,
  onSelectLesson,
  courseProgress = 0,
  completedLessons = 0,
  totalLessons = 0,
  collapsed = false,
  onToggleCollapsed,
}) {
  const [modulesExpanded, setModulesExpanded] = useState(false);

  const activeModuleIndex = modules.findIndex((m) => m.id === activeModuleId);
  // Never hide the module the student is currently in behind a "Show more" tap.
  const forceShowAll = activeModuleIndex >= VISIBLE_MODULE_LIMIT;
  const showAllModules = modulesExpanded || forceShowAll || modules.length <= VISIBLE_MODULE_LIMIT;
  const visibleModules = showAllModules ? modules : modules.slice(0, VISIBLE_MODULE_LIMIT);
  const hiddenModuleCount = modules.length - visibleModules.length;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Overall course progress */}
      <div className={`p-4 sm:p-5 space-y-2 ${collapsed ? "" : "border-b border-slate-800/60"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
            Course Content
          </h3>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-black text-orange-400">{courseProgress}%</span>
            {onToggleCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapsed}
                title={collapsed ? "Show Course Content" : "Hide Course Content"}
                className="relative h-7 w-7 flex items-center justify-center rounded-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition cursor-pointer bg-transparent outline-none before:content-[''] before:absolute before:-inset-[9px]"
              >
                {collapsed ? <Plus size={14} /> : <Minus size={14} />}
              </button>
            )}
          </div>
        </div>
        {!collapsed && (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
            {totalLessons > 0 && (
              <p className="text-[10px] text-slate-500 font-semibold">
                {completedLessons} / {totalLessons} lessons completed
              </p>
            )}
          </>
        )}
      </div>

      {/* Module accordion */}
      {!collapsed && (
      <div className="divide-y divide-slate-800/60">
        {visibleModules.map((module, moduleIndex) => {
          const expanded = module.id === activeModuleId;
          const locked = Boolean(module.locked ?? module.isLocked);
          const lessonCount = module.lessons?.length || 0;
          const hasCompletionData = (module.lessons || []).some(
            (l) => l.completed !== undefined || l.isCompleted !== undefined
          );
          const moduleCompletedCount = (module.lessons || []).filter(
            (l) => l.completed ?? l.isCompleted
          ).length;

          return (
            <div key={module.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onToggleModule(module.id)}
                className={`flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left transition min-h-[44px] cursor-pointer border-0 bg-transparent outline-none ${
                  locked ? "cursor-not-allowed opacity-50" : "hover:bg-slate-900/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">
                    Module {moduleIndex + 1}: {module.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {hasCompletionData
                      ? `${moduleCompletedCount} / ${lessonCount} lessons`
                      : `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`}
                  </p>
                </div>
                {locked ? (
                  <Lock size={14} className="text-slate-500 shrink-0" />
                ) : expanded ? (
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400 shrink-0" />
                )}
              </button>

              {expanded && !locked && (
                <div className="space-y-1 pb-3 px-2 sm:px-3">
                  {(module.lessons || []).map((lesson, lessonIndex) => {
                    const isActive = lesson.id === selectedLessonId;
                    const isCompleted = Boolean(lesson.completed ?? lesson.isCompleted);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson(lesson, module)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer border-0 outline-none min-h-[44px] ${
                          isActive
                            ? "bg-orange-500 text-white font-medium shadow-lg shadow-orange-600/10"
                            : "hover:bg-slate-800/40 text-slate-300 bg-transparent"
                        }`}
                      >
                        {isActive ? (
                          <PlayCircle size={15} className="text-white shrink-0" />
                        ) : isCompleted ? (
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-700 shrink-0 ml-[3px] mr-[3px]" />
                        )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <p className={`truncate text-[10px] ${isActive ? "text-orange-100" : "text-slate-500"}`}>
                              {lesson.topics?.length ? `${lesson.topics.length} Topics` : lesson.duration || ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                  {lessonCount === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-500 italic">
                      No lessons available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {modules.length > VISIBLE_MODULE_LIMIT && !forceShowAll && (
          <button
            type="button"
            onClick={() => setModulesExpanded((prev) => !prev)}
            className="w-full px-4 sm:px-5 py-3 min-h-[44px] text-[10px] font-black uppercase tracking-wider text-orange-400 hover:text-orange-300 transition cursor-pointer border-0 bg-transparent outline-none"
          >
            {modulesExpanded ? "Show Less" : `Show ${hiddenModuleCount} More ${hiddenModuleCount === 1 ? "Module" : "Modules"}`}
          </button>
        )}
      </div>
      )}
    </div>
  );
}
