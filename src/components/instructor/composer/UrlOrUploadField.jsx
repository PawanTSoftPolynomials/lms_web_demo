"use client";

import { useState } from "react";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import { uploadFileToBlob } from "@/services/blobUpload.service";
import { useToast } from "@/components/ui/ToastProvider";

/** Shared upload-or-paste-URL picker used by the image/video/audio/document block editors. */
export default function UrlOrUploadField({ label, value, onChange, accept }) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFileToBlob(file);
      onChange(result.url);
    } catch (error) {
      toast?.showToast(error?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-foreground">{label}</label>}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 rounded-lg border border-transparent bg-muted px-3 py-2">
          <LinkIcon size={14} className="text-muted-foreground shrink-0" />
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste a URL…"
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground hover:text-foreground bg-muted hover:bg-slate-750 border border-transparent/60 rounded-lg cursor-pointer transition shrink-0">
          <UploadCloud size={14} />
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
    </div>
  );
}
