"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Download, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { useUploadContentFile } from "@/hooks/queries/instructor/useUploadContentFile";

import { useCreateContent, useUpdateContent, useDeleteContent } from "../contentMutations";
import { CellShell } from "../CellShell";
import { getErrorMessage } from "../getErrorMessage";
import type { CellTypeDefinition } from "../cellTypes";
import type { CellActionProps, ContentRow, CreateCellFormProps } from "../types";

interface DocumentCellProps extends CellActionProps {
  content: ContentRow;
  cellType: CellTypeDefinition;
}

export function DocumentCell({
  content,
  cellType,
  onDuplicate,
  isDuplicating,
  badgeText,
  badgeVariant,
  onSettingsSelect,
  onAddAbove,
  onAddBelow,
  isSelected,
}: DocumentCellProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [title, setTitle] = useState(content.title ?? "");
  const [fileUrl, setFileUrl] = useState(content.fileUrl ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const uploadFile = useUploadContentFile();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const handleEdit = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setUploadError(null);
    setMode("edit");
  };

  const handleCancel = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setUploadError(null);
    setMode("view");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const result = await uploadFile.mutateAsync(file);
      setFileUrl(result.fileUrl);
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync({
        contentId: content.id,
        contentData: { title, fileUrl, lessonId: content.lessonId },
      });
      setMode("view");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save this file."), "error", "Save failed");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${cellType.label.toLowerCase()}`,
      message: "This will permanently remove this content from the lesson.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteContent.mutateAsync({ contentId: content.id, lessonId: content.lessonId });
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete this file."), "error", "Delete failed");
    }
  };

  const isLocalFile = content.fileUrl?.includes("localhost") || content.fileUrl?.includes("127.0.0.1");
  const viewerUrl = content.fileUrl && !isLocalFile
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(content.fileUrl)}`
    : null;

  return (
    <CellShell
      icon={cellType.icon}
      typeLabel={cellType.label}
      title={content.title || `Untitled ${cellType.label.toLowerCase()}`}
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
            placeholder={`${cellType.label} title`}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          {!fileUrl && !uploadFile.isPending && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-primary/60"
            >
              <Upload className="size-6 text-primary" />
              <p className="text-xs font-semibold text-foreground">Click to choose a file from your device</p>
            </div>
          )}

          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

          {uploadFile.isPending && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </div>
          )}

          {fileUrl && !uploadFile.isPending && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              <p className="flex-1 truncate text-xs text-foreground">{fileUrl.split("/").pop()}</p>
              <button
                type="button"
                onClick={() => setFileUrl("")}
                className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove file"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateContent.isPending || uploadFile.isPending}
            >
              {updateContent.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : content.fileUrl ? (
        viewerUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-card-border">
            <iframe src={viewerUrl} title={content.title || cellType.label} className="absolute inset-0 h-full w-full" allowFullScreen />
          </div>
        ) : (
          <a
            href={content.fileUrl}
            download
            className="flex items-center justify-center gap-2 rounded-xl border border-card-border bg-background px-4 py-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
          >
            <Download className="size-4 text-primary" />
            Download {cellType.label}
          </a>
        )
      ) : (
        <p className="text-sm italic text-muted-foreground">No file uploaded yet.</p>
      )}
    </CellShell>
  );
}

interface CreateFileFormProps extends CreateCellFormProps {
  cellType: CellTypeDefinition;
  accept?: string;
}

export function CreateFileForm({ lessonId, order, cellType, accept, onCreated, onCancel }: CreateFileFormProps) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createContent = useCreateContent();
  const uploadFile = useUploadContentFile();
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const result = await uploadFile.mutateAsync(file);
      setFileUrl(result.fileUrl);
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    try {
      const safeOrder = typeof order === "number" && !isNaN(order) && order > 0 ? order : 1;
      await createContent.mutateAsync({
        lessonId,
        type: cellType.contentType,
        order: safeOrder,
        title: title || cellType.label,
        fileUrl,
      });
      onCreated();
    } catch (error) {
      showToast(getErrorMessage(error, `Failed to add this ${cellType.label.toLowerCase()}.`), "error", "Add failed");
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`${cellType.label} title`}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />

      {!fileUrl && !uploadFile.isPending && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-primary/60"
        >
          <Upload className="size-6 text-primary" />
          <p className="text-xs font-semibold text-foreground">Click to choose a file from your device</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

      {uploadFile.isPending && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Uploading…</p>
        </div>
      )}

      {fileUrl && !uploadFile.isPending && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <p className="flex-1 truncate text-xs text-foreground">{fileUrl.split("/").pop()}</p>
          <button
            type="button"
            onClick={() => setFileUrl("")}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Remove file"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={createContent.isPending || uploadFile.isPending || !fileUrl}
        >
          {createContent.isPending ? "Adding…" : `Add ${cellType.label}`}
        </Button>
      </div>
    </div>
  );
}
