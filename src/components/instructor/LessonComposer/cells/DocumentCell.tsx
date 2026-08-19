"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Layers,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { getDisplayUrl } from "@/lib/blob";
import { uploadFileToVercelBlob } from "@/services/content.service";

import { useCreateContent, useUpdateContent, useDeleteContent } from "../contentMutations";
import { CellShell } from "../CellShell";
import { getErrorMessage } from "../getErrorMessage";
import { PresentationSlidesEditor, adaptLegacySlide, createDefaultSlideDeck, type SlideItemV2 } from "./PresentationSlidesEditor";
import { PresentationUploadPanel } from "./PresentationUploadPanel";
import { SlideColumnsView } from "./slideCanvas/SlideColumnsLayout";
import type { CellTypeDefinition } from "../cellTypes";
import type { CellActionProps, ContentRow, CreateCellFormProps } from "../types";

interface DocumentCellProps extends CellActionProps {
  content: ContentRow;
  cellType: CellTypeDefinition;
}

/** Parses the persisted slide JSON and upgrades any pre-canvas slides (old `{content, mediaUrl}` shape) into the current `{elements: []}` shape — see slideElementTypes.ts's adaptLegacySlide. */
function parseSlides(raw: string | null | undefined): SlideItemV2[] {
  const text = raw || "";
  try {
    if (text.trim().startsWith("[")) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map(adaptLegacySlide);
      }
    }
  } catch {
    // fall through
  }
  return [];
}

/** Plain "upload a file" fields — used by Document/PDF (which have no slideshow concept) and by Presentation's own Upload PPTX choice isn't this; that one uses PresentationUploadPanel instead. This is the generic, non-presentation file upload. */
function PlainFileUploadFields({
  fileUrl,
  onFileUrlChange,
  accept,
}: {
  fileUrl: string;
  onFileUrlChange: (url: string) => void;
  accept?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      showToast(`Uploading ${file.name}...`, "info");
      const result = await uploadFileToVercelBlob(file);
      if (result?.url) {
        onFileUrlChange(result.url);
        showToast("File uploaded successfully", "success");
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

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">File URL</label>
        <input
          type="text"
          value={fileUrl}
          onChange={(e) => onFileUrlChange(e.target.value)}
          placeholder="https://example.com/file.pdf"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
        />
      </div>

      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <span className="relative bg-card px-2 text-[10px] font-bold text-muted-foreground uppercase">OR</span>
      </div>

      <div>
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
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
            onClick={() => onFileUrlChange("")}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            title="Remove file URL"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/** The two-way "how do you want to create it" tabs — Presentation only. Document/PDF have no slideshow concept, so they never render this. */
function PresentationModeTabs({
  presentationMode,
  onChange,
}: {
  presentationMode: "slideshow" | "upload";
  onChange: (mode: "slideshow" | "upload") => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1.5">
      <button
        type="button"
        onClick={() => onChange("slideshow")}
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
          presentationMode === "slideshow"
            ? "bg-orange-500 text-slate-950 shadow-md"
            : "text-slate-400 hover:text-white hover:bg-slate-900"
        }`}
      >
        <Layers size={14} />
        <span>Create Slides</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("upload")}
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
          presentationMode === "upload"
            ? "bg-orange-500 text-slate-950 shadow-md"
            : "text-slate-400 hover:text-white hover:bg-slate-900"
        }`}
      >
        <Upload size={14} />
        <span>Upload PPTX</span>
      </button>
    </div>
  );
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
  const isPresentation = cellType.id === "presentation";
  const [mode, setMode] = useState<"view" | "edit">("view");

  const parsedSlides = parseSlides(content.htmlContent || content.body);

  const [presentationMode, setPresentationMode] = useState<"slideshow" | "upload">(
    parsedSlides.length > 0 ? "slideshow" : content.fileUrl ? "upload" : "slideshow"
  );

  const [title, setTitle] = useState(content.title ?? "");
  const [fileUrl, setFileUrl] = useState(content.fileUrl ?? "");
  const [slides, setSlides] = useState<SlideItemV2[]>(parsedSlides.length > 0 ? parsedSlides : createDefaultSlideDeck());
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const handleEdit = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setMode("edit");
  };

  const handleCancel = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setMode("view");
  };

  const handleSave = async () => {
    const useSlideshow = isPresentation && presentationMode === "slideshow";
    try {
      const payload = useSlideshow
        ? { title: title || "Presentation", htmlContent: JSON.stringify(slides), fileUrl: "", topicId: content.topicId }
        : { title: title || cellType.label, fileUrl, htmlContent: "", topicId: content.topicId };

      await updateContent.mutateAsync({ contentId: content.id, contentData: payload });
      setMode("view");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save."), "error", "Save failed");
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
      await deleteContent.mutateAsync({ contentId: content.id, topicId: content.topicId });
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete this file."), "error", "Delete failed");
    }
  };

  const displayUrl = getDisplayUrl(content.fileUrl ?? "");
  const cleanUrl = (content.fileUrl || "").split("?")[0].toLowerCase();
  const ext = cleanUrl.split(".").pop() || "doc";
  const isPdf = ext === "pdf";
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const showSlideDeck = isPresentation && (presentationMode === "slideshow" || parsedSlides.length > 0);

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
          {isPresentation && (
            <PresentationModeTabs presentationMode={presentationMode} onChange={setPresentationMode} />
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {cellType.label} Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${cellType.label} title`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-medium"
            />
          </div>

          {isPresentation && presentationMode === "slideshow" ? (
            <PresentationSlidesEditor slides={slides} onChange={setSlides} />
          ) : isPresentation ? (
            <PresentationUploadPanel fileUrl={fileUrl} onFileUrlChange={setFileUrl} />
          ) : (
            <PlainFileUploadFields fileUrl={fileUrl} onFileUrlChange={setFileUrl} />
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={
                updateContent.isPending ||
                (!(isPresentation && presentationMode === "slideshow") && !fileUrl)
              }
            >
              {updateContent.isPending ? "Saving…" : "Done"}
            </Button>
          </div>
        </div>
      ) : showSlideDeck ? (
        <div className="space-y-2">
          {currentSlide && (
            <SlideColumnsView
              title={currentSlide.title}
              columns={currentSlide.columns}
              backgroundColor={currentSlide.backgroundColor}
            />
          )}

          {slides.length > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                disabled={activeSlideIndex === 0}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer shrink-0"
                aria-label="Previous slide"
              >
                <ChevronLeft size={13} />
              </button>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">
                  {activeSlideIndex + 1} / {slides.length}
                </span>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveSlideIndex(dotIdx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                        activeSlideIndex === dotIdx ? "w-4 bg-orange-500" : "w-1.5 bg-slate-700 hover:bg-slate-500"
                      }`}
                      title={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                disabled={activeSlideIndex === slides.length - 1}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer shrink-0"
                aria-label="Next slide"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      ) : content.fileUrl ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black text-xs uppercase">
                {ext.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-200 truncate">
                  {content.title || `${cellType.label} (${ext.toUpperCase()})`}
                </h5>
                <p className="text-[10px] text-slate-400 font-mono truncate">{content.fileUrl}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                title={`Open ${cellType.label} in new tab`}
              >
                <ExternalLink size={13} />
                <span>Open File</span>
              </a>
              <a
                href={displayUrl}
                download
                className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition cursor-pointer"
                title={`Download ${cellType.label}`}
              >
                <Download size={13} />
                <span>Download</span>
              </a>
            </div>
          </div>

          {isPdf ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
              <iframe src={displayUrl} title={content.title || cellType.label} className="absolute inset-0 h-full w-full" allowFullScreen />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black text-sm uppercase">
                {ext.toUpperCase()}
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-200">{content.title || `${cellType.label} (${ext.toUpperCase()})`}</h5>
                <p className="text-xs text-slate-400 mt-1">File ready for viewing and downloading.</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Open</span>
                </a>
                <a
                  href={displayUrl}
                  download
                  className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download ({ext.toUpperCase()})</span>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs italic text-slate-500">
          No {cellType.label.toLowerCase()} set yet.
        </p>
      )}
    </CellShell>
  );
}

