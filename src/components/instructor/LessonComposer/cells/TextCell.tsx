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
  onAddAbove,
  onAddBelow,
  isSelected,
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
        contentData: { title, htmlContent, topicId: content.topicId },
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
      await deleteContent.mutateAsync({ contentId: content.id, topicId: content.topicId });
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete this block."), "error", "Delete failed");
    }
  };

  return (
    <CellShell
      icon={CELL_TYPE.icon}
      typeLabel={CELL_TYPE.label}
      title={content.title || ""}
      mode={mode}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isDeleting={deleteContent.isPending}
      onDuplicate={onDuplicate}
      isDuplicating={isDuplicating}
      badgeText={badgeText}
      badgeVariant={badgeVariant}
      onSettingsSelect={onSettingsSelect}
      onAddAbove={onAddAbove}
      onAddBelow={onAddBelow}
      isSelected={isSelected}
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
        <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed overflow-x-auto">
          <style>{`
            .prose h1 {
              font-size: 1.5rem;
              font-weight: 800;
              color: #f8fafc;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              letter-spacing: -0.02em;
            }
            .prose h2 {
              font-size: 1.25rem;
              font-weight: 700;
              color: #f59e0b;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              letter-spacing: -0.01em;
              padding-bottom: 0.375rem;
              border-bottom: 1px solid #1e293b;
            }
            .prose h3 {
              font-size: 1.125rem;
              font-weight: 700;
              color: #f8fafc;
              margin-top: 1.25rem;
              margin-bottom: 0.625rem;
              letter-spacing: -0.01em;
            }
            .prose h4 {
              font-size: 1rem;
              font-weight: 600;
              color: #e2e8f0;
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }
            .prose p {
              color: #cbd5e1;
              line-height: 1.7;
              margin-bottom: 0.875rem;
              font-size: 0.9375rem;
            }
            .prose p:last-child {
              margin-bottom: 0;
            }
            .prose strong, .prose b {
              color: #f8fafc;
              font-weight: 600;
            }
            .prose ul, .prose ol {
              padding-left: 1.25rem;
              margin-top: 0.5rem;
              margin-bottom: 0.875rem;
            }
            .prose ul {
              list-style-type: disc;
            }
            .prose ol {
              list-style-type: decimal;
            }
            .prose li {
              color: #cbd5e1;
              margin-bottom: 0.375rem;
              line-height: 1.6;
              font-size: 0.9375rem;
            }
            .prose blockquote {
              border-left: 3px solid #f59e0b;
              padding-left: 1rem;
              margin-top: 1rem;
              margin-bottom: 1rem;
              font-style: italic;
              color: #94a3b8;
              background-color: rgba(245, 158, 11, 0.04);
              border-radius: 0 0.5rem 0.5rem 0;
            }
            .prose a {
              color: #fbbf24;
              text-decoration: underline;
              text-underline-offset: 3px;
              transition: color 0.15s ease;
            }
            .prose a:hover {
              color: #f59e0b;
            }
            .prose a:empty {
              display: none;
            }
            .prose table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 1.25rem;
              margin-bottom: 1.25rem;
              border-radius: 0.75rem;
              border: 1px solid #334155;
              overflow: hidden;
              background-color: #020617;
            }
            .prose th {
              background-color: #0f172a;
              color: #f59e0b;
              font-weight: 700;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 0.75rem 1rem;
              border-bottom: 1px solid #334155;
              text-align: left;
            }
            .prose td {
              padding: 0.75rem 1rem;
              border-bottom: 1px solid #1e293b;
              color: #e2e8f0;
              font-size: 0.875rem;
            }
            .prose tr:last-child td {
              border-bottom: none;
            }
            .prose tr:hover td {
              background-color: #0f172a;
            }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">No text content yet.</p>
      )}
    </CellShell>
  );
}

/** The "Add Cell" creation form for a Text block — hosted inside AddCellModal. */
export function CreateTextForm({ topicId, order, onCreated, onCancel }: CreateCellFormProps) {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const createContent = useCreateContent();
  const { showToast } = useToast();

  const handleCreate = async () => {
    try {
      await createContent.mutateAsync({ topicId, type: "HTML", order, title, htmlContent });
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
