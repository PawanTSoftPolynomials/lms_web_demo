"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle2, Lock, Plus, Minus, FileText, HelpCircle, ClipboardList } from "lucide-react";

const VISIBLE_MODULE_LIMIT = 4;

export default function CourseContentAccordion({
  modules = [],
  course = null,
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
  const router = useRouter();
  const [modulesExpanded, setModulesExpanded] = useState(false);

  const activeModuleIndex = modules.findIndex((m) => m.id === activeModuleId);
  const forceShowAll = activeModuleIndex >= VISIBLE_MODULE_LIMIT;
  const showAllModules = modulesExpanded || forceShowAll || modules.length <= VISIBLE_MODULE_LIMIT;
  const visibleModules = showAllModules ? modules : modules.slice(0, VISIBLE_MODULE_LIMIT);
  const hiddenModuleCount = modules.length - visibleModules.length;

  const courseDirectContents = course?.contents || [];
  const courseDirectQuizzes = course?.quizzes || [];
  const courseDirectAssignments = course?.assignments || [];
  const hasCourseDirectItems =
    courseDirectContents.length > 0 ||
    courseDirectQuizzes.length > 0 ||
    courseDirectAssignments.length > 0;

  return (
    <div className="rounded-3xl border border-border/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Overall course progress */}
      <div className={`p-4 sm:p-5 space-y-2 ${collapsed ? "" : "border-b border-border/60"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
            Course Content
          </h3>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-black text-primary">{courseProgress}%</span>
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
        {!collapsed && (
          <>
            <div className="bg-background border border-border rounded-full h-1.5 overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
            {totalLessons > 0 && (
              <p className="text-[10px] text-muted-foreground font-semibold">
                {completedLessons} / {totalLessons} lessons completed
              </p>
            )}
          </>
        )}
      </div>

      {!collapsed && (
        <div className="divide-y divide-slate-800/60">
          {/* Direct Course-Level Items (if present) */}
          {hasCourseDirectItems && (
            <div className="p-3 sm:p-4 bg-background/20 space-y-1.5 border-b border-border/60">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                Course Direct Items
              </span>

              {/* Course Content */}
              {courseDirectContents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-background/60 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {content.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    ) : (
                      <FileText size={15} className="text-primary shrink-0" />
                    )}
                    <span className="truncate font-medium text-foreground">{content.title}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                    Course Content
                  </span>
                </div>
              ))}

              {/* Course Quiz */}
              {courseDirectQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => router.push(`/student/attempt/${quiz.id}`)}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-xs cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {quiz.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    ) : (
                      <HelpCircle size={15} className="text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate font-medium text-foreground">{quiz.title}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                    {quiz.completed ? "Passed" : "Course Quiz"}
                  </span>
                </div>
              ))}

              {/* Course Assignment */}
              {courseDirectAssignments.map((asgn) => (
                <Link
                  key={asgn.id}
                  href={`/student/assignments/${asgn.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-xs transition block"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {asgn.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    ) : (
                      <ClipboardList size={15} className="text-amber-400 shrink-0" />
                    )}
                    <span className="truncate font-medium text-foreground">{asgn.title}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                    {asgn.completed ? "Submitted" : "Course Assignment"}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Module accordion */}
          {visibleModules.map((module, moduleIndex) => {
            const expanded = module.id === activeModuleId;
            const locked = Boolean(module.locked ?? module.isLocked);
            const lessonCount = module.lessons?.length || 0;
            const modDirectContents = module.contents || [];
            const modDirectQuizzes = module.quizzes || [];
            const modDirectAssignments = module.assignments || [];
            const hasDirectItems = modDirectContents.length > 0 || modDirectQuizzes.length > 0 || modDirectAssignments.length > 0;

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
                    locked ? "cursor-not-allowed opacity-50" : "hover:bg-background/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        Module {moduleIndex + 1}: {module.title}
                      </h4>
                      {module.completed && (
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      {hasCompletionData
                        ? `${moduleCompletedCount} / ${lessonCount} lessons`
                        : `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`}
                      {hasDirectItems ? " • +Direct items" : ""}
                    </p>
                  </div>
                  {locked ? (
                    <Lock size={14} className="text-muted-foreground shrink-0" />
                  ) : expanded ? (
                    <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  )}
                </button>

                {expanded && !locked && (
                  <div className="space-y-1 pb-3 px-2 sm:px-3">
                    {/* Direct Module Contents */}
                    {modDirectContents.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-primary/5 border border-primary/15 text-xs my-1"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {c.completed ? (
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <FileText size={14} className="text-primary shrink-0" />
                          )}
                          <span className="truncate font-medium text-foreground">{c.title || "Module Content"}</span>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                          Direct Content
                        </span>
                      </div>
                    ))}

                    {/* Direct Module Quizzes */}
                    {modDirectQuizzes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => router.push(`/student/attempt/${q.id}`)}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-xs cursor-pointer my-1 transition"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {q.completed ? (
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <HelpCircle size={14} className="text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate font-medium text-foreground">{q.title || "Module Quiz"}</span>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">
                          {q.completed ? "Passed" : "Direct Quiz"}
                        </span>
                      </div>
                    ))}

                    {/* Direct Module Assignments */}
                    {modDirectAssignments.map((a) => (
                      <Link
                        key={a.id}
                        href={`/student/assignments/${a.id}`}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-xs cursor-pointer my-1 transition block"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {a.completed ? (
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <ClipboardList size={14} className="text-amber-400 shrink-0" />
                          )}
                          <span className="truncate font-medium text-foreground">{a.title || "Module Assignment"}</span>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 shrink-0">
                          {a.completed ? "Submitted" : "Direct Assignment"}
                        </span>
                      </Link>
                    ))}

                    {/* Module Lessons */}
                    {(module.lessons || []).map((lesson, lessonIndex) => {
                      const isActive = lesson.id === selectedLessonId;
                      const isCompleted = Boolean(lesson.completed ?? lesson.isCompleted);
                      const isLessonLocked = Boolean(lesson.locked);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          disabled={isLessonLocked}
                          onClick={() => !isLessonLocked && onSelectLesson(lesson, module)}
                          title={isLessonLocked ? "Complete the previous lesson to unlock" : undefined}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all border-0 outline-none min-h-[44px] ${
                            isLessonLocked
                              ? "cursor-not-allowed opacity-50 text-muted-foreground bg-transparent"
                              : "cursor-pointer"
                          } ${
                            isActive
                              ? "bg-primary text-foreground font-medium shadow-lg shadow-orange-600/10"
                              : !isLessonLocked
                              ? "hover:bg-muted/40 text-foreground bg-transparent"
                              : ""
                          }`}
                        >
                          {isLessonLocked ? (
                            <Lock size={14} className="text-muted-foreground shrink-0" />
                          ) : isActive ? (
                            <PlayCircle size={15} className="text-foreground shrink-0" />
                          ) : isCompleted ? (
                            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-slate-700 shrink-0 ml-[3px] mr-[3px]" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <p className={`truncate text-[10px] ${isActive ? "text-orange-400" : "text-muted-foreground"}`}>
                              {isLessonLocked
                                ? "Locked"
                                : lesson.topics?.length
                                ? `${lesson.topics.length} Topics`
                                : lesson.duration || ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                    {lessonCount === 0 && !hasDirectItems && (
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