interface CreateFileFormProps extends CreateCellFormProps {
  cellType: CellTypeDefinition;
  accept?: string;
  /** For Presentation only — which workflow the instructor already chose in the Add Content modal's "Add Presentation" step. Ignored for Document/PDF, which are always a plain file upload. */
  presentationMode?: "slideshow" | "upload";
}

export function CreateFileForm({ topicId, order, cellType, accept, presentationMode = "upload", onCreated, onCancel }: CreateFileFormProps) {
  const isPresentation = cellType.id === "presentation";
  const useSlideshow = isPresentation && presentationMode === "slideshow";

  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [slides, setSlides] = useState<SlideItemV2[]>(createDefaultSlideDeck());

  const createContent = useCreateContent();
  const { showToast } = useToast();

  const handleCreate = async () => {
    if (!topicId) {
      showToast("Please select or create a topic in the left sidebar first.", "error", "Topic Required");
      return;
    }
    try {
      const safeOrder = typeof order === "number" && !isNaN(order) && order > 0 ? order : 1;
      const payload = useSlideshow
        ? {
            topicId,
            type: cellType.contentType,
            order: safeOrder,
            title: title || "Presentation",
            htmlContent: JSON.stringify(slides),
            fileUrl: "",
          }
        : {
            topicId,
            type: cellType.contentType,
            order: safeOrder,
            title: title || cellType.label,
            fileUrl,
            htmlContent: "",
          };

      await createContent.mutateAsync(payload);
      onCreated();
    } catch (error) {
      showToast(getErrorMessage(error, `Failed to add this ${cellType.label.toLowerCase()}.`), "error", "Add failed");
    }
  };

  return (
    <div className="space-y-4 pt-1">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">{cellType.label} Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${cellType.label} title`}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-medium"
        />
      </div>

      {useSlideshow ? (
        <PresentationSlidesEditor slides={slides} onChange={setSlides} />
      ) : isPresentation ? (
        <PresentationUploadPanel fileUrl={fileUrl} onFileUrlChange={setFileUrl} />
      ) : (
        <PlainFileUploadFields fileUrl={fileUrl} onFileUrlChange={setFileUrl} accept={accept} />
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={createContent.isPending || (!useSlideshow && !fileUrl)}
        >
          {createContent.isPending ? "Adding…" : "Done"}
        </Button>
      </div>
    </div>
  );
}
