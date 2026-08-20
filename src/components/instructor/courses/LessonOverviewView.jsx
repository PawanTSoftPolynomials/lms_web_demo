"use client";

import React from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/shadcn/dropdown-menu";

export function LessonOverviewView({
  lesson,
  lessonForm,
  setLessonForm,
  isEditing,
  setIsEditing,
  onSaveLessonMeta,
  isSaving,
  topics = [],
  onSelectTopic,
  onAddTopic,
  onAddContent,
  onEditTopic,
  onDuplicateTopic,
  onDeleteTopic,
  parentModule = null,
  onSelectLesson,
}) {
  if (!lesson) return null;

  // Resolve ordering of lessons inside the parent module
  const modLessons = parentModule?.lessons || [];
  const currentLessonIdx = modLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentLessonIdx > 0 ? modLessons[currentLessonIdx - 1] : null;
  const nextLesson = currentLessonIdx >= 0 && currentLessonIdx < modLessons.length - 1 ? modLessons[currentLessonIdx + 1] : null;

  const displayTopics = topics.length > 0 ? topics : (lesson.topics || []);

  return (
    <div className={`notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-md space-y-6 ${isEditing ? "active-cell border-purple-500/50" : ""}`}>
      {/* Lesson Header Toolbar */}
      <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="cell-badge rounded bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <BookOpen size={12} />
            Lesson Header
          </span>
          {parentModule && (
            <span className="text-xs font-semibold text-slate-400">
              in <span className="text-slate-200">{parentModule.title}</span>
            </span>
          )}
        </div>
        <div className="cell-controls">
          <button
            type="button"
            className={`btn ${isEditing ? "bg-purple-500 text-slate-950 hover:bg-purple-400" : "border border-slate-800 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800"} rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil size={13} />
            {isEditing ? "Done Editing" : "Edit Lesson Details"}
          </button>
        </div>
      </div>

      {/* Lesson Metadata Display / Edit Form */}
      <div className="cell-render-area">
        {isEditing ? (
          <div className="space-y-4 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div className="form-group">
              <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                className="cell-input w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                value={lessonForm.title || ""}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g. Introduction to C"
              />
            </div>

            <div className="form-group">
              <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Lesson Subtitle
              </label>
              <input
                type="text"
                className="cell-input w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                value={lessonForm.subtitle || ""}
                onChange={(e) => setLessonForm({ ...lessonForm, subtitle: e.target.value })}
                placeholder="e.g. Understanding compilation and basic structure."
              />
            </div>

            <div className="form-group">
              <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Lesson Summary / Objectives
              </label>
              <textarea
                className="cell-textarea w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500 resize-none"
                rows={3}
                value={lessonForm.summary || lessonForm.description || ""}
                onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value, description: e.target.value })}
                placeholder="Overview of what students will learn in this lesson..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                className="rounded-xl border border-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-1.5 text-xs font-black text-white transition shadow-lg shadow-purple-600/20 cursor-pointer"
                onClick={onSaveLessonMeta}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Lesson"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">{lesson.title || "Untitled Lesson"}</h2>
            {lesson.subtitle && (
              <p className="text-xs font-semibold text-purple-400 italic">{lesson.subtitle}</p>
            )}
            {(lesson.summary || lesson.description) && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {lesson.summary || lesson.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* TOPICS SECTION (COMPACT CARDS GRID) */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Topics</h3>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {displayTopics.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onAddTopic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold transition cursor-pointer"
          >
            <Plus size={14} />
            Add Topic
          </button>
        </div>

        {/* TOPICS GRID OR EMPTY STATE */}
        {displayTopics.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 inline-block">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">No topics yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Add your first topic to organize content blocks in this lesson.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddTopic}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Plus size={14} />
              Add Topic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {displayTopics.map((topic, idx) => {
              const contentCount = Array.isArray(topic.contents) ? topic.contents.length : 0;
              const formattedNum = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={topic.id || `topic-${idx}`}
                  onClick={() => onSelectTopic?.(topic.id, lesson.id, parentModule?.id)}
                  className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 hover:bg-slate-900 hover:border-purple-500/40 transition duration-150 shadow-sm cursor-pointer min-h-[120px]"
                >
                  {/* Top Bar: Topic Order Badge & 3-Dot Kebab Menu */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[11px] font-mono font-bold border border-purple-500/30">
                      {formattedNum}
                    </span>

                    {/* Topic 3-Dot Kebab Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            aria-label="Topic actions"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-200">
                          <DropdownMenuItem
                            onClick={() => onEditTopic?.(topic)}
                            className="cursor-pointer hover:bg-slate-900 text-xs"
                          >
                            <Pencil className="mr-2 size-3.5 text-slate-400" />
                            Edit Topic
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onAddContent?.(topic.id, lesson.id, parentModule?.id)}
                            className="cursor-pointer hover:bg-slate-900 text-xs text-purple-400"
                          >
                            <Plus className="mr-2 size-3.5 text-purple-400" />
                            Add Content
                          </DropdownMenuItem>
                          {onDuplicateTopic && (
                            <DropdownMenuItem
                              onClick={() => onDuplicateTopic?.(topic)}
                              className="cursor-pointer hover:bg-slate-900 text-xs"
                            >
                              <Copy className="mr-2 size-3.5 text-slate-400" />
                              Duplicate Topic
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-slate-800" />
                          <DropdownMenuItem
                            onClick={(e) => onDeleteTopic?.(e, topic, lesson.id)}
                            className="cursor-pointer text-red-400 hover:bg-red-950/40 text-xs"
                          >
                            <Trash2 className="mr-2 size-3.5 text-red-400" />
                            Delete Topic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Middle: Topic Title */}
                  <h4 className="text-sm font-bold text-white line-clamp-2 my-2 group-hover:text-purple-300 transition">
                    {topic.title || `Topic ${idx + 1}`}
                  </h4>

                  {/* Bottom Bar: Content Count & Arrow Affordance */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400 group-hover:text-slate-300">
                    <span className="text-[11px] font-medium">
                      {contentCount} {contentCount === 1 ? "content" : "contents"}
                    </span>
                    <ArrowRight size={13} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PREVIOUS / NEXT LESSON NAVIGATION FOOTER */}
      {(prevLesson || nextLesson) && (
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Previous Lesson */}
          {prevLesson ? (
            <button
              type="button"
              onClick={() => onSelectLesson?.(prevLesson.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-left transition group cursor-pointer max-w-[260px]"
            >
              <ChevronLeft size={16} className="text-slate-400 group-hover:-translate-x-0.5 transition shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Previous Lesson</span>
                <span className="text-xs font-bold text-slate-200 truncate block">{prevLesson.title}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {/* Right: Next Lesson */}
          {nextLesson ? (
            <button
              type="button"
              onClick={() => onSelectLesson?.(nextLesson.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-right transition group cursor-pointer max-w-[280px] ml-auto"
            >
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">Next Lesson</span>
                <span className="text-xs font-bold text-white truncate block">{nextLesson.title}</span>
              </div>
              <ChevronRight size={16} className="text-purple-400 group-hover:translate-x-0.5 transition shrink-0" />
            </button>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
