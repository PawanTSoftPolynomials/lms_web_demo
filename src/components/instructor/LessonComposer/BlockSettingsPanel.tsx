"use client";

import { useEffect, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronsRight,
  Settings2,
  Trash2,
  X,
} from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { cn } from "@/lib/utils";

import { useUpdateContent, useDeleteContent } from "./contentMutations";
import { getCellTypeForContent } from "./cellTypes";
import { getErrorMessage } from "./getErrorMessage";
import { buildHeadingHtml, parseHeadingDesign, type HeadingDesign, type TextAlign } from "./blockStyle";
import type { ContentRow } from "./types";

interface BlockSettingsPanelProps {
  lessonId: string;
  selectedCellId: string | null;
  onClose: () => void;
}

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "p"] as const;

const ALIGN_OPTIONS: { value: TextAlign; icon: typeof AlignLeft; label: string }[] = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];

function stripHtml(html: string | null | undefined): string {
  if (!html || typeof window === "undefined") return "";
  return new DOMParser().parseFromString(html, "text/html").body.textContent?.trim() ?? "";
}

function ContentSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-xs text-slate-300 break-words">{value}</p>
    </div>
  );
}

function ContentSummary({ content, cellTypeId }: { content: ContentRow; cellTypeId: string }) {
  switch (cellTypeId) {
    case "heading":
      return <ContentSummaryRow label="Text Content" value={parseHeadingDesign(content.htmlContent).text || "—"} />;
    case "text": {
      const preview = stripHtml(content.htmlContent);
      return <ContentSummaryRow label="Text Content" value={preview ? `${preview.slice(0, 160)}${preview.length > 160 ? "…" : ""}` : "—"} />;
    }
    case "image": {
      const src = content.htmlContent?.match(/<img[^>]*src="([^"]*)"/)?.[1];
      return (
        <div className="space-y-3">
          {src && (
            <img src={src} alt={content.title ?? ""} className="max-h-32 w-full rounded-lg border border-slate-800 object-cover" />
          )}
          <ContentSummaryRow label="Alt Text / Title" value={content.title || "—"} />
        </div>
      );
    }
    case "video":
      return <ContentSummaryRow label="Video URL" value={content.videoUrl || "—"} />;
    case "link":
      return <ContentSummaryRow label="URL" value={content.externalUrl || "—"} />;
    case "document":
    case "presentation":
      return <ContentSummaryRow label="File Attachment" value={content.fileUrl?.split("/").pop() || "—"} />;
    default:
      return <ContentSummaryRow label="Block Title" value={content.title || "—"} />;
  }
}

interface BlockDesignFormProps {
  content: ContentRow;
  onDeleteBlock?: () => void;
}

