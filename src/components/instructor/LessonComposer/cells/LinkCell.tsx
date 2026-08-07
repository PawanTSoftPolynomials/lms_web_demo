"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { useCreateContent, useUpdateContent, useDeleteContent } from "../contentMutations";
import { CellShell } from "../CellShell";
import { CELL_TYPES } from "../cellTypes";
import { getErrorMessage } from "../getErrorMessage";
import type { CellActionProps, ContentRow, CreateCellFormProps } from "../types";

const CELL_TYPE = CELL_TYPES.find((c) => c.id === "link")!;

interface LinkCellProps extends CellActionProps {
  content: ContentRow;
}

/** Renders/edits a `type: "LINK"` Content row — a link out to an external resource. */
export function LinkCell({
  content,
  onDuplicate,
  isDuplicating,
  badgeText,
  badgeVariant,
  onSettingsSelect,
}: LinkCellProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [title, setTitle] = useState(content.title ?? "");
  const [externalUrl, setExternalUrl] = useState(content.externalUrl ?? "");

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const handleEdit = () => {
    setTitle(content.title ?? "");
    setExternalUrl(content.externalUrl ?? "");
    setMode("edit");
  };

  const handleCancel = () => {
    setTitle(content.title ?? "");
    setExternalUrl(content.externalUrl ?? "");
    setMode("view");
  };

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync({
        contentId: content.id,
        contentData: { title, externalUrl, lessonId: content.lessonId },
      });
      setMode("view");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save this link."), "error", "Save failed");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete link",
      message: "This will permanently remove this content from the lesson.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteContent.mutateAsync({ contentId: content.id, lessonId: content.lessonId });
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete this link."), "error", "Delete failed");
    }
  };

  return (
    <CellShell
      icon={CELL_TYPE.icon}
      typeLabel={CELL_TYPE.label}
      title={content.title || "Untitled link"}
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
            placeholder="Link title"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="text"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
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
      ) : content.externalUrl ? (
        <a
          href={content.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/50"
        >
          <span className="truncate">{content.externalUrl}</span>
          <ExternalLink className="size-4 shrink-0 text-primary" />
        </a>
      ) : (
        <p className="text-sm italic text-muted-foreground">No URL set yet.</p>
      )}
    </CellShell>
  );
}

/** The "Add Cell" creation form for a Link block — hosted inside AddCellModal. */
export function CreateLinkForm({ lessonId, order, onCreated, onCancel }: CreateCellFormProps) {
  const [title, setTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const createContent = useCreateContent();
  const { showToast } = useToast();

  const handleCreate = async () => {
    try {
      const safeOrder = typeof order === "number" && !isNaN(order) && order > 0 ? order : 1;
      await createContent.mutateAsync({ lessonId, type: "LINK", order: safeOrder, title, externalUrl });
      onCreated();
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to add this link."), "error", "Add failed");
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Link title"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
      <input
        type="text"
        value={externalUrl}
        onChange={(e) => setExternalUrl(e.target.value)}
        placeholder="https://…"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleCreate} disabled={createContent.isPending || !externalUrl}>
          {createContent.isPending ? "Adding…" : "Add Link"}
        </Button>
      </div>
    </div>
  );
}
