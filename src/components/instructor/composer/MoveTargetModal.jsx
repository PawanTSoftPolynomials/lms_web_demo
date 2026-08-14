"use client";

import Modal from "@/components/ui/Modal";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";

/**
 * "Move Inside" target picker — lists top-level Text blocks (the only
 * container type wired onto the relational parentContentId model in this
 * phase; Slideshow keeps its own separate free-drag nesting mechanism for
 * now) other than the block being moved.
 */
export default function MoveTargetModal({ open, onClose, onPick, allLessonContents, excludeId }) {
  const targets = (allLessonContents || []).filter(
    (c) => c.blockType === "text" && !c.parentContentId && c.id !== excludeId,
  );

  return (
    <Modal open={open} onClose={onClose} title="Move Inside" size="sm">
      {targets.length === 0 ? (
        <p className="text-sm text-slate-500">
          No eligible Text blocks yet — add one at the top level first, then move this block inside it.
        </p>
      ) : (
        <div className="space-y-2">
          {targets.map((target) => {
            const entry = blockRegistry[target.blockType];
            const Icon = entry.icon;
            return (
              <button
                key={target.id}
                type="button"
                onClick={() => onPick(target.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/40 hover:border-orange-500 hover:bg-orange-950/10 transition text-left"
              >
                <Icon size={14} className="text-orange-400 shrink-0" />
                <span className="text-sm text-slate-200 truncate">
                  {target.title || entry.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
