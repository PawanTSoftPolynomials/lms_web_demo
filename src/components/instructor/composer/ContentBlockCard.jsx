"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Plus,
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
  isNew,
  isFirst,
  isLast,
  onSaved,
  onCancelNew,
  onDeleted,
  onMoveUp,
  onMoveDown,
  onAddBelow,
}) {
  const [isEditing, setIsEditing] = useState(Boolean(isNew));
  const [draft, setDraft] = useState(block);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const patchDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

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
      const { id: _id, order: _order, afterBlockId: _afterBlockId, ...blockPayload } = finalDraft;
      const payload = toContentPayload(blockPayload, { lessonId, order: block.order });

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
      message: "Delete this content block? This can't be undone.",
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

  return (
    <div
      className={`relative rounded-xl border bg-slate-900/50 p-4 transition ${
        isEditing ? "border-orange-600/60" : "border-slate-800"
      } ${blockScopeClass(block.id)}`}
    >
      <ScopedCss blockId={block.id} css={draft.cssStyles} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className="text-orange-400 shrink-0" />
          {isEditing ? (
            <input
              value={draft.title || ""}
              onChange={(e) => patchDraft({ title: e.target.value })}
              placeholder={`${entry.label} block title (optional)`}
              className="bg-transparent text-sm font-semibold text-white outline-none border-b border-transparent focus:border-orange-500 min-w-0"
            />
          ) : (
            <span className="text-sm font-semibold text-white truncate">
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
            <div className="absolute right-0 mt-1 w-44 rounded-lg border border-slate-800 bg-slate-900 shadow-xl z-20 py-1">
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
          <EditComponent block={draft} onChange={patchDraft} />

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
      ) : (
        <ViewComponent block={draft} />
      )}
    </div>
  );
}
