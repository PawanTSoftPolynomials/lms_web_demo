"use client";

import { useState } from "react";
import { Settings, Plus, BookOpen, Sparkles } from "lucide-react";

import ModuleAccordionItem from "@/components/instructor/composer/ModuleAccordionItem";
import { useCreateModule } from "@/hooks/queries/instructor/useCreateModule";
import { useReorderModules } from "@/hooks/queries/instructor/useReorderModules";

export default function ComposerSidebar({
  course,
  courseId,
  selectedLessonId,
  view,
  onSelectLesson,
  onSelectSettings,
  onOpenAiAssistant,
}) {
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const createModule = useCreateModule();
  const reorderModules = useReorderModules();

  const modules = [...(course.modules || [])].sort((a, b) => a.order - b.order);

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    const nextOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.order)) + 1 : 1;
    createModule.mutate({ courseId, title: newModuleTitle, order: nextOrder });
    setNewModuleTitle("");
    setAddingModule(false);
  };

  const moveModule = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const reordered = [...modules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    reorderModules.mutate({
      courseId,
      modules: reordered.map((m, i) => ({ id: m.id, order: i + 1 })),
    });
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-3">
      <div className="rounded-2xl border border-border bg-card shadow-luxury-sm p-4 space-y-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-1">
          Course Map
        </p>

        <button
          type="button"
          onClick={onSelectSettings}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            view === "settings"
              ? "bg-primary/15 text-primary border border-primary/25"
              : "text-foreground hover:bg-surface-muted/60 border border-transparent"
          }`}
        >
          <Settings size={14} /> Course Settings
        </button>

        <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-1 scrollbar-none">
          {modules.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-3 flex items-center gap-1.5 font-medium">
              <BookOpen size={13} /> No modules yet
            </p>
          )}
          {modules.map((mod, i) => (
            <ModuleAccordionItem
              key={mod.id}
              module={mod}
              courseId={courseId}
              isFirst={i === 0}
              isLast={i === modules.length - 1}
              selectedLessonId={view === "lesson" ? selectedLessonId : null}
              onSelectLesson={onSelectLesson}
              onMoveModuleUp={() => moveModule(i, -1)}
              onMoveModuleDown={() => moveModule(i, 1)}
              onOpenAiAssistant={onOpenAiAssistant}
              defaultOpen={(mod.lessons || []).some((l) => l.id === selectedLessonId)}
            />
          ))}
        </div>

        {addingModule ? (
          <input
            autoFocus
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            onBlur={() => !newModuleTitle.trim() && setAddingModule(false)}
            placeholder="Module title…"
            className="w-full bg-surface-muted rounded-xl px-3 py-2 text-xs outline-none border border-primary text-foreground"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAddingModule(true)}
              className="inline-flex items-center justify-center gap-1 py-2 text-xs font-bold text-foreground bg-surface-muted hover:bg-muted border border-border rounded-xl transition cursor-pointer"
            >
              <Plus size={13} /> Module
            </button>
            <button
              type="button"
              onClick={() => onOpenAiAssistant && onOpenAiAssistant("MODULE")}
              className="inline-flex items-center justify-center gap-1 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl transition cursor-pointer"
            >
              <Sparkles size={13} /> AI Module
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
