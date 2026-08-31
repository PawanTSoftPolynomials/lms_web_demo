"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { FULL_CROP, clampPercent } from "./nestedBlockUtils";

const MIN_SIZE = 6;

/**
 * Simple rectangular crop tool: drag to move the crop box, drag the corner
 * handle to resize it, both expressed as percent of the media's natural
 * box. No canvas processing — the stored {x,y,w,h} percent rectangle is
 * applied at render time via CSS (see getCroppedMediaStyle).
 */
export default function MediaCropTool({ open, onClose, child, onApply }) {
  const [crop, setCrop] = useState(child?.crop || FULL_CROP);
  const containerRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (open) setCrop(child?.crop || FULL_CROP);
  }, [open, child?.id]);

  useEffect(() => {
    const onMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dxPct = ((e.clientX - drag.startX) / drag.rect.width) * 100;
      const dyPct = ((e.clientY - drag.startY) / drag.rect.height) * 100;

      if (drag.mode === "move") {
        const x = clampPercent(Math.min(100 - drag.orig.w, Math.max(0, drag.orig.x + dxPct)));
        const y = clampPercent(Math.min(100 - drag.orig.h, Math.max(0, drag.orig.y + dyPct)));
        setCrop((prev) => ({ ...prev, x, y }));
      } else {
        const w = Math.min(100 - drag.orig.x, Math.max(MIN_SIZE, drag.orig.w + dxPct));
        const h = Math.min(100 - drag.orig.y, Math.max(MIN_SIZE, drag.orig.h + dyPct));
        setCrop((prev) => ({ ...prev, w, h }));
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  if (!child) return null;

  const beginDrag = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = { mode, rect, startX: e.clientX, startY: e.clientY, orig: crop };
  };

  return (
    <Modal open={open} onClose={onClose} title="Crop" size="md">
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Drag the box to move it, drag the corner to resize the visible area.
        </p>
        <div
          ref={containerRef}
          className="relative w-full aspect-video rounded-lg overflow-hidden border border-transparent bg-black select-none"
        >
          {child.blockType === "video" ? (
            <video src={child.url} className="absolute inset-0 w-full h-full object-contain" muted />
          ) : (
            <img src={child.url} alt="" className="absolute inset-0 w-full h-full object-contain" />
          )}

          <div
            onPointerDown={(e) => beginDrag(e, "move")}
            className="absolute border-2 border-primary bg-primary/10 cursor-move"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`,
            }}
          >
            <div
              onPointerDown={(e) => beginDrag(e, "resize")}
              className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 rounded-sm bg-primary border border-white cursor-se-resize"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-foreground hover:text-foreground bg-muted hover:bg-slate-750 border border-transparent/60 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(crop);
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-bold text-foreground bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </Modal>
  );
}
