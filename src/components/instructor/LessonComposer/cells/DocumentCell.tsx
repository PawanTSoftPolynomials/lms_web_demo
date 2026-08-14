"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Download, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { uploadFileToVercelBlob } from "@/services/content.service";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const handleEdit = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setUploadError(null);
    setIsUploading(false);
    setMode("edit");
  };

  const handleCancel = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setUploadError(null);
    setIsUploading(false);
    setMode("view");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      showToast(`Uploading ${file.name} to Vercel Blob...`, "info");
      const result = await uploadFileToVercelBlob(file);
      if (result && result.url) {
        setFileUrl(result.url);
        showToast("File uploaded to Vercel Blob successfully!", "success");
      } else {
        throw new Error("Invalid response from upload service");
      }
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
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
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {cellType.label} Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${cellType.label} title`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              File URL
            </label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/file.pdf"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
            />
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-2 text-[10px] font-bold text-muted-foreground uppercase">
              OR
            </span>
          </div>

          {/* Automatic Local File Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 px-3.5 py-2 text-xs font-bold text-primary transition cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  <span>Choose File</span>
                </>
              )}
            </button>
          </div>

          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

          {fileUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-foreground">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span className="truncate flex-1 font-mono">{fileUrl}</span>
              <button
                type="button"
                onClick={() => setFileUrl("")}
                className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove file URL"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateContent.isPending || isUploading || !fileUrl}
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
        <p className="text-sm italic text-muted-foreground">No file set yet.</p>
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createContent = useCreateContent();
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      showToast(`Uploading ${file.name} to Vercel Blob...`, "info");
      const result = await uploadFileToVercelBlob(file);
      if (result && result.url) {
        setFileUrl(result.url);
        showToast("File uploaded to Vercel Blob successfully!", "success");
      } else {
        throw new Error("Invalid response from upload service");
      }
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!lessonId) {
      showToast("Please select or create a lesson in the left sidebar first.", "error", "Lesson Required");
      return;
    }
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
    <div className="space-y-4 pt-1">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {cellType.label} Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${cellType.label} title`}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          File URL
        </label>
        <input
          type="text"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://example.com/file.pdf"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
        />
      </div>

      {/* OR Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <span className="relative bg-background px-2 text-[10px] font-bold text-muted-foreground uppercase">
          OR
        </span>
      </div>

      {/* Automatic Local File Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 px-3.5 py-2 text-xs font-bold text-primary transition cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="size-4" />
              <span>Choose File</span>
            </>
          )}
        </button>
      </div>

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

      {fileUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-foreground">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span className="truncate flex-1 font-mono">{fileUrl}</span>
          <button
            type="button"
            onClick={() => setFileUrl("")}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Remove file URL"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={createContent.isPending || isUploading || !fileUrl}
        >
          {createContent.isPending ? "Adding…" : `Add ${cellType.label}`}
        </Button>
      </div>
    </div>
  );
}
