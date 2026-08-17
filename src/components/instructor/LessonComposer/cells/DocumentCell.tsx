"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/context/ConfirmContext";
import { getDisplayUrl } from "@/lib/blob";
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

interface SlideItem {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
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

  // Parse initial slides if content.htmlContent or content.body contains JSON slides
  let parsedSlides: SlideItem[] = [];
  const slideJson = content.htmlContent || content.body || "";
  try {
    if (slideJson.trim().startsWith("[")) {
      parsedSlides = JSON.parse(slideJson);
    }
  } catch {
    parsedSlides = [];
  }

  const [presentationMode, setPresentationMode] = useState<"slideshow" | "upload">(
    parsedSlides.length > 0 ? "slideshow" : (content.fileUrl ? "upload" : "slideshow")
  );

  const [title, setTitle] = useState(content.title ?? "");
  const [fileUrl, setFileUrl] = useState(content.fileUrl ?? "");
  const [slides, setSlides] = useState<SlideItem[]>(
    parsedSlides.length > 0
      ? parsedSlides
      : [
          {
            id: "slide_1",
            title: "Slide 1: Presentation Overview",
            content: "### Welcome to the Presentation\n\n- Write **Markdown** formatted text directly here\n- Add bullet points, key takeaways, and code blocks\n- Optionally attach image URLs or video walkthrough links",
            mediaUrl: "",
          },
          {
            id: "slide_2",
            title: "Slide 2: Core Concepts & Principles",
            content: "### High-Performance LMS Slide Deck\n\n1. In-browser native presentation slide deck\n2. Zero 403 forbidden or external web viewer errors\n3. Responsive and instant loading across all devices",
            mediaUrl: "",
          },
        ]
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [tempSlide, setTempSlide] = useState<SlideItem>({ id: "", title: "", content: "", mediaUrl: "" });

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
    setEditingSlideIndex(null);
    setMode("edit");
  };

  const handleCancel = () => {
    setTitle(content.title ?? "");
    setFileUrl(content.fileUrl ?? "");
    setUploadError(null);
    setIsUploading(false);
    setEditingSlideIndex(null);
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
      const payload = presentationMode === "slideshow"
        ? { title: title || "Interactive Presentation", htmlContent: JSON.stringify(slides), fileUrl: "", lessonId: content.lessonId }
        : { title: title || "Uploaded File Presentation", fileUrl, htmlContent: "", lessonId: content.lessonId };

      await updateContent.mutateAsync({
        contentId: content.id,
        contentData: payload,
      });
      setMode("view");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save presentation."), "error", "Save failed");
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

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((_, i) => i !== index);
    setSlides(nextSlides);
    if (activeSlideIndex >= nextSlides.length) {
      setActiveSlideIndex(Math.max(0, nextSlides.length - 1));
    }
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const nextSlides = [...slides];
    const temp = nextSlides[index];
    nextSlides[index] = nextSlides[targetIndex];
    nextSlides[targetIndex] = temp;
    setSlides(nextSlides);
  };

  const displayUrl = getDisplayUrl(content.fileUrl ?? "");
  const cleanUrl = (content.fileUrl || "").split("?")[0].toLowerCase();
  const ext = cleanUrl.split(".").pop() || "doc";
  const isPdf = ext === "pdf";

