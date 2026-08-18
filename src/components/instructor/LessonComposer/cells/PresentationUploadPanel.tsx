"use client";

import { useRef, useState, type DragEvent } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";
import { uploadFileToVercelBlob } from "@/services/content.service";
import { getErrorMessage } from "../getErrorMessage";

interface PresentationUploadPanelProps {
  fileUrl: string;
  onFileUrlChange: (url: string) => void;
}

/**
 * PPTX upload via the project's existing Vercel Blob route (/api/upload,
 * see uploadFileToVercelBlob) — no new upload provider. There is no
 * server-side PPTX parsing/slide-extraction in this app today (no
 * Presentation/Slide backend model, no processing endpoint), so this
 * intentionally only shows real upload progress and a plain "uploaded"
 * confirmation — no fabricated "Extracting slides…" step or slide count.
 */
export function PresentationUploadPanel({ fileUrl, onFileUrlChange }: PresentationUploadPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const doUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    setFileName(file.name);
    try {
      const result = await uploadFileToVercelBlob(file);
      if (result?.url) {
        onFileUrlChange(result.url);
        showToast("Presentation uploaded", "success");
      } else {
        throw new Error("Invalid response from upload service");
      }
    } catch (error) {
      setUploadError(getErrorMessage(error, "Upload failed. Please try again."));
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };

  if (fileUrl && !isUploading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-xs text-foreground">
        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
        <span className="truncate flex-1 font-medium">{fileName || "Presentation uploaded"}</span>
        <button
          type="button"
          onClick={() => {
            onFileUrlChange("");
            setFileName(null);
          }}
          className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          title="Remove file"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
          isDragging ? "border-orange-500 bg-orange-500/5" : "border-slate-800 hover:border-orange-500/50 bg-slate-950/40"
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".pptx" onChange={handleFileChange} className="hidden" />
        {isUploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-orange-400" />
            <p className="text-xs font-bold text-slate-300">Uploading {fileName}…</p>
          </>
        ) : (
          <>
            <Upload className="size-6 text-slate-500" />
            <p className="text-xs font-bold text-slate-300">Drag &amp; drop your PPTX file</p>
            <p className="text-[11px] text-slate-500">or click to browse — Supported: .pptx</p>
          </>
        )}
      </div>
      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
    </div>
  );
}
