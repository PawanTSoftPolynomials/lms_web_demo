"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";

export default function ChartBlockEdit({ block, onChange }) {
  const rows = block.rows || [];

  const updateRow = (index, patch) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange({ rows: next });
  };

  const removeRow = (index) => {
    onChange({ rows: rows.filter((_, i) => i !== index) });
  };

  const addRow = () => {
    onChange({ rows: [...rows, { label: `Item ${rows.length + 1}`, value: 50 }] });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-foreground">Chart rows (label + value 0-100)</label>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={row.label}
            onChange={(e) => updateRow(i, { label: e.target.value })}
            placeholder="Label"
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={row.value}
            onChange={(e) => updateRow(i, { value: Number(e.target.value) })}
            className="w-24"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground hover:text-foreground bg-muted hover:bg-slate-750 border border-transparent/60 rounded-lg transition"
      >
        <Plus size={12} /> Add Row
      </button>
    </div>
  );
}
