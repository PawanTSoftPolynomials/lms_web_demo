"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Bold, Italic, Underline, List, Link2, Paperclip, X, Loader2 } from "lucide-react";

import { uploadAttachment } from "@/services/upload.service";

const TOOLBAR_ACTIONS = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { command: "insertUnorderedList", icon: List, label: "Bulleted list" },
];

/**
 * Lightweight contentEditable rich-text editor — deliberately not a heavy
 * third-party dependency, just a small formatting toolbar over
 * document.execCommand. Content is HTML, sanitized server-side by the
 * existing sanitizeContent utility (same one Content.htmlContent uses).
 * Exposes getHtml() via ref so the parent form can read the value on submit.
 */
const NotesEditor = forwardRef(function NotesEditor(
  { initialHtml = "", attachments = [], onAttachmentsChange },
  ref
) {
  const editorRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useImperativeHandle(ref, () => ({
    getHtml: () => editorRef.current?.innerHTML || "",
  }));

  const exec = (command) => {
    document.execCommand(command);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = window.prompt("Link URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      editorRef.current?.focus();
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadAttachment(file)));
      onAttachmentsChange([
        ...attachments,
        ...uploaded.map((f) => ({ url: f.fileUrl, name: f.fileName, type: f.type })),
      ]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (index) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-border bg-[#05070E] overflow-hidden">
      <div className="flex items-center gap-1 px-2.5 py-2 border-b border-border bg-white/[0.01]">
        {TOOLBAR_ACTIONS.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            title={label}
            onClick={() => exec(command)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Icon size={13} />
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          onClick={insertLink}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <Link2 size={13} />
        </button>
        <div className="w-px h-4 bg-muted mx-1" />
        <label
          title="Attach file"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
          <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialHtml }}
        className="min-h-[160px] px-4 py-3 text-sm text-foreground outline-none [&_a]:text-primary [&_a]:underline"
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {attachments.map((att, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-transparent text-[10.5px] text-foreground">
              {att.name}
              <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-red-400">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

export default NotesEditor;
