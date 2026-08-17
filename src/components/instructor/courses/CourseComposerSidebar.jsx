"use client";

import { useState } from "react";

export function CourseComposerSidebar({
  modules = [],
  composerMode,
  composeModuleId,
  composeLessonId,
  composeTopicId,
  onSelectCourseOverview,
  onSelectLesson,
  onSelectModule,
  onSelectTopic,
  onAddLesson,
  onAddModule,
  onAddTopic,
  onDeleteLesson,
  onDeleteModule,
}) {
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  const toggleModuleAccordion = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const toggleLessonAccordion = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  return (
    <aside className="sidebar-panel rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl flex flex-col h-full max-h-[calc(100vh-6.5rem)] overflow-hidden text-slate-200" id="sidebarPanel">
      {/* Panel Title */}
      <div className="panel-title font-black text-xs uppercase tracking-widest text-slate-200 flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/80">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-accent, #f97316)" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span>Course Map</span>
      </div>

      {/* Subtitle instructions */}
      <div className="text-[11px] text-slate-400 leading-snug mb-3">
        Course → Modules → Lessons → Topics → Contents
      </div>

      {/* New Module Button */}
      <button
        className="btn btn-outline-primary w-full py-2 mb-3 flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition cursor-pointer shrink-0"
        id="addNewModuleBtn"
        onClick={onAddModule}
      >
        <span className="text-base font-bold">+</span> New Module
      </button>

      {/* Course Overview Root Item */}
      <div
        className={`sidebar-nav-item flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer text-xs mb-2 ${
          composerMode === "course"
            ? "active bg-orange-500/15 border-l-3 border-orange-500 text-orange-400 font-bold"
            : "text-slate-300 hover:bg-slate-900"
        }`}
        id="navCourseOverview"
        onClick={onSelectCourseOverview}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">📁</span>
          <span className="truncate font-semibold">Course Overview</span>
        </div>
      </div>

      {/* Modules Accordion Container (Modules -> Lessons -> Contents) */}
      <div id="lessonsAccordionContainer" className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {modules.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No modules created yet. Click "+ New Module" above.
          </div>
        ) : (
          modules.map((mod, mIdx) => {
            const isExpanded = expandedModules[mod.id] !== false;
            const isModuleActive = composerMode === "module" && composeModuleId === mod.id;
            const modLessons = mod.lessons || [];

            return (
              <div key={mod.id} className="accordion-item rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
                {/* Module Accordion Header */}
                <div
                  className={`accordion-header flex items-center justify-between px-3 py-2.5 transition cursor-pointer ${
                    isModuleActive ? "open bg-orange-500/15 border-l-3 border-orange-500 text-orange-400 font-bold" : "text-slate-200 hover:bg-slate-800/80"
                  }`}
                  onClick={() => {
                    onSelectModule(mod, modLessons[0]?.id || null);
                    toggleModuleAccordion(mod.id);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="accordion-icon text-xs text-orange-500">{isExpanded ? "▼" : "▶"}</span>
                    <span className="truncate text-xs font-bold">
                      Module {mIdx + 1}: {mod.title}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded shrink-0">
                    {modLessons.length} Lessons
                  </span>
                </div>

                {/* Module Lessons Accordion Content */}
                {isExpanded && (
                  <div className="accordion-content open pl-4 pr-2 py-1 space-y-1 border-t border-slate-800/60 bg-slate-950/60">
                    {modLessons.length === 0 ? (
                      <div className="py-2 text-center text-[10px] text-slate-500 italic">
                        No lessons in this module.
                      </div>
                    ) : (
                      modLessons.map((lesson, lIdx) => {
                        const isLessonActive = composerMode === "lesson" && composeLessonId === lesson.id;
                        const isLessonExpanded = expandedLessons[lesson.id] !== false;
                        const lessonTopics = lesson.topics || [];

                        return (
                          <div
                            key={lesson.id}
                            className="rounded-lg overflow-hidden border border-transparent"
                          >
                            <div
                              className={`sidebar-nav-item flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                                isLessonActive
                                  ? "active bg-orange-500/20 text-orange-400 font-bold border-l-2 border-orange-500"
                                  : "text-slate-400 hover:text-white hover:bg-slate-900"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectLesson(lesson.id);
                                toggleLessonAccordion(lesson.id);
                              }}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[9px] text-orange-500/80">{isLessonExpanded ? "▼" : "▶"}</span>
                                <span className="text-xs">📖</span>
                                <span className="truncate text-[11px] leading-snug">
                                  Lesson {lIdx + 1}: {lesson.title}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500">
                                {lessonTopics.length} topic{lessonTopics.length === 1 ? "" : "s"}
                              </span>
                            </div>

                            {/* Lesson Topics Sub-accordion — indented one full level further
                                than the Lesson row, with its own left rail, so it visually
                                reads as Module > Lesson > Topic, not three flat siblings. */}
                            {isLessonExpanded && (
                              <div className="mt-1 ml-4 pl-3 py-1.5 space-y-1 border-l-2 border-orange-500/25 bg-black/20 rounded-r-lg">
                                <div className="text-[8.5px] font-black uppercase tracking-widest text-slate-600 px-1">
                                  Topics
                                </div>
                                {lessonTopics.length === 0 ? (
                                  <div className="py-1.5 text-center text-[9.5px] text-slate-500 italic">
                                    No topics in this lesson.
                                  </div>
                                ) : (
                                  lessonTopics.map((topic, tIdx) => {
                                    const isTopicActive = composerMode === "topic" && composeTopicId === topic.id;
                                    return (
                                      <div
                                        key={topic.id}
                                        className={`sidebar-nav-item flex items-center justify-between px-2 py-1.5 rounded-lg transition cursor-pointer text-[11px] ${
                                          isTopicActive
                                            ? "active bg-orange-500/20 text-orange-400 font-bold border-l-2 border-orange-500"
                                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectTopic?.(topic.id, lesson.id, mod.id);
                                        }}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="text-[10px]">🗂️</span>
                                          <span className="truncate leading-snug">
                                            {tIdx + 1}. {topic.title}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-slate-500 shrink-0">
                                          {topic._count?.contents ?? 0} cells
                                        </span>
                                      </div>
                                    );
                                  })
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddTopic?.(lesson.id);
                                  }}
                                  className="w-full mt-0.5 flex items-center justify-center gap-1 py-1 rounded text-[9.5px] font-bold text-orange-400 hover:bg-orange-500/10 transition cursor-pointer"
                                >
                                  <span>+ Add Topic</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddLesson?.(mod.id);
                      }}
                      className="w-full mt-2 pt-2 border-t border-dashed border-slate-800 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold text-orange-400 hover:bg-orange-500/10 transition cursor-pointer"
                    >
                      <span>+ Add Lesson</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Module Bottom Action */}
      <div className="pt-3 border-t border-slate-800/80 shrink-0">
        <button
          className="btn btn-outline-primary w-full py-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-orange-500 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
          onClick={onAddModule}
        >
          <span className="text-sm font-bold">+</span> Add Module
        </button>
      </div>
    </aside>
  );
}
