"use client";

import { useEffect, useRef, useState } from "react";
import { Move, Pencil, Crop as CropIcon, Trash2, UploadCloud } from "lucide-react";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";
import { uploadFileToBlob } from "@/services/blobUpload.service";
import { useToast } from "@/components/ui/ToastProvider";
import { CROPPABLE_TYPES, MEDIA_URL_TYPES, clampPercent, getCroppedMediaStyle } from "./nestedBlockUtils";

const MIN_SIZE_PCT = 8;

/** Inline paste-URL/upload field shown directly on the overlay box until a media child has a URL — no modal detour needed. */
function InlineMediaUrlEntry({ child, onUrlChange }) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFileToBlob(file);
      onUrlChange(result.url);
    } catch (error) {
      toast?.showToast(error?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 bg-background/80 rounded overflow-auto"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-[10px] text-muted-foreground">
        {child.blockType === "video" ? "Video" : child.blockType === "audio" ? "Audio" : "Image"} URL
      </p>
      <input
        type="text"
        value={child.url || ""}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste a URL…"
        className="w-[92%] rounded border border-transparent bg-muted px-1.5 py-1 text-[10px] outline-none focus:border-primary"
      />
      <label className="inline-flex items-center gap-1 px-1.5 py-1 text-[10px] font-bold text-foreground hover:text-foreground bg-muted hover:bg-slate-750 border border-transparent/60 rounded cursor-pointer">
        <UploadCloud size={10} />
        {uploading ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept={`${child.blockType === "video" ? "video" : child.blockType === "audio" ? "audio" : "image"}/*`}
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}

function ChildPreview({ child, onUrlChange }) {
  if (MEDIA_URL_TYPES.has(child.blockType)) {
    if (!child.url) {
      return <InlineMediaUrlEntry child={child} onUrlChange={onUrlChange} />;
    }

    if (CROPPABLE_TYPES.has(child.blockType)) {
      const { wrapper, inner } = getCroppedMediaStyle(child.crop);
      return (
        <div style={wrapper}>
          {child.blockType === "video" ? (
            <video src={child.url} style={inner} muted loop playsInline />
          ) : (
            <img src={child.url} alt={child.title || ""} style={inner} />
          )}
        </div>
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center p-2 bg-background/70 rounded">
        <audio controls src={child.url} className="w-full" />
      </div>
    );
  }

  const entry = blockRegistry[child.blockType];
  const ViewComponent = entry.ViewComponent;
  return (
    <div className="absolute inset-0 overflow-auto p-1.5 text-[11px] bg-background/70 rounded">
      <ViewComponent block={child} />
    </div>
  );
}

/** A single drag-and-drop positioned/resized nested child block, rendered inside NestedBlockLayer's edit mode. */
export default function ChildBlockBox({ child, containerRef, onMove, onResize, onEdit, onCrop, onDelete, onUrlChange }) {
  const dragRef = useRef(null);
  const entry = blockRegistry[child.blockType];

  useEffect(() => {
    const onPointerMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dxPct = ((e.clientX - drag.startX) / drag.rect.width) * 100;
      const dyPct = ((e.clientY - drag.startY) / drag.rect.height) * 100;

      if (drag.mode === "move") {
        const x = clampPercent(Math.min(100 - drag.orig.w, Math.max(0, drag.orig.x + dxPct)));
        const y = clampPercent(Math.min(100 - drag.orig.h, Math.max(0, drag.orig.y + dyPct)));
        onMove({ x, y });
      } else {
        const w = Math.min(100 - drag.orig.x, Math.max(MIN_SIZE_PCT, drag.orig.w + dxPct));
        const h = Math.min(100 - drag.orig.y, Math.max(MIN_SIZE_PCT, drag.orig.h + dyPct));
        onResize({ w, h });
      }
    };
    const onPointerUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.position?.x, child.position?.y, child.size?.w, child.size?.h]);

  const beginDrag = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      mode,
      rect,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...child.position, ...child.size },
    };
  };

  const position = child.position || { x: 8, y: 8 };
  const size = child.size || { w: 36, h: 28 };

  return (
    <div
      className="group/child absolute pointer-events-auto rounded-md border-2 border-primary/70 bg-background/30 hover:border-orange-400 transition-colors"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size.w}%`,
        height: `${size.h}%`,
      }}
    >
      <ChildPreview child={child} onUrlChange={onUrlChange} />

      <div className="absolute -top-7 left-0 flex items-center gap-1 opacity-0 group-hover/child:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onPointerDown={(e) => beginDrag(e, "move")}
          title="Drag to reposition"
          className="p-1 rounded bg-background border border-transparent text-foreground hover:text-foreground cursor-move"
        >
          <Move size={11} />
        </button>
        <span className="px-1.5 py-1 rounded bg-background border border-transparent text-[10px] text-muted-foreground">
          {entry.label}
        </span>
        <button
          type="button"
          onClick={onEdit}
          title="Edit content"
          className="p-1 rounded bg-background border border-transparent text-foreground hover:text-foreground"
        >
          <Pencil size={11} />
        </button>
        {CROPPABLE_TYPES.has(child.blockType) && child.url && (
          <button
            type="button"
            onClick={onCrop}
            title="Crop"
            className="p-1 rounded bg-background border border-transparent text-foreground hover:text-foreground"
          >
            <CropIcon size={11} />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          className="p-1 rounded bg-background border border-transparent text-red-400 hover:text-red-300"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div
        onPointerDown={(e) => beginDrag(e, "resize")}
        title="Drag to resize"
        className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 rounded-sm bg-primary border border-white cursor-se-resize opacity-0 group-hover/child:opacity-100"
      />
    </div>
  );
}
