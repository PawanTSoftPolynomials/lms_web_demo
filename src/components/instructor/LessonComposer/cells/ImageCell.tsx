"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { useUploadContentFile } from "@/hooks/queries/instructor/useUploadContentFile";

import { useCreateContent, useUpdateContent, useDeleteContent } from "../contentMutations";
import { CellShell } from "../CellShell";
import { CELL_TYPES } from "../cellTypes";
import { getErrorMessage } from "../getErrorMessage";
import { IMAGE_MARKER_CLASS } from "../htmlCellVariant";
import type { CellActionProps, ContentRow, CreateCellFormProps } from "../types";

const CELL_TYPE = CELL_TYPES.find((c) => c.id === "image")!;

interface ParsedImage {
  src: string;
  alt: string;
  caption: string;
}

function parseImageHtml(htmlContent: string | null | undefined): ParsedImage {
  if (!htmlContent || typeof window === "undefined") return { src: "", alt: "", caption: "" };
  const root = new DOMParser().parseFromString(htmlContent, "text/html").body.firstElementChild;
  const img = root?.querySelector("img");
  const figcaption = root?.querySelector("figcaption");
  return {
    src: img?.getAttribute("src") ?? "",
    alt: img?.getAttribute("alt") ?? "",
    caption: figcaption?.textContent ?? "",
  };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Exported so the "Add Cell" create form can build the same marked-up shape. */
export function buildImageHtml({ src, alt, caption }: ParsedImage): string {
  const figcaption = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
  return `<figure class="${IMAGE_MARKER_CLASS}"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${figcaption}</figure>`;
}

interface ImageCellProps extends CellActionProps {
  content: ContentRow;
}

/** Renders/edits an Image cell — persisted as `type: "HTML"` (see htmlCellVariant.ts). */
export function ImageCell({ content, onDuplicate, isDuplicating }: ImageCellProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const parsed = () => parseImageHtml(content.htmlContent);
  const [src, setSrc] = useState(() => parsed().src);
  const [alt, setAlt] = useState(() => parsed().alt);
  const [caption, setCaption] = useState(() => parsed().caption);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const uploadFile = useUploadContentFile();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const resetFields = () => {
    const p = parseImageHtml(content.htmlContent);
    setSrc(p.src);
    setAlt(p.alt);
    setCaption(p.caption);
    setUploadError(null);
  };

  const handleEdit = () => {
    resetFields();
    setMode("edit");
  };

  const handleCancel = () => {
    resetFields();
    setMode("view");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const result = await uploadFile.mutateAsync(file);
      setSrc(result.fileUrl);
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync({
        contentId: content.id,
        contentData: {
          title: alt || content.title || "Image",
          htmlContent: buildImageHtml({ src, alt, caption }),
          lessonId: content.lessonId,
        },
      });
      setMode("view");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save this image."), "error", "Save failed");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete image",
      message: "This will permanently remove this content from the lesson.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteContent.mutateAsync({ contentId: content.id, lessonId: content.lessonId });
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete this image."), "error", "Delete failed");
    }
  };

  const view = parseImageHtml(content.htmlContent);

  return (
    <CellShell
      icon={CELL_TYPE.icon}
      typeLabel={CELL_TYPE.label}
      title={content.title || "Untitled image"}
      mode={mode}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isDeleting={deleteContent.isPending}
      onDuplicate={onDuplicate}
      isDuplicating={isDuplicating}
    >
      {mode === "edit" ? (
        <div className="space-y-3">
          {!src && !uploadFile.isPending && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-primary/60"
            >
              <Upload className="size-6 text-primary" />
              <p className="text-xs font-semibold text-foreground">Click to choose an image from your device</p>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {uploadFile.isPending && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </div>
          )}

          {src && !uploadFile.isPending && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <p className="flex-1 truncate text-xs text-foreground">{src.split("/").pop()}</p>
                <button
                  type="button"
                  onClick={() => setSrc("")}
                  className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/external URL, not a static asset */}
              <img src={src} alt={alt} className="max-h-48 rounded-xl border border-card-border object-cover" />
            </div>
          )}

          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (for accessibility)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateContent.isPending || uploadFile.isPending || !src}
            >
              {updateContent.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : view.src ? (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/external URL, not a static asset */}
          <img
            src={view.src}
            alt={view.alt}
            className="w-full rounded-xl border border-card-border object-cover"
          />
          {view.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">{view.caption}</figcaption>
          )}
        </figure>
      ) : (
        <p className="text-sm italic text-muted-foreground">No image uploaded yet.</p>
      )}
    </CellShell>
  );
}

/** The "Add Cell" creation form for an Image block — hosted inside AddCellModal. */
export function CreateImageForm({ lessonId, order, onCreated, onCancel }: CreateCellFormProps) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
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
      setSrc(result.fileUrl);
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    try {
      await createContent.mutateAsync({
        lessonId,
        type: "HTML",
        order,
        title: alt || "Image",
        htmlContent: buildImageHtml({ src, alt, caption }),
      });
      onCreated();
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to add this image."), "error", "Add failed");
    }
  };

  return (
    <div className="space-y-3">
      {!src && !uploadFile.isPending && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-primary/60"
        >
          <Upload className="size-6 text-primary" />
          <p className="text-xs font-semibold text-foreground">Click to choose an image from your device</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {uploadFile.isPending && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Uploading…</p>
        </div>
      )}

      {src && !uploadFile.isPending && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <p className="flex-1 truncate text-xs text-foreground">{src.split("/").pop()}</p>
            <button
              type="button"
              onClick={() => setSrc("")}
              className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URL, not a static asset */}
          <img src={src} alt={alt} className="max-h-48 rounded-xl border border-card-border object-cover" />
        </div>
      )}

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Alt text (for accessibility)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={createContent.isPending || uploadFile.isPending || !src}
        >
          {createContent.isPending ? "Adding…" : "Add Image"}
        </Button>
      </div>
    </div>
  );
}
