"use client";

import MarkdownField from "@/components/instructor/composer/MarkdownField";

export default function TextBlockEdit({ block, onChange }) {
  return (
    <MarkdownField
      label="Markdown content"
      value={block.markdown}
      onChange={(markdown) => onChange({ markdown })}
      rows={6}
      placeholder="Write the lesson text in markdown…"
    />
  );
}
