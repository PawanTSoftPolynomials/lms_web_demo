"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Pencil, Check, X } from "lucide-react";
import { blockRegistry, BLOCK_TYPE_ORDER } from "@/components/instructor/composer/blocks/blockRegistry";

/**
 * Local-state-only block editor for the import preview tree — same
 * view/edit shape as the Composer's ContentBlockCard, but nothing is
 * persisted until the whole job is saved (PATCH .../jobs/:id).
 */
export default function PreviewBlockCard({ block, isFirst, isLast, onChange, onDelete, onMoveUp, onMoveDown }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(block);

  const entry = blockRegistry[block.blockType] || blockRegistry.unknown;
  const Icon = entry.icon;
  const ViewComponent = entry.ViewComponent;
  const EditComponent = entry.EditComponent;

  const patchDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    onChange(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(block);
    setIsEditing(false);
  };

  const handleTypeChange = (newType) => {
    const nextData = blockRegistry[newType].defaultData();
    const merged = { ...nextData, title: draft.title, attributes: draft.attributes };
    setDraft(merged);
    onChange(merged);
  };

  return (
    <div className={`rounded-xl border bg-slate-900/50 p-3 ${isEditing ? "border-orange-600/60" : "border-slate-800"}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className="text-orange-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">{draft.title || entry.label}</span>
          {block.blockType === "unknown" && (
            <select
              value={block.blockType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300"
            >
              <option value="unknown">Unmapped</option>
              {BLOCK_TYPE_ORDER.map((t) => (
                <option key={t} value={t}>Reclassify as {blockRegistry[t].label}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" disabled={isFirst} onClick={onMoveUp} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
            <ArrowUp size={13} />
          </button>
          <button type="button" disabled={isLast} onClick={onMoveDown} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
            <ArrowDown size={13} />
          </button>
          {!isEditing && block.blockType !== "unknown" && (
            <button type="button" onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-white">
              <Pencil size={13} />
            </button>
          )}
          <button type="button" onClick={onDelete} className="p-1 text-slate-400 hover:text-rose-400">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <EditComponent block={draft} onChange={patchDraft} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancel} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg">
              <X size={11} /> Cancel
            </button>
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
              <Check size={11} /> Done
            </button>
          </div>
        </div>
      ) : (
        <ViewComponent block={draft} />
      )}
    </div>
  );
}