function BlockDesignForm({ content, onDeleteBlock }: BlockDesignFormProps) {
  const [design, setDesign] = useState<HeadingDesign>(() => parseHeadingDesign(content.htmlContent));
  const [textContent, setTextContent] = useState<string>(() => parseHeadingDesign(content.htmlContent).text || content.title || "");
  const [fontFamily, setFontFamily] = useState("Inter");
  const updateContent = useUpdateContent();
  const { showToast } = useToast();

  useEffect(() => {
    const parsed = parseHeadingDesign(content.htmlContent);
    setDesign(parsed);
    setTextContent(parsed.text || content.title || "");
  }, [content.id, content.htmlContent, content.title]);

  const handleSave = async () => {
    try {
      const updatedHtml = buildHeadingHtml({
        ...design,
        text: textContent,
      });
      await updateContent.mutateAsync({
        contentId: content.id,
        contentData: {
          htmlContent: updatedHtml,
          title: textContent,
          lessonId: content.lessonId,
        },
      });
      showToast("Block settings updated.", "success", "Saved");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save block settings."), "error", "Save failed");
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Content Textarea */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
          Text Content
        </label>
        <textarea
          rows={3}
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Enter block text..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-orange-500 transition resize-none"
        />
      </div>

      {/* HTML Tag */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
          HTML Tag
        </label>
        <select
          value={design.tag}
          onChange={(e) => setDesign((d) => ({ ...d, tag: e.target.value }))}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500 cursor-pointer"
        >
          {HEADING_TAGS.map((tag) => (
            <option key={tag} value={tag} className="bg-slate-900 text-white">
              {tag.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
          Text Alignment
        </label>
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              title={label}
              onClick={() => setDesign((d) => ({ ...d, align: value }))}
              className={cn(
                "flex flex-1 items-center justify-center rounded-lg py-1.5 transition cursor-pointer",
                design.align === value ? "bg-orange-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(design.color ?? "") ? design.color! : "#ffffff"}
            onChange={(e) => setDesign((d) => ({ ...d, color: e.target.value }))}
            className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-slate-800 bg-slate-950 p-0.5"
          />
          <input
            type="text"
            value={design.color ?? "#FFFFFF"}
            onChange={(e) => setDesign((d) => ({ ...d, color: e.target.value }))}
            placeholder="#FFFFFF"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Typography: Font Family & Font Size */}
      <div className="space-y-3 pt-1 border-t border-slate-800/60">
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
          Typography
        </p>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="Inter">Inter (System Default)</option>
            <option value="Roboto">Roboto</option>
            <option value="Outfit">Outfit</option>
            <option value="Monospace">Monospace</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
            Font Size (px)
          </label>
          <input
            type="number"
            min={10}
            max={96}
            value={design.fontSize ?? 32}
            onChange={(e) =>
              setDesign((d) => ({ ...d, fontSize: e.target.value ? Number(e.target.value) : undefined }))
            }
            placeholder="32"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Save Settings Action */}
      <button
        type="button"
        onClick={handleSave}
        disabled={updateContent.isPending}
        className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 px-4 py-2.5 text-xs font-black text-slate-950 transition shadow-md cursor-pointer"
      >
        {updateContent.isPending ? "Saving..." : "Save Block Settings"}
      </button>

      {/* Delete Block Action */}
      {onDeleteBlock && (
        <button
          type="button"
          onClick={onDeleteBlock}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 px-3 py-2 text-xs font-bold text-red-400 transition cursor-pointer"
        >
          <Trash2 size={13} />
          <span>Delete Block</span>
        </button>
      )}
    </div>
  );
}

export function BlockSettingsPanel({ lessonId, selectedCellId, onClose }: BlockSettingsPanelProps) {
  const { data: contents = [] } = useContents(lessonId);
  const deleteContentMutation = useDeleteContent();
  const { showToast } = useToast();

  const selected = contents.find((c: ContentRow) => c.id === selectedCellId) ?? contents[0] ?? null;
  const cellType = selected ? getCellTypeForContent(selected) : undefined;

  const [tab, setTab] = useState<"content" | "design">("content");

  useEffect(() => {
    setTab("content");
  }, [selectedCellId]);

  const handleDeleteBlock = async () => {
    if (!selected) return;
    if (!window.confirm("Are you sure you want to delete this block?")) return;
    try {
      await deleteContentMutation.mutateAsync({ contentId: selected.id, lessonId });
      showToast("Block deleted successfully.", "success", "Deleted");
    } catch (error) {
      showToast("Failed to delete block.", "error", "Error");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm space-y-4">
      {/* Target UI Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
          BLOCK SETTINGS
        </h3>
        <button
          onClick={onClose}
          title="Collapse Settings"
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      {!selected || !cellType ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Settings2 size={24} className="text-slate-600" />
          <p className="text-xs text-slate-500">Select a block in the composer to configure settings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Target UI Content | Design Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setTab("content")}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition cursor-pointer",
                tab === "content" ? "bg-orange-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setTab("design")}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition cursor-pointer",
                tab === "design" ? "bg-orange-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              Design
            </button>
          </div>

          {/* Selected Block Info Banner */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
              <cellType.icon size={15} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{cellType.label}</p>
              <p className="truncate text-[10px] text-slate-500">Configure block content and layout</p>
            </div>
          </div>

          {/* Tab Content */}
          {tab === "content" ? (
            <div className="space-y-4">
              <ContentSummary content={selected} cellTypeId={cellType.id} />
              <BlockDesignForm content={selected} onDeleteBlock={handleDeleteBlock} />
            </div>
          ) : (
            <BlockDesignForm content={selected} onDeleteBlock={handleDeleteBlock} />
          )}
        </div>
      )}
    </div>
  );
}
