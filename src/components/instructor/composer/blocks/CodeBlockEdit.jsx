"use client";

import Input from "@/components/ui/Input";

export default function CodeBlockEdit({ block, onChange }) {
  return (
    <div className="space-y-4">
      <Input
        label="Language (optional)"
        value={block.language || ""}
        onChange={(e) => onChange({ language: e.target.value })}
        placeholder="e.g. javascript"
      />
      <div className="space-y-2">
        <label className="text-sm text-slate-300">Code</label>
        <textarea
          value={block.code || ""}
          onChange={(e) => onChange({ code: e.target.value })}
          rows={10}
          placeholder="Paste code here…"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono outline-none focus:border-orange-500 resize-y"
        />
      </div>
    </div>
  );
}
