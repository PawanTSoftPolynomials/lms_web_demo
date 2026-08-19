"use client";

import Input from "@/components/ui/Input";

export default function InteractiveBlockEdit({ block, onChange }) {
  return (
    <Input
      label="Embed (iframe) URL"
      value={block.url || ""}
      onChange={(e) => onChange({ url: e.target.value })}
      placeholder="https://…"
    />
  );
}
