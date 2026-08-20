"use client";

import React from "react";
import {
  Folder,
  Plus,
  Pencil,
  Copy,
  Trash2,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { CourseComposerItemCard } from "./CourseComposerItemCard";

export function ModuleOverviewView({
  module,
  onSelectLesson,
  onAddLesson,
  onEditModule,
  onEditLesson,
  onAddTopic,
  onDuplicateLesson,
  onDeleteLesson,
  allModules = [],
  onSelectModule,
}) {
  if (!module) return null;

  const lessons = module.lessons || [];

  // Compute Next Module in course sequence
  const currentModIdx = allModules.findIndex((m) => m.id === module.id);
  const nextModule = currentModIdx >= 0 && currentModIdx < allModules.length - 1 ? allModules[currentModIdx + 1] : null;

  return (
    <div className="notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-md space-y-6">
      {/* Module Header Toolbar */}
      <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="cell-badge rounded bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <Folder size={12} />
            Module Header
          </span>
        </div>
        <div className="cell-controls">
          <button
            type="button"
            className="border border-slate-800 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            onClick={() => onEditModule?.(module)}
          >
            <Pencil size={13} />
            Edit Module Details
          </button>
        </div>
      </div>

      {/* Module Title & Description */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">{module.title || "Untitled Module"}</h2>
        {module.subtitle && (
          <p className="text-xs font-semibold text-orange-400 italic">{module.subtitle}</p>
        )}
        {(module.summary || module.description) && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {module.summary || module.description}
          </p>
        )}
      </div>

      {/* LESSONS SECTION */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-orange-400" />
            <h3 className="text-sm font-bold text-white">Lessons</h3>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {lessons.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddLesson?.(module.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition cursor-pointer"
          >
            <Plus size={14} />
            Add Lesson
          </button>
        </div>

        {/* LESSONS GRID OR EMPTY STATE */}
        {lessons.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 inline-block">
              <BookOpen size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">No lessons yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Add your first lesson to start organizing topics and learning materials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddLesson?.(module.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              <Plus size={14} />
              Add Lesson
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {lessons.map((lesson, idx) => {
              const topics = lesson.topics || [];
              const topicsCount = topics.length;
              const contentsCount = topics.reduce((acc, t) => acc + (Array.isArray(t.contents) ? t.contents.length : 0), 0);

              const menuItems = [
                {
                  label: "Edit Lesson Details",
                  icon: Pencil,
                  onSelect: () => onEditLesson?.(lesson),
                },
                {
                  label: "Add Topic",
                  icon: Plus,
                  highlight: true,
                  onSelect: () => onAddTopic?.(lesson.id),
                },
                onDuplicateLesson && {
                  label: "Duplicate Lesson",
                  icon: Copy,
                  onSelect: () => onDuplicateLesson?.(lesson),
                },
                { separator: true },
                {
                  label: "Delete Lesson",
                  icon: Trash2,
                  destructive: true,
                  onSelect: (e) => onDeleteLesson?.(e, lesson, module.id),
                },
              ].filter(Boolean);

              return (
                <CourseComposerItemCard
                  key={lesson.id || `lesson-${idx}`}
                  orderNumber={idx + 1}
                  title={lesson.title || `Lesson ${idx + 1}`}
                  subtitle={lesson.subtitle || lesson.summary || lesson.description}
                  metadataText={`${topicsCount} ${topicsCount === 1 ? "Topic" : "Topics"} · ${contentsCount} ${contentsCount === 1 ? "Content" : "Contents"}`}
                  onClick={() => onSelectLesson?.(lesson.id)}
                  menuItems={menuItems}
                  badgeColorClass="bg-orange-500/15 text-orange-400 border-orange-500/30"
                  hoverTextClass="group-hover:text-orange-400"
                  hoverBorderClass="hover:border-orange-500/40"
                  arrowColorClass="group-hover:text-orange-400"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* NEXT MODULE NAVIGATION FOOTER */}
      {nextModule && (
        <div className="pt-6 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onSelectModule?.(nextModule)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-right transition group cursor-pointer max-w-[280px]"
          >
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 block">Next Module</span>
              <span className="text-xs font-bold text-white truncate block">{nextModule.title}</span>
            </div>
            <ChevronRight size={16} className="text-orange-400 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
