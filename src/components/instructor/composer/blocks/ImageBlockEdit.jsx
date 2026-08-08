"use client";

import UrlOrUploadField from "@/components/instructor/composer/UrlOrUploadField";
import MarkdownField from "@/components/instructor/composer/MarkdownField";

export default function ImageBlockEdit({ block, onChange }) {
  return (
    <div className="space-y-4">
      <UrlOrUploadField
        label="Image"
        value={block.url}
        onChange={(url) => onChange({ url })}
        accept="image/*"
      />
      <MarkdownField
        label="Caption (optional)"
        value={block.caption}
        onChange={(caption) => onChange({ caption })}
        rows={3}
        placeholder="Optional caption in markdown…"
      />
    </div>
  );
}
