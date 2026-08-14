"use client";

import { useState } from "react";
import { Folder, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import Input from "@/components/ui/Input";
import AddBlockModal from "@/components/instructor/composer/AddBlockModal";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";
import PreviewBlockCard from "./PreviewBlockCard";

const reorder = (list, index, direction) => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, i) => ({ ...item, order: i + 1 }));
};

function LessonEditor({ lesson, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const updateContent = (content) => onChange({ ...lesson, content });

  const handleAddBlock = (type) => {
    setPickerOpen(false);
    updateContent([...(lesson.content || []), blockRegistry[type].defaultData()]);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setCollapsed((v) => !v)} className="text-slate-500 hover:text-white">
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <input
          value={lesson.title || ""}
          onChange={(e) => onChange({ ...lesson, title: e.target.value })}
          className="flex-1 bg-transparent text-sm font-semibold text-slate-100 outline-none border-b border-transparent focus:border-orange-500 min-w-0"
        />
        <span className="text-[10px] text-slate-500 shrink-0">{(lesson.content || []).length} block(s)</span>
        <button type="button" disabled={isFirst} onClick={onMoveUp} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={13} /></button>
        <button type="button" disabled={isLast} onClick={onMoveDown} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={13} /></button>
        <button type="button" onClick={onDelete} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 size={13} /></button>
      </div>

      {!collapsed && (
        <div className="space-y-2 pl-6">
          {(lesson.content || []).map((block, bi) => (
            <PreviewBlockCard
              key={bi}
              block={block}
              isFirst={bi === 0}
              isLast={bi === (lesson.content || []).length - 1}
              onChange={(next) => updateContent(lesson.content.map((b, i) => (i === bi ? next : b)))}
              onDelete={() => updateContent(lesson.content.filter((_, i) => i !== bi))}
              onMoveUp={() => updateContent(reorder(lesson.content, bi, -1))}
              onMoveDown={() => updateContent(reorder(lesson.content, bi, 1))}
            />
          ))}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
          >
            <Plus size={12} /> Add Block
          </button>
          <AddBlockModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handleAddBlock} />
        </div>
      )}
    </div>
  );
}

function ModuleEditor({ moduleData, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [collapsed, setCollapsed] = useState(false);

  const updateLessons = (lessons) => onChange({ ...moduleData, lessons });

  const handleAddLesson = () => {
    updateLessons([...(moduleData.lessons || []), { title: "New Lesson", order: (moduleData.lessons || []).length + 1, content: [] }]);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setCollapsed((v) => !v)} className="text-slate-500 hover:text-white">
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        <Folder size={16} className="text-amber-400 shrink-0" />
        <input
          value={moduleData.title || ""}
          onChange={(e) => onChange({ ...moduleData, title: e.target.value })}
          className="flex-1 bg-transparent text-base font-bold text-slate-100 outline-none border-b border-transparent focus:border-orange-500 min-w-0"
        />
        <span className="text-[10px] text-slate-500 shrink-0">{(moduleData.lessons || []).length} lesson(s)</span>
        <button type="button" disabled={isFirst} onClick={onMoveUp} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={14} /></button>
        <button type="button" disabled={isLast} onClick={onMoveDown} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={14} /></button>
        <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-400"><Trash2 size={14} /></button>
      </div>

      {!collapsed && (
        <div className="space-y-3 pl-6">
          {(moduleData.lessons || []).map((lesson, li) => (
            <LessonEditor
              key={li}
              lesson={lesson}
              isFirst={li === 0}
              isLast={li === (moduleData.lessons || []).length - 1}
              onChange={(next) => updateLessons(moduleData.lessons.map((l, i) => (i === li ? next : l)))}
              onDelete={() => updateLessons(moduleData.lessons.filter((_, i) => i !== li))}
              onMoveUp={() => updateLessons(reorder(moduleData.lessons, li, -1))}
              onMoveDown={() => updateLessons(reorder(moduleData.lessons, li, 1))}
            />
          ))}
          <button
            type="button"
            onClick={handleAddLesson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
          >
            <Plus size={12} /> Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

/** Editable Course -> Module -> Lesson -> Content preview tree, operating on local canonicalJson.course state. */
export default function PreviewTree({ course, onChange }) {
  const updateModules = (modules) => onChange({ ...course, modules });

  const handleAddModule = () => {
    updateModules([...(course.modules || []), { title: "New Module", order: (course.modules || []).length + 1, lessons: [] }]);
  };

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <Input label="Course title" value={course.title || ""} onChange={(e) => onChange({ ...course, title: e.target.value })} />
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Description</label>
          <textarea
            value={course.description || ""}
            onChange={(e) => onChange({ ...course, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-orange-500 resize-y"
          />
        </div>
      </div>

      {(course.modules || []).map((moduleData, mi) => (
        <ModuleEditor
          key={mi}
          moduleData={moduleData}
          isFirst={mi === 0}
          isLast={mi === (course.modules || []).length - 1}
          onChange={(next) => updateModules(course.modules.map((m, i) => (i === mi ? next : m)))}
          onDelete={() => updateModules(course.modules.filter((_, i) => i !== mi))}
          onMoveUp={() => updateModules(reorder(course.modules, mi, -1))}
          onMoveDown={() => updateModules(reorder(course.modules, mi, 1))}
        />
      ))}

      <button
        type="button"
        onClick={handleAddModule}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
      >
        <Plus size={14} /> Add Module
      </button>
    </div>
  );
}
