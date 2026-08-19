"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Plus,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";
import { ScopedCss, blockScopeClass } from "@/components/instructor/composer/utils/scopedCss";
import { toContentPayload } from "@/components/instructor/composer/mappers/contentBlockMapper";
import { isBackendGradable, buildQuestionPayload, buildQuizPayload } from "@/components/instructor/composer/mappers/quizMapper";

import { useCreateContent } from "@/hooks/queries/instructor/useCreateContent";
import { useUpdateContent } from "@/hooks/queries/instructor/useUpdateContent";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";
import { useCreateQuiz } from "@/hooks/queries/instructor/useCreateQuiz";
import { useCreateQuestion } from "@/hooks/queries/instructor/useCreateQuestion";
import { useUpdateQuestion } from "@/hooks/queries/instructor/useUpdateQuestion";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";

export default function ContentBlockCard({
  block,
  lessonId,
  moduleId,
  courseId,
  lessonTitle,
  allLessonContents,
  isNew,
  isFirst,
  isLast,
  onSaved,
  onCancelNew,
  onDeleted,
  onMoveUp,
  onMoveDown,
  onAddAbove,
  onAddBelow,
}) {
  const [isEditing, setIsEditing] = useState(Boolean(isNew));
  const [draft, setDraft] = useState(block);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingAddInside, setPendingAddInside] = useState(false);
  const menuRef = useRef(null);
  const nestedLayerRef = useRef(null);

  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const createQuiz = useCreateQuiz();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("click", onOutside);
    return () => window.removeEventListener("click", onOutside);
  }, [menuOpen]);

  // Entering edit mode mounts the nestable EditComponent's forwarded ref a
  // render after setIsEditing(true) commits, so opening the picker has to
  // wait for that mount rather than firing synchronously in the click
  // handler, where the ref would still be null.
  useEffect(() => {
    if (pendingAddInside && nestedLayerRef.current) {
      nestedLayerRef.current.openPicker();
      setPendingAddInside(false);
    }
  }, [pendingAddInside, isEditing]);

  if (draft.blockType === "legacy") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-300 font-medium">{draft.title || "Untitled content"}</p>
          <p className="text-xs text-slate-500">
            Created outside the composer ({draft.legacyType}) — edit it in the classic form.
          </p>
        </div>
        <a
          href={`/instructor/contents/edit/${draft.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition shrink-0"
        >
          <ExternalLink size={12} /> Edit in classic form
        </a>
      </div>
    );
  }

  const entry = blockRegistry[draft.blockType];
  const Icon = entry.icon;
  const isNested = Boolean(draft.parentContentId);
  const isNestable = Boolean(entry.capabilities?.nestable);
  const childCount = (allLessonContents || []).filter((c) => c.parentContentId === draft.id).length;

  const patchDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleAddInside = () => {
    setMenuOpen(false);
    setIsEditing(true);
    setPendingAddInside(true);
  };

  const handleSave = async () => {
    try {
      let quizLinkage = draft.quizLinkage;

      if (draft.blockType === "quiz" && isBackendGradable(draft)) {
        let quizId = quizLinkage?.quizId;
        if (!quizId) {
          const quiz = await createQuiz.mutateAsync(
            buildQuizPayload(draft, { courseId, lessonTitle }),
          );
          quizId = quiz.id;
          // Persist immediately: if question creation below fails, a retry
          // must reuse this quiz rather than creating a duplicate.
          quizLinkage = { ...quizLinkage, quizId };
          setDraft((prev) => ({ ...prev, quizLinkage }));
        }

        const questionPayload = buildQuestionPayload(draft, { courseId, moduleId, quizId });
        let questionId = quizLinkage?.questionId;
        if (questionId) {
          await updateQuestion.mutateAsync({ questionId, questionData: { ...questionPayload, quizId } });
        } else {
          const question = await createQuestion.mutateAsync(questionPayload);
          questionId = question.id;
        }

        quizLinkage = { quizId, questionId };
      }

      const finalDraft = { ...draft, quizLinkage };
      // Strip LessonCanvas-only bookkeeping fields (temp id/order/afterBlockId)
      // before persisting — the real id/order come from the Content row itself.
      const { id: _id, order: _order, afterBlockId: _afterBlockId, parentContentId: _pcid, ...blockPayload } = finalDraft;
      const payload = toContentPayload(blockPayload, {
        lessonId,
        order: block.order,
        parentContentId: draft.parentContentId ?? null,
      });

      const saved = isNew
        ? await createContent.mutateAsync(payload)
        : await updateContent.mutateAsync({ contentId: block.id, contentData: payload });

      setDraft(finalDraft);
      setIsEditing(false);
      onSaved({ ...finalDraft, id: saved.id, order: saved.order });
    } catch (error) {
      toast?.showToast(error?.response?.data?.message || "Failed to save block", "error");
    }
  };

  const handleCancel = () => {
    if (isNew) {
      onCancelNew();
      return;
    }
    setDraft(block);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: "Delete block",
      message:
        childCount > 0
          ? `Delete this block and its ${childCount} nested block${childCount > 1 ? "s" : ""}? This can't be undone.`
          : "Delete this content block? This can't be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;

    if (!isNew) {
      try {
        await deleteContent.mutateAsync({ contentId: block.id, lessonId });
      } catch (error) {
        toast?.showToast(error?.response?.data?.message || "Failed to delete block", "error");
        return;
      }
    }
    onDeleted(block.id);
  };

  const ViewComponent = entry.ViewComponent;
  const EditComponent = entry.EditComponent;
  const showHeader = isEditing || menuOpen;

  return (
    <div
      className={`group relative px-4 py-3.5 transition-colors ${
        isEditing ? "bg-slate-900/70" : "hover:bg-slate-800/30"
      } ${blockScopeClass(block.id)}`}
    >
      <ScopedCss blockId={block.id} css={draft.cssStyles} />

      <div
        className={`flex items-center justify-between gap-2 mb-2 transition-opacity ${
          showHeader ? "" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={13} className="text-orange-400 shrink-0" />
          {isEditing ? (
            <input
              value={draft.title || ""}
              onChange={(e) => patchDraft({ title: e.target.value })}
              placeholder={`${entry.label} block title (optional)`}
              className="bg-transparent text-sm font-semibold text-white outline-none border-b border-transparent focus:border-orange-500 min-w-0"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-400 truncate">
              {draft.title || entry.label}
            </span>
          )}
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-800 bg-slate-900 shadow-xl z-20 py-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setIsEditing(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                <Pencil size={12} /> Edit
              </button>
              {isNestable && !isNested && (
                <button
                  type="button"
                  onClick={handleAddInside}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                  <Layers size={12} /> Add Block Inside
                </button>
              )}
              {!isNested && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onAddAbove();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                  >
                    <Plus size={12} /> Add Block Above
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onAddBelow();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                  >
                    <Plus size={12} /> Add Block Below
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={isFirst}
                onClick={() => {
                  setMenuOpen(false);
                  onMoveUp();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-30"
              >
                <ArrowUp size={12} /> Move Up
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => {
                  setMenuOpen(false);
                  onMoveDown();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-30"
              >
                <ArrowDown size={12} /> Move Down
              </button>
              <hr className="border-slate-800 my-1" />
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40"
              >
                <Trash2 size={12} /> Delete Block
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {isNestable ? (
            <EditComponent
              ref={nestedLayerRef}
              block={draft}
              onChange={patchDraft}
              allLessonContents={allLessonContents}
              lessonId={lessonId}
              isNew={isNew}
            />
          ) : (
            <EditComponent block={draft} onChange={patchDraft} />
          )}

          <details className="text-xs">
            <summary className="text-slate-500 cursor-pointer select-none">
              Advanced: custom CSS
            </summary>
            <input
              value={draft.cssStyles || ""}
              onChange={(e) => patchDraft({ cssStyles: e.target.value })}
              placeholder="e.g. border: 1px solid red;"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono outline-none focus:border-orange-500"
            />
          </details>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
            >
              <X size={12} /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={createContent.isPending || updateContent.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50"
            >
              <Check size={12} />
              {createContent.isPending || updateContent.isPending ? "Saving…" : "Done"}
            </button>
          </div>
        </div>
      ) : isNestable ? (
        <ViewComponent block={draft} allLessonContents={allLessonContents} />
      ) : (
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
          <ViewComponent block={draft} />
        </div>
      )}
    </div>
  );
}
