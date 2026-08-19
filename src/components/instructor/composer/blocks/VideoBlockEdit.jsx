"use client";

import UrlOrUploadField from "@/components/instructor/composer/UrlOrUploadField";
import MarkdownField from "@/components/instructor/composer/MarkdownField";

export default function VideoBlockEdit({ block, onChange }) {
  return (
    <div className="space-y-4">
      <UrlOrUploadField
        label="Video (upload a file, or paste a YouTube/Vimeo/direct link)"
        value={block.url}
        onChange={(url) => onChange({ url })}
        accept="video/*"
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
