'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight, FileText, HelpCircle,
  ClipboardList, BookOpen, Award, TrendingUp, Loader2, AlertCircle, Layers
} from 'lucide-react';
import { useOverallProgress, useCourseProgress } from '@/hooks/queries/student/useProgress';
import { useInstructorCourse } from '@/hooks/queries/instructor/useInstructorCourse';
import { normalizeCourseHierarchy } from '@/lib/courseMapper';
import { buildProgressIndex } from '@/lib/progressIndex';

function CourseHierarchyTree({ courseId, studentId }) {
  const { data: rawCourseData, isLoading: courseLoading } = useInstructorCourse(courseId);
  const { data: progressData, isLoading: progressLoading } = useCourseProgress(courseId, studentId);

  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  const course = useMemo(() => normalizeCourseHierarchy(rawCourseData) || null, [rawCourseData]);
  const progressIndex = useMemo(() => buildProgressIndex(progressData), [progressData]);

  const completedLessonSet = useMemo(() => {
    const set = new Set(progressData?.lessonProgresses || []);
    if (progressIndex?.nodes) {
      for (const [id, node] of progressIndex.nodes.entries()) {
        if (node.completed) set.add(id);
      }
    }
    return set;
  }, [progressData, progressIndex]);

  const completedModuleSet = useMemo(() => {
    const set = new Set(progressData?.moduleProgresses || []);
    if (progressIndex?.nodes) {
      for (const [id, node] of progressIndex.nodes.entries()) {
        if (node.completed) set.add(id);
      }
    }
    return set;
  }, [progressData, progressIndex]);

  const completedTopicSet = useMemo(() => {
    const set = new Set(progressData?.topicProgresses || []);
    if (progressIndex?.nodes) {
      for (const [id, node] of progressIndex.nodes.entries()) {
        if (node.completed) set.add(id);
      }
    }
    return set;
  }, [progressData, progressIndex]);

  const completedQuizSet = useMemo(() => {
    const set = new Set(progressData?.completedQuizIds || []);
    if (progressIndex?.items) {
      for (const [id, item] of progressIndex.items.entries()) {
        if (item.kind === 'QUIZ' && item.completed) set.add(id);
      }
    }
    return set;
  }, [progressData, progressIndex]);

  const completedContentSet = useMemo(() => {
    const set = new Set(progressData?.completedContentIds || []);
    if (progressIndex?.items) {
      for (const [id, item] of progressIndex.items.entries()) {
        if (item.kind === 'CONTENT' && item.completed) set.add(id);
      }
    }
    return set;
  }, [progressData, progressIndex]);

  const completedAssignmentSet = useMemo(() => {
    const set = new Set(progressData?.completedAssignmentIds || []);
    if (progressIndex?.items) {
      for (const [id, item] of progressIndex.items.entries()) {
        if (item.kind === 'ASSIGNMENT' && item.completed) set.add(id);
      }
    }
    return set;
  }, [progressData, progressIndex]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleLesson = (lesId) => {
    setExpandedLessons((prev) => ({ ...prev, [lesId]: !prev[lesId] }));
  };

  if (courseLoading || progressLoading) {
    return (
      <div className="py-8 flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="animate-spin text-primary" size={18} />
        <span className="text-xs font-semibold">Loading course structure &amp; student progress...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        Unable to load course structure.
      </div>
    );
  }

  const courseDirectContents = course.contents || [];
  const courseDirectQuizzes = course.quizzes || [];
  const courseDirectAssignments = course.assignments || [];
  const hasCourseDirectItems =
    courseDirectContents.length > 0 ||
    courseDirectQuizzes.length > 0 ||
    courseDirectAssignments.length > 0;

  const modules = course.modules || [];

  return (
    <div className="space-y-4">
      {/* Course Overall Metric Bar */}
      <div className="bg-background/40 border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
              {course.title}
            </h4>
            {progressData?.completed ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                Completed
              </span>
            ) : (progressData?.progressPercent || 0) > 0 ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-450 border border-amber-500/20">
                In Progress
              </span>
            ) : (
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-500/10 text-muted-foreground border border-slate-500/20">
                Not Started
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {progressData?.completedItems ?? 0} of {progressData?.totalItems ?? 0} items completed
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 bg-background border border-border rounded-full h-2 overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${progressData?.progressPercent || 0}%` }}
            />
          </div>
          <span className="text-xs font-black text-primary font-mono">
            {progressData?.progressPercent || 0}%
          </span>
        </div>
      </div>

      {/* Direct Course Level Items */}
      {hasCourseDirectItems && (
        <div className="bg-background/20 border border-border/60 rounded-xl p-3 space-y-2">
          <span className="text-[9.5px] font-black uppercase tracking-widest text-muted-foreground block font-mono">
            Course Direct Learning Items
          </span>

          <div className="space-y-1.5">
            {courseDirectContents.map((c) => {
              const isCompleted = completedContentSet.has(c.id);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-background/60 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <FileText size={14} className="text-primary shrink-0" />
                    )}
                    <span className="truncate text-foreground font-medium">{c.title}</span>
                  </div>
                  <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {isCompleted ? 'Completed' : 'Course Content'}
                  </span>
                </div>
              );
            })}

            {courseDirectQuizzes.map((q) => {
              const isCompleted = completedQuizSet.has(q.id);
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <HelpCircle size={14} className="text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate text-foreground font-medium">{q.title}</span>
                  </div>
                  <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                    {isCompleted ? 'Passed' : 'Course Quiz'}
                  </span>
                </div>
              );
            })}

            {courseDirectAssignments.map((a) => {
              const isCompleted = completedAssignmentSet.has(a.id);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-amber-500/5 border border-amber-500/20 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <ClipboardList size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className="truncate text-foreground font-medium">{a.title}</span>
                  </div>
                  <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                    {isCompleted ? 'Submitted' : 'Course Assignment'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modules Hierarchy */}
      <div className="space-y-2">
        <span className="text-[9.5px] font-black uppercase tracking-widest text-muted-foreground block font-mono">
          Modules &amp; Learning Nodes ({modules.length})
        </span>

        {modules.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-3 text-center">No modules in this course.</p>
        ) : (
          modules.map((module, mIdx) => {
            const isModCompleted = completedModuleSet.has(module.id);
            const isExpanded = Boolean(expandedModules[module.id]);
            const modDirectContents = module.contents || [];
            const modDirectQuizzes = module.quizzes || [];
            const modDirectAssignments = module.assignments || [];
            const lessons = module.lessons || [];

            const totalModLessons = lessons.length;
            const completedModLessons = lessons.filter((l) => completedLessonSet.has(l.id)).length;

            return (
              <div key={module.id} className="border border-border rounded-xl overflow-hidden bg-card/40">
                {/* Module Header */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/[0.02] transition cursor-pointer border-0 bg-transparent"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isModCompleted ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">
                        Module {mIdx + 1}: {module.title}
                      </p>
                      <p className="text-[9.5px] text-muted-foreground font-semibold mt-0.5">
                        {completedModLessons} / {totalModLessons} lessons completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isModCompleted && (
                      <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                        Complete
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown size={15} className="text-muted-foreground" />
                    ) : (
                      <ChevronRight size={15} className="text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Module Body */}
                {isExpanded && (
                  <div className="p-3 border-t border-border/60 bg-background/30 space-y-2 pl-6">
                    {/* Direct Module Items */}
                    {modDirectContents.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs px-3 py-1.5 bg-primary/5 border border-primary/15 rounded-lg">
                        <span className="flex items-center gap-2 truncate">
                          {completedContentSet.has(c.id) ? (
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          ) : (
                            <FileText size={13} className="text-primary shrink-0" />
                          )}
                          <span className="truncate">{c.title}</span>
                        </span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">Module Content</span>
                      </div>
                    ))}

                    {modDirectQuizzes.map((q) => (
                      <div key={q.id} className="flex items-center justify-between text-xs px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <span className="flex items-center gap-2 truncate">
                          {completedQuizSet.has(q.id) ? (
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          ) : (
                            <HelpCircle size={13} className="text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate">{q.title}</span>
                        </span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">Module Quiz</span>
                      </div>
                    ))}

                    {modDirectAssignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-xs px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <span className="flex items-center gap-2 truncate">
                          {completedAssignmentSet.has(a.id) ? (
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          ) : (
                            <ClipboardList size={13} className="text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{a.title}</span>
                        </span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 shrink-0">Module Assignment</span>
                      </div>
                    ))}

                    {/* Lessons */}
                    {lessons.map((lesson, lIdx) => {
                      const isLesCompleted = completedLessonSet.has(lesson.id);
                      const isLesExpanded = Boolean(expandedLessons[lesson.id]);
                      const topics = lesson.topics || [];
                      const lesDirectContents = lesson.contents || [];
                      const lesDirectQuizzes = lesson.quizzes || [];
                      const lesDirectAssignments = lesson.assignments || [];

                      return (
                        <div key={lesson.id} className="border border-border/60 rounded-lg bg-card/60 overflow-hidden my-1">
                          <button
                            type="button"
                            onClick={() => toggleLesson(lesson.id)}
                            className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/[0.02] transition cursor-pointer border-0 bg-transparent"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isLesCompleted ? (
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                              ) : (
                                <Circle size={14} className="text-muted-foreground shrink-0" />
                              )}
                              <span className="text-xs font-bold text-foreground truncate">
                                Lesson {lIdx + 1}: {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {topics.length > 0 && (
                                <span className="text-[9px] text-muted-foreground font-semibold">
                                  {topics.length} topics
                                </span>
                              )}
                              {isLesExpanded ? (
                                <ChevronDown size={14} className="text-muted-foreground" />
                              ) : (
                                <ChevronRight size={14} className="text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          {isLesExpanded && (
                            <div className="p-2.5 border-t border-border/40 bg-background/50 space-y-1.5 pl-5">
                              {/* Direct Lesson Items */}
                              {lesDirectContents.map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-[11px] px-2.5 py-1 bg-primary/5 border border-primary/10 rounded">
                                  <span className="flex items-center gap-1.5 truncate">
                                    {completedContentSet.has(c.id) ? (
                                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    ) : (
                                      <FileText size={12} className="text-primary shrink-0" />
                                    )}
                                    <span className="truncate">{c.title}</span>
                                  </span>
                                  <span className="text-[7.5px] font-mono px-1 rounded bg-primary/10 text-primary shrink-0">Lesson Content</span>
                                </div>
                              ))}

                              {lesDirectQuizzes.map((q) => (
                                <div key={q.id} className="flex items-center justify-between text-[11px] px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded">
                                  <span className="flex items-center gap-1.5 truncate">
                                    {completedQuizSet.has(q.id) ? (
                                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    ) : (
                                      <HelpCircle size={12} className="text-emerald-400 shrink-0" />
                                    )}
                                    <span className="truncate">{q.title}</span>
                                  </span>
                                  <span className="text-[7.5px] font-mono px-1 rounded bg-emerald-500/15 text-emerald-300 shrink-0">Lesson Quiz</span>
                                </div>
                              ))}

                              {lesDirectAssignments.map((a) => (
                                <div key={a.id} className="flex items-center justify-between text-[11px] px-2.5 py-1 bg-amber-500/5 border border-amber-500/20 rounded">
                                  <span className="flex items-center gap-1.5 truncate">
                                    {completedAssignmentSet.has(a.id) ? (
                                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    ) : (
                                      <ClipboardList size={12} className="text-amber-400 shrink-0" />
                                    )}
                                    <span className="truncate">{a.title}</span>
                                  </span>
                                  <span className="text-[7.5px] font-mono px-1 rounded bg-amber-500/15 text-amber-300 shrink-0">Lesson Assignment</span>
                                </div>
                              ))}

                              {/* Topics */}
                              {topics.map((topic, tIdx) => {
                                const isTopCompleted = completedTopicSet.has(topic.id);
                                const topContents = topic.contents || [];
                                const topQuizzes = topic.quizzes || (topic.quiz ? [topic.quiz] : []);
                                const topAssignments = topic.assignments || [];

                                return (
                                  <div key={topic.id} className="border border-border/40 rounded bg-background/40 p-2 space-y-1 my-1">
                                    <div className="flex items-center justify-between text-[11px] font-semibold">
                                      <span className="flex items-center gap-1.5 truncate">
                                        {isTopCompleted ? (
                                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                        ) : (
                                          <Circle size={12} className="text-muted-foreground shrink-0" />
                                        )}
                                        <span className="truncate text-foreground">Topic {tIdx + 1}: {topic.title}</span>
                                      </span>
                                      {isTopCompleted && (
                                        <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                          Topic Complete
                                        </span>
                                      )}
                                    </div>

                                    {/* Topic Items */}
                                    <div className="pl-4 space-y-1 pt-1">
                                      {topContents.map((c) => (
                                        <div key={c.id} className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                                          <span className="flex items-center gap-1.5 truncate">
                                            {completedContentSet.has(c.id) ? (
                                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                            ) : (
                                              <FileText size={11} className="text-slate-400 shrink-0" />
                                            )}
                                            <span className="truncate">{c.title}</span>
                                          </span>
                                          <span className="text-[7px] uppercase font-mono px-1 rounded bg-slate-500/10 text-slate-400">Content</span>
                                        </div>
                                      ))}

                                      {topQuizzes.map((q) => (
                                        <div key={q.id} className="flex items-center justify-between text-[10.5px] text-emerald-400">
                                          <span className="flex items-center gap-1.5 truncate">
                                            {completedQuizSet.has(q.id) ? (
                                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                            ) : (
                                              <HelpCircle size={11} className="text-emerald-400 shrink-0" />
                                            )}
                                            <span className="truncate">{q.title}</span>
                                          </span>
                                          <span className="text-[7px] uppercase font-mono px-1 rounded bg-emerald-500/10 text-emerald-300">Quiz</span>
                                        </div>
                                      ))}

                                      {topAssignments.map((a) => (
                                        <div key={a.id} className="flex items-center justify-between text-[10.5px] text-amber-400">
                                          <span className="flex items-center gap-1.5 truncate">
                                            {completedAssignmentSet.has(a.id) ? (
                                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                            ) : (
                                              <ClipboardList size={11} className="text-amber-400 shrink-0" />
                                            )}
                                            <span className="truncate">{a.title}</span>
                                          </span>
                                          <span className="text-[7px] uppercase font-mono px-1 rounded bg-amber-500/10 text-amber-300">Assignment</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function StudentProgressDetailView({ studentId, studentName = 'Student' }) {
  const { data: overallProgressList = [], isLoading, isError, refetch } = useOverallProgress(studentId);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Compute aggregate stats across enrolled courses
  const stats = useMemo(() => {
    if (!Array.isArray(overallProgressList) || overallProgressList.length === 0) {
      return { totalCourses: 0, completedCourses: 0, avgProgress: 0 };
    }
    const totalCourses = overallProgressList.length;
    const completedCourses = overallProgressList.filter((c) => c.completed || c.progressPercent === 100).length;
    const sumPercent = overallProgressList.reduce((acc, c) => acc + (c.progressPercent || 0), 0);
    const avgProgress = Math.round(sumPercent / totalCourses);
    return { totalCourses, completedCourses, avgProgress };
  }, [overallProgressList]);

  // Set initial selected course once overall progress loads
  const activeCourseId = selectedCourseId || (overallProgressList.length > 0 ? overallProgressList[0].courseId : null);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="animate-spin text-primary" size={22} />
        <span className="text-xs font-black uppercase tracking-widest font-mono">Loading Progress Analytics...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-xs text-rose-400 flex flex-col items-center gap-2">
        <AlertCircle size={20} />
        <span>Failed to load student progress data from backend.</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!overallProgressList || overallProgressList.length === 0) {
    return (
      <div className="py-12 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center">
        <BookOpen size={28} className="text-muted-foreground mb-2" />
        <p className="text-xs font-black text-foreground">No Course Enrollments Found</p>
        <p className="text-[10px] text-muted-foreground max-w-xs mt-1">
          This student is not currently enrolled in any published courses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-background/40 border border-border rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Enrolled Courses</p>
            <p className="text-lg font-black text-foreground mt-0.5">{stats.totalCourses}</p>
          </div>
        </div>

        <div className="p-3.5 bg-background/40 border border-border rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 shrink-0">
            <Award size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Completed Courses</p>
            <p className="text-lg font-black text-foreground mt-0.5">{stats.completedCourses}</p>
          </div>
        </div>

        <div className="p-3.5 bg-background/40 border border-border rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Average Progress</p>
            <p className="text-lg font-black text-foreground mt-0.5">{stats.avgProgress}%</p>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Selector */}
      <div className="space-y-2">
        <span className="text-[9.5px] font-black uppercase tracking-widest text-muted-foreground block font-mono">
          Enrolled Courses ({overallProgressList.length})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {overallProgressList.map((c) => {
            const isSelected = c.courseId === activeCourseId;
            return (
              <button
                key={c.courseId}
                type="button"
                onClick={() => setSelectedCourseId(c.courseId)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-primary/10 border-primary/40 shadow-sm'
                    : 'bg-background/20 border-border/80 hover:bg-background/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{c.courseTitle}</p>
                    <p className="text-[9.5px] text-muted-foreground font-semibold mt-0.5">
                      {c.completedItems ?? 0} / {c.totalItems ?? 0} items completed
                    </p>
                  </div>
                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded shrink-0 ${
                    c.completed
                      ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                      : (c.progressPercent || 0) > 0
                      ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                      : 'bg-slate-500/10 text-muted-foreground border border-slate-500/20'
                  }`}>
                    {c.completed ? 'Completed' : (c.progressPercent || 0) > 0 ? 'In Progress' : 'Not Started'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold text-primary">{c.progressPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-background border border-border rounded-full h-1.5 overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${c.progressPercent || 0}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Course Hierarchical Tree */}
      {activeCourseId && (
        <div className="pt-2 border-t border-border/80">
          <CourseHierarchyTree courseId={activeCourseId} studentId={studentId} />
        </div>
      )}
    </div>
  );
}
