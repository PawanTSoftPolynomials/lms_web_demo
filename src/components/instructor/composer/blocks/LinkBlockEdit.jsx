"use client";

import Input from "@/components/ui/Input";

export default function LinkBlockEdit({ block, onChange }) {
  return (
    <div className="space-y-4">
      <Input
        label="Link title"
        value={block.title || ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="e.g. Official Documentation"
      />
      <Input
        label="URL"
        value={block.url || ""}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="https://…"
      />
    </div>
  );
}