  const currentSlide = slides[activeSlideIndex] || slides[0];

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
          {/* Top Presentation Option Selector Tabs */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1.5">
            <button
              type="button"
              onClick={() => setPresentationMode("slideshow")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                presentationMode === "slideshow"
                  ? "bg-orange-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Layers size={14} />
              <span>Interactive Markdown Slideshow</span>
            </button>

            <button
              type="button"
              onClick={() => setPresentationMode("upload")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                presentationMode === "upload"
                  ? "bg-orange-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Upload size={14} />
              <span>Upload File from System (.pptx, .pdf)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Block Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Core Slide deck"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-medium"
            />
          </div>

          {presentationMode === "slideshow" ? (
            /* Option 1: Reference Slides List Manager */
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Slides List Manager
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newSlide: SlideItem = {
                      id: `slide_${Date.now()}`,
                      title: `Slide ${slides.length + 1}: Overview`,
                      content: "Write markdown content here...",
                      mediaUrl: "",
                    };
                    const nextSlides = [...slides, newSlide];
                    setSlides(nextSlides);
                    setEditingSlideIndex(nextSlides.length - 1);
                    setTempSlide(newSlide);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition cursor-pointer shadow-sm"
                >
                  <Plus size={13} />
                  <span>+ New Slide</span>
                </button>
              </div>

              {/* Slide Pill Badges Row */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {slides.map((slide, sIdx) => (
                  <div
                    key={slide.id || sIdx}
                    className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-200 shadow-sm"
                  >
                    <span
                      className="cursor-pointer hover:text-cyan-400 transition"
                      onClick={() => {
                        setEditingSlideIndex(sIdx);
                        setTempSlide({ ...slides[sIdx] });
                      }}
                    >
                      {slide.title || `Slide ${sIdx + 1}`}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title="Slide Actions"
                        >
                          <Settings size={12} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => {
                          setEditingSlideIndex(sIdx);
                          setTempSlide({ ...slides[sIdx] });
                        }}>
                          <Pencil className="size-3.5" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        {slides.length > 1 && (
                          <DropdownMenuItem variant="destructive" onSelect={() => removeSlide(sIdx)}>
                            <Trash2 className="size-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        )}
                        {sIdx > 0 && (
                          <DropdownMenuItem onSelect={() => moveSlide(sIdx, -1)}>
                            <ArrowUp className="size-3.5" />
                            <span>Move Up</span>
                          </DropdownMenuItem>
                        )}
                        {sIdx < slides.length - 1 && (
                          <DropdownMenuItem onSelect={() => moveSlide(sIdx, 1)}>
                            <ArrowDown className="size-3.5" />
                            <span>Move Down</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Option 2: Upload File from System */
            <div className="space-y-4 pt-1 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  File URL
                </label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf or presentation.pptx"
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
                      <span>Choose Presentation / Document File (.pptx, .pdf)</span>
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
            </div>
          )}

          {/* Edit Slide Modal Dialog */}
          {editingSlideIndex !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-white">Edit Slide</h3>
                  <button
                    type="button"
                    onClick={() => setEditingSlideIndex(null)}
                    className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slide Title
                  </label>
                  <input
                    type="text"
                    value={tempSlide.title}
                    onChange={(e) => setTempSlide({ ...tempSlide, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-medium"
                    placeholder="Slide 2: Visual Elements"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Markdown Content (Markdown supported)
                  </label>
                  <textarea
                    value={tempSlide.content}
                    onChange={(e) => setTempSlide({ ...tempSlide, content: e.target.value })}
                    rows={5}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono leading-relaxed"
                    placeholder="You can display images, video embeds, or webpages directly alongside markdown text."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Media URL (Image / Video Embed / Website URL)
                  </label>
                  <input
                    type="text"
                    value={tempSlide.mediaUrl || ""}
                    onChange={(e) => setTempSlide({ ...tempSlide, mediaUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500 font-mono"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingSlideIndex(null)}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSlideIndex !== null) {
                        const nextSlides = [...slides];
                        nextSlides[editingSlideIndex] = { ...tempSlide };
                        setSlides(nextSlides);
                        setEditingSlideIndex(null);
                      }
                    }}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 text-xs font-black transition cursor-pointer shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
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
                isUploading ||
                (presentationMode === "upload" && !fileUrl)
              }
            >
              {updateContent.isPending ? "Saving…" : "Done"}
            </Button>
          </div>
        </div>
      ) : presentationMode === "slideshow" || slides.length > 0 ? (
        /* View Mode — Interactive In-Browser Presentation Deck */
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-4 shadow-inner">
          {/* Deck Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="rounded-md bg-orange-500/20 border border-orange-500/40 px-2 py-0.5 text-[10px] font-black uppercase text-orange-400">
                SLIDE DECK
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                {currentSlide?.title || "Presentation Slide"}
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-400 shrink-0">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>
          </div>

          {/* Slide Content Body */}
          <div className="min-h-[140px] flex flex-col justify-between py-1">
            <div className="prose prose-invert prose-xs max-w-none text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {currentSlide?.content}
            </div>

            {currentSlide?.mediaUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-black max-h-56 flex items-center justify-center">
                <img
                  src={getDisplayUrl(currentSlide.mediaUrl)}
                  alt="Slide media"
                  className="max-h-56 w-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Slide Deck Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
              disabled={activeSlideIndex === 0}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setActiveSlideIndex(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlideIndex === dotIdx ? "w-5 bg-orange-500" : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : content.fileUrl ? (
        /* View Mode — Uploaded Presentation Card */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black text-xs uppercase">
                {ext.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-200 truncate">
                  {content.title || `Presentation Document (${ext.toUpperCase()})`}
                </h5>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {content.fileUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                title="Open Presentation in new tab"
              >
                <ExternalLink size={13} />
                <span>Open File</span>
              </a>
              <a
                href={displayUrl}
                download
                className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition cursor-pointer"
                title="Download Presentation"
              >
                <Download size={13} />
                <span>Download</span>
              </a>
            </div>
          </div>

          {isPdf ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
              <iframe
                src={displayUrl}
                title={content.title || cellType.label}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black text-sm uppercase">
                {ext.toUpperCase()}
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-200">{content.title || `Presentation Slide Deck (${ext.toUpperCase()})`}</h5>
                <p className="text-xs text-slate-400 mt-1">Presentation file ready for viewing and downloading.</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Open Presentation</span>
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
        <p className="text-xs italic text-slate-500">No presentation set yet.</p>
      )}
    </CellShell>
  );
}

interface CreateFileFormProps extends CreateCellFormProps {
  cellType: CellTypeDefinition;
  accept?: string;
}

export function CreateFileForm({ lessonId, order, cellType, accept, onCreated, onCancel }: CreateFileFormProps) {
  const [presentationMode, setPresentationMode] = useState<"slideshow" | "upload">("slideshow");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [slides, setSlides] = useState<SlideItem[]>([
    {
      id: "slide_1",
      title: "Slide 1: Overview",
      content: "Write markdown content here...",
      mediaUrl: "",
    },
    {
      id: "slide_2",
      title: "Slide 2: Visual Elements",
      content: "You can display images, video embeds, or webpages directly alongside markdown text.",
      mediaUrl: "",
    },
  ]);

  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [tempSlide, setTempSlide] = useState<SlideItem>({ id: "", title: "", content: "", mediaUrl: "" });

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

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((_, i) => i !== index));
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const nextSlides = [...slides];
    const temp = nextSlides[index];
    nextSlides[index] = nextSlides[targetIndex];
    nextSlides[targetIndex] = temp;
    setSlides(nextSlides);
  };

  const handleCreate = async () => {
    if (!lessonId) {
      showToast("Please select or create a lesson in the left sidebar first.", "error", "Lesson Required");
      return;
    }
    try {
      const safeOrder = typeof order === "number" && !isNaN(order) && order > 0 ? order : 1;
      const payload = presentationMode === "slideshow"
        ? {
            lessonId,
            type: cellType.contentType,
            order: safeOrder,
            title: title || `${cellType.label} Slideshow`,
            htmlContent: JSON.stringify(slides),
            fileUrl: "",
          }
        : {
            lessonId,
            type: cellType.contentType,
            order: safeOrder,
            title: title || `${cellType.label} File`,
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
      {/* Top Presentation Option Selector Tabs */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1.5">
        <button
          type="button"
          onClick={() => setPresentationMode("slideshow")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
            presentationMode === "slideshow"
              ? "bg-orange-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Layers size={14} />
          <span>Interactive Markdown Slideshow</span>
        </button>

        <button
          type="button"
          onClick={() => setPresentationMode("upload")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
            presentationMode === "upload"
              ? "bg-orange-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Upload size={14} />
          <span>Upload File from System (.pptx, .pdf)</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Block Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Core Slide deck"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-medium"
        />
      </div>

      {presentationMode === "slideshow" ? (
        /* Option 1: Reference Slides List Manager */
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Slides List Manager
            </label>
            <button
              type="button"
              onClick={() => {
                const newSlide: SlideItem = {
                  id: `slide_${Date.now()}`,
                  title: `Slide ${slides.length + 1}: Overview`,
                  content: "Write markdown content here...",
                  mediaUrl: "",
                };
                const nextSlides = [...slides, newSlide];
                setSlides(nextSlides);
                setEditingSlideIndex(nextSlides.length - 1);
                setTempSlide(newSlide);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition cursor-pointer shadow-sm"
            >
              <Plus size={13} />
              <span>+ New Slide</span>
            </button>
          </div>

          {/* Slide Pill Badges Row */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {slides.map((slide, sIdx) => (
              <div
                key={slide.id || sIdx}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-200 shadow-sm"
              >
                <span
                  className="cursor-pointer hover:text-cyan-400 transition"
                  onClick={() => {
                    setEditingSlideIndex(sIdx);
                    setTempSlide({ ...slides[sIdx] });
                  }}
                >
                  {slide.title || `Slide ${sIdx + 1}`}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Slide Actions"
                    >
                      <Settings size={12} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => {
                      setEditingSlideIndex(sIdx);
                      setTempSlide({ ...slides[sIdx] });
                    }}>
                      <Pencil className="size-3.5" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {slides.length > 1 && (
                      <DropdownMenuItem variant="destructive" onSelect={() => removeSlide(sIdx)}>
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                    {sIdx > 0 && (
                      <DropdownMenuItem onSelect={() => moveSlide(sIdx, -1)}>
                        <ArrowUp className="size-3.5" />
                        <span>Move Up</span>
                      </DropdownMenuItem>
                    )}
                    {sIdx < slides.length - 1 && (
                      <DropdownMenuItem onSelect={() => moveSlide(sIdx, 1)}>
                        <ArrowDown className="size-3.5" />
                        <span>Move Down</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Option 2: Upload File from System */
        <div className="space-y-4 pt-1 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              File URL
            </label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/file.pdf or presentation.pptx"
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
                  <span>Choose Presentation / Document File (.pptx, .pdf)</span>
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
        </div>
      )}

      {/* Edit Slide Modal Dialog */}
      {editingSlideIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white">Edit Slide</h3>
              <button
                type="button"
                onClick={() => setEditingSlideIndex(null)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Slide Title
              </label>
              <input
                type="text"
                value={tempSlide.title}
                onChange={(e) => setTempSlide({ ...tempSlide, title: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-medium"
                placeholder="Slide 2: Visual Elements"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Markdown Content (Markdown supported)
              </label>
              <textarea
                value={tempSlide.content}
                onChange={(e) => setTempSlide({ ...tempSlide, content: e.target.value })}
                rows={5}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono leading-relaxed"
                placeholder="You can display images, video embeds, or webpages directly alongside markdown text."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Media URL (Image / Video Embed / Website URL)
              </label>
              <input
                type="text"
                value={tempSlide.mediaUrl || ""}
                onChange={(e) => setTempSlide({ ...tempSlide, mediaUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500 font-mono"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSlideIndex(null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingSlideIndex !== null) {
                    const nextSlides = [...slides];
                    nextSlides[editingSlideIndex] = { ...tempSlide };
                    setSlides(nextSlides);
                    setEditingSlideIndex(null);
                  }
                }}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 text-xs font-black transition cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={
            createContent.isPending ||
            isUploading ||
            (presentationMode === "upload" && !fileUrl)
          }
        >
          {createContent.isPending ? "Adding…" : `Done`}
        </Button>
      </div>
    </div>
  );
}
