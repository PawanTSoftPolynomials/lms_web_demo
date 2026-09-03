"use client";

import Modal from "@/components/ui/Modal";
import { blockRegistry, BLOCK_TYPE_ORDER } from "@/components/instructor/composer/blocks/blockRegistry";

export default function AddBlockModal({ open, onClose, onPick }) {
  return (
    <Modal open={open} onClose={onClose} title="Add Content Block" size="md">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BLOCK_TYPE_ORDER.map((type) => {
          const entry = blockRegistry[type];
          const Icon = entry.icon;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(type)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-background/40 hover:border-primary hover:bg-orange-950/10 transition"
            >
              <Icon size={22} className="text-primary" />
              <span className="text-xs font-bold text-foreground">{entry.label}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
