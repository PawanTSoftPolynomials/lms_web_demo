"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import ContentBlockCard from "@/components/instructor/composer/ContentBlockCard";
import AddBlockModal from "@/components/instructor/composer/AddBlockModal";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";
import { fromContentRow } from "@/components/instructor/composer/mappers/contentBlockMapper";

import { useUpdateLesson } from "@/hooks/queries/instructor/useUpdateLesson";
import { useReorderContents } from "@/hooks/queries/instructor/useReorderContents";

export default function LessonCanvas({ lesson, moduleId, courseId }) {
  const [description, setDescription] = useState(lesson.description || "");
  const [draftBlocks, setDraftBlocks] = useState([]);
  const [addModalAfterId, setAddModalAfterId] = useState(undefined); // undefined = closed, null = append at end

  const updateLesson = useUpdateLesson();
  const reorderContents = useReorderContents();

  const savedBlocks = useMemo(
    () =>
      [...(lesson.contents || [])]
        .sort((a, b) => a.order - b.order)
        .map((row) => fromContentRow(row)),
    [lesson.contents],
  );

  const displayList = useMemo(() => {
    const list = [];
    savedBlocks.forEach((block) => {
      list.push({ block, isDraft: false });
      draftBlocks
        .filter((d) => d.afterBlockId === block.id)
        .forEach((d) => list.push({ block: d, isDraft: true }));
    });
    draftBlocks
      .filter((d) => d.afterBlockId === null)
      .forEach((d) => list.push({ block: d, isDraft: true }));
    return list;
  }, [savedBlocks, draftBlocks]);

  const handleDescriptionBlur = () => {
    if (description === (lesson.description || "")) return;
    updateLesson.mutate({
      lessonId: lesson.id,
      lessonData: { moduleId, description },
    });
  };

  const openAddModal = (afterBlockId) => setAddModalAfterId(afterBlockId);

  const handlePickBlockType = (blockType) => {
    const nextOrder =
      savedBlocks.length > 0 ? Math.max(...savedBlocks.map((b) => b.order)) + 1 : 1;

    setDraftBlocks((prev) => [
      ...prev,
      {
        ...blockRegistry[blockType].defaultData(),
        id: `draft-${crypto.randomUUID()}`,
        order: nextOrder,
        afterBlockId: addModalAfterId ?? null,
      },
    ]);
    setAddModalAfterId(undefined);
  };

  const handleCancelDraft = (tempId) => {
    setDraftBlocks((prev) => prev.filter((d) => d.id !== tempId));
  };

  const handleDraftSaved = (tempId) => {
    setDraftBlocks((prev) => prev.filter((d) => d.id !== tempId));
  };

  const moveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= savedBlocks.length) return;

    const reordered = [...savedBlocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    reorderContents.mutate({
      lessonId: lesson.id,
      contents: reordered.map((b, i) => ({ id: b.id, order: i + 1 })),
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-black text-white">{lesson.title}</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          rows={2}
          placeholder="Lesson description…"
          className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-300 outline-none focus:border-orange-500 resize-y"
        />
      </div>

      <div className="space-y-3">
        {displayList.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            No content blocks yet. Add your first one below.
          </div>
        )}

        {displayList.map(({ block, isDraft }, i) => {
          const savedIndex = savedBlocks.findIndex((b) => b.id === block.id);
          return (
            <ContentBlockCard
              key={block.id}
              block={block}
              lessonId={lesson.id}
              moduleId={moduleId}
              courseId={courseId}
              lessonTitle={lesson.title}
              isNew={isDraft}
              isFirst={isDraft ? true : savedIndex === 0}
              isLast={isDraft ? true : savedIndex === savedBlocks.length - 1}
              onSaved={isDraft ? () => handleDraftSaved(block.id) : () => {}}
              onCancelNew={() => handleCancelDraft(block.id)}
              onDeleted={() => {}}
              onMoveUp={() => moveBlock(savedIndex, -1)}
              onMoveDown={() => moveBlock(savedIndex, 1)}
              onAddBelow={() => openAddModal(block.id)}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => openAddModal(null)}
        className="w-full inline-flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl transition"
      >
        <Plus size={14} /> Add Block
      </button>

      <AddBlockModal
        open={addModalAfterId !== undefined}
        onClose={() => setAddModalAfterId(undefined)}
        onPick={handlePickBlockType}
      />
    </div>
  );
}
