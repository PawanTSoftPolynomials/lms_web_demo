"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";

/**
 * Edits the content fields of a single nested child block (title, url,
 * markdown, etc. — whatever its registered EditComponent renders). Position,
 * size and crop are handled separately by ChildBlockBox's drag/resize/crop
 * controls, not here.
 */
export default function NestedChildEditModal({ open, onClose, child, onSave }) {
  const [draft, setDraft] = useState(child);

  useEffect(() => {
    if (open) setDraft(child);
  }, [open, child?.id]);

  if (!child) return null;

  const entry = blockRegistry[child.blockType];
  const EditComponent = entry.EditComponent;
  const patch = (p) => setDraft((prev) => ({ ...prev, ...p }));

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${entry.label} (nested)`} size="md">
      <div className="space-y-4">
        <input
          value={draft.title || ""}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={`${entry.label} title (optional)`}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />

        <EditComponent block={draft} onChange={patch} />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
