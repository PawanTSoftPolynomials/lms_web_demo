"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, PlayCircle, Plus, Minus } from "lucide-react";

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
    <div className="rounded-3xl border border-border/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl overflow-hidden">
      <div className={`p-4 sm:p-5 ${collapsed ? "" : "border-b border-border/60"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
            Course Content
          </h3>
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              title={collapsed ? "Show Course Content" : "Hide Course Content"}
              className="relative h-7 w-7 flex items-center justify-center rounded-full text-primary hover:text-orange-300 hover:bg-primary/10 transition cursor-pointer bg-transparent outline-none before:content-[''] before:absolute before:-inset-[9px]"
            >
              {collapsed ? <Plus size={14} /> : <Minus size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Module accordion */}
      {!collapsed && (
      <div className="divide-y divide-slate-800/60">
        {visibleModules.map((module, moduleIndex) => {
          const expanded = module.id === activeModuleId;
          const lessonCount = module.lessons?.length || 0;

          return (
            <div key={module.id}>
              <button
                type="button"
                onClick={() => onToggleModule(module.id)}
                className="flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left transition min-h-[44px] cursor-pointer border-0 bg-transparent outline-none hover:bg-background/40"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    Module {moduleIndex + 1}: {module.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                  </p>
                </div>
                {expanded ? (
                  <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                )}
              </button>

              {expanded && (
                <div className="space-y-1 pb-3 px-2 sm:px-3">
                  {(module.lessons || []).map((lesson, lessonIndex) => {
                    const isActive = lesson.id === selectedLessonId;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson(lesson, module)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all border-0 outline-none min-h-[44px] cursor-pointer ${
                          isActive
                            ? "bg-primary text-foreground font-medium shadow-lg shadow-orange-600/10"
                            : "hover:bg-muted/40 text-foreground bg-transparent"
                        }`}
                      >
                        {isActive ? (
                          <PlayCircle size={15} className="text-foreground shrink-0" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-700 shrink-0 ml-[3px] mr-[3px]" />
                        )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <p className={`truncate text-[10px] ${isActive ? "text-orange-400" : "text-muted-foreground"}`}>
                              {lesson.topics?.length
                                ? `${lesson.topics.length} Topics`
                                : lesson.duration || ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                  {lessonCount === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
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
            className="w-full px-4 sm:px-5 py-3 min-h-[44px] text-[10px] font-black uppercase tracking-wider text-primary hover:text-orange-300 transition cursor-pointer border-0 bg-transparent outline-none"
          >
            {modulesExpanded ? "Show Less" : `Show ${hiddenModuleCount} More ${hiddenModuleCount === 1 ? "Module" : "Modules"}`}
          </button>
        )}
      </div>
      )}
    </div>
  );
}
