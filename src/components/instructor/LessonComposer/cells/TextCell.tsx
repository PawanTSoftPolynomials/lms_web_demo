"use client";

import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";

import RichTextEditor from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { useCreateContent, useUpdateContent, useDeleteContent } from "../contentMutations";
import { CellShell } from "../CellShell";
import { CELL_TYPES } from "../cellTypes";
import { getErrorMessage } from "../getErrorMessage";
import type { CellActionProps, ContentRow, CreateCellFormProps } from "../types";

const CELL_TYPE = CELL_TYPES.find((c) => c.id === "text")!;

interface TextCellProps extends CellActionProps {
  content: ContentRow;
}

/** Renders/edits a `type: "HTML"` Content row — rich text via the existing Quill editor. */
export function TextCell({
  content,
  onDuplicate,
  isDuplicating,
  badgeText,
  badgeVariant,
  onSettingsSelect,
}: TextCellProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [title, setTitle] = useState(content.title ?? "");
  const [htmlContent, setHtmlContent] = useState(content.htmlContent ?? "");

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const handleEdit = () => {
    setTitle(content.title ?? "");
    setHtmlContent(content.htmlContent ?? "");
    setMode("edit");
  };

  const handleCancel = () => {
    setTitle(content.title ?? "");
    setHtmlContent(content.htmlContent ?? "");
    setMode("view");
  };

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync({
        contentId: content.id,
        contentData: { title, htmlContent, lessonId: content.lessonId },
      });
      setMode("view");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save this text block."), "error", "Save failed");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete text block",
      message: "This will permanently remove this content from the lesson.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteContent.mutateAsync({ contentId: content.id, lessonId: content.lessonId });
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete this block."), "error", "Delete failed");
    }
  };

  return (
    <CellShell
      icon={CELL_TYPE.icon}
      typeLabel={CELL_TYPE.label}
      title={content.title || "Untitled text block"}
      mode={mode}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isDeleting={deleteContent.isPending}
      onDuplicate={onDuplicate}
      isDuplicating={isDuplicating}
      badgeText={badgeText}
      badgeVariant={badgeVariant}
      onSettingsSelect={onSettingsSelect}
    >
      {mode === "edit" ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Block title (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <RichTextEditor
            value={htmlContent}
            onChange={setHtmlContent}
            placeholder="Write the lesson text…"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={updateContent.isPending}>
              {updateContent.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : htmlContent ? (
        <div
          className="prose prose-invert prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
        />
      ) : (
        <p className="text-sm italic text-muted-foreground">No text content yet.</p>
      )}
    </CellShell>
  );
}

/** The "Add Cell" creation form for a Text block — hosted inside AddCellModal. */
export function CreateTextForm({ lessonId, order, onCreated, onCancel }: CreateCellFormProps) {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const createContent = useCreateContent();
  const { showToast } = useToast();

  const handleCreate = async () => {
    try {
      await createContent.mutateAsync({ lessonId, type: "HTML", order, title, htmlContent });
      onCreated();
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to add this text block."), "error", "Add failed");
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Block title (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
      <RichTextEditor value={htmlContent} onChange={setHtmlContent} placeholder="Write the lesson text…" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleCreate} disabled={createContent.isPending}>
          {createContent.isPending ? "Adding…" : "Add Text Block"}
        </Button>
      </div>
    </div>
  );
}
