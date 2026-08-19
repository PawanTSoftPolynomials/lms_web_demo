"use client";

import Input from "@/components/ui/Input";
import UrlOrUploadField from "@/components/instructor/composer/UrlOrUploadField";

export default function DocumentBlockEdit({ block, onChange }) {
  return (
    <div className="space-y-4">
      <Input
        label="Document title"
        value={block.title || ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="e.g. Course Slides.pptx"
      />
      <UrlOrUploadField
        label="Document"
        value={block.url}
        onChange={(url) => onChange({ url })}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
      />
    </div>
  );
}
