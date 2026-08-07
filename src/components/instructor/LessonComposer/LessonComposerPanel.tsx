"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  FileText,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MoreHorizontal,
  Plus,
  Redo,
  Strikethrough,
  Table,
  Type,
  Underline,
  Undo,
  Video as VideoIcon,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { useToast } from "@/components/ui/ToastProvider";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { cn } from "@/lib/utils";

import { AddCellModal } from "./AddCellModal";
import { TextCell } from "./cells/TextCell";
import { HeadingCell } from "./cells/HeadingCell";
import { ImageCell } from "./cells/ImageCell";
import { VideoCell } from "./cells/VideoCell";
import { LinkCell } from "./cells/LinkCell";
import { DocumentCell } from "./cells/DocumentCell";
import { useDuplicateContent } from "./contentMutations";
import { CELL_TYPES } from "./cellTypes";
import { detectHtmlCellVariant } from "./htmlCellVariant";
import { computeInsertOrder, sortByOrder } from "./blockOrder";
import { getErrorMessage } from "./getErrorMessage";
import type { CellActionProps, ContentRow } from "./types";

interface LessonComposerPanelProps {
  lessonId: string;
  selectedCellId?: string | null;
  onSelectCell?: (contentId: string) => void;
}

/** Determines block badge representation (label & color variant) for target UI */
function getBlockBadge(content: ContentRow): { text: string; variant: "heading" | "text" | "code" | "image" | "video" | "document" | "default" } {
  switch (content.type) {
    case "HTML": {
      const variant = detectHtmlCellVariant(content.htmlContent);
      if (variant === "heading") {
        const tagMatch = content.htmlContent?.match(/<(h[1-6])/i);
        const tagStr = tagMatch ? tagMatch[1].toUpperCase() : "H1";
        return { text: tagStr, variant: "heading" };
      }
      if (variant === "image") {
        return { text: "IMG", variant: "image" };
      }
      if (content.htmlContent?.includes("<code") || content.htmlContent?.includes("<pre")) {
        return { text: "</>", variant: "code" };
      }
      return { text: "P", variant: "text" };
    }
    case "VIDEO":
      return { text: "VID", variant: "video" };
    case "LINK":
      return { text: "LINK", variant: "default" };
    case "DOCUMENT":
    case "PRESENTATION":
      return { text: "DOC", variant: "document" };
    default:
      return { text: "BLOCK", variant: "default" };
  }
}

/** Renders the cell that matches a Content row's `type` */
function renderCell(content: ContentRow, actionProps: CellActionProps) {
  switch (content.type) {
    case "HTML":
      switch (detectHtmlCellVariant(content.htmlContent)) {
        case "heading":
          return <HeadingCell content={content} {...actionProps} />;
        case "image":
          return <ImageCell content={content} {...actionProps} />;
        default:
          return <TextCell content={content} {...actionProps} />;
      }
    case "VIDEO":
      return <VideoCell content={content} {...actionProps} />;
    case "LINK":
      return <LinkCell content={content} {...actionProps} />;
    case "DOCUMENT":
      return (
        <DocumentCell
          content={content}
          cellType={CELL_TYPES.find((c) => c.id === "document")!}
          {...actionProps}
        />
      );
    case "PRESENTATION":
      return (
        <DocumentCell
          content={content}
          cellType={CELL_TYPES.find((c) => c.id === "presentation")!}
          {...actionProps}
        />
      );
    default:
      return (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-5">
          <p className="text-sm font-semibold text-white">
            Unsupported content type: {content.type}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {content.title || "Untitled"}
          </p>
        </div>
      );
  }
}

export function LessonComposerPanel({
  lessonId,
  selectedCellId,
  onSelectCell,
}: LessonComposerPanelProps) {
  const { data: contents = [], isLoading, isError } = useContents(lessonId);
  const [insertOrder, setInsertOrder] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const { duplicate } = useDuplicateContent();
  const { showToast } = useToast();

  // Selection is "controlled" when a parent passes onSelectCell (the course
  // page, wiring a Block Settings panel) and falls back to local state
  // otherwise (the standalone lesson-page toggle) — either way, every block
  // is selectable, which is what lets touch devices (no hover) reach a
  // block's Add Above/Below/Duplicate/Delete/Settings controls by tapping it.
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = selectedCellId !== undefined ? selectedCellId : localSelectedId;

  const handleSelectCell = (contentId: string) => {
    setLocalSelectedId(contentId);
    onSelectCell?.(contentId);
  };

  const openAddCell = (order: number) => setInsertOrder(order);

  const [activeFormat, setActiveFormat] = useState({
    blockType: "Paragraph",
    bold: false,
    italic: false,
    underline: false,
    align: "left",
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="py-12 text-center text-sm text-slate-400">
          Failed to load lesson content.
        </CardContent>
      </Card>
    );
  }

  const validOrders = (contents || [])
    .map((c: ContentRow) => (typeof c.order === "number" && !isNaN(c.order) && c.order > 0 ? c.order : 0))
    .filter((o: number) => o > 0);

  const nextOrder = validOrders.length > 0 ? Math.max(...validOrders) + 1 : (contents.length > 0 ? contents.length + 1 : 1);

  const handleDuplicate = async (content: ContentRow) => {
    setDuplicatingId(content.id);
    try {
      await duplicate(content, nextOrder);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to duplicate this block."), "error", "Duplicate failed");
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Target UI Toolbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-2.5 shadow-md text-slate-300">
        {/* Left Formatting Group */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Undo"
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Redo"
          >
            <Redo size={14} />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Block Type Dropdown */}
          <select
            value={activeFormat.blockType}
            onChange={(e) => setActiveFormat({ ...activeFormat, blockType: e.target.value })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="Paragraph">Paragraph</option>
            <option value="Heading 1">Heading 1 (H1)</option>
            <option value="Heading 2">Heading 2 (H2)</option>
            <option value="Heading 3">Heading 3 (H3)</option>
            <option value="Code">Code Block</option>
          </select>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => setActiveFormat({ ...activeFormat, bold: !activeFormat.bold })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer",
              activeFormat.bold ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            title="Bold"
          >
            <Bold size={14} />
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat({ ...activeFormat, italic: !activeFormat.italic })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer",
              activeFormat.italic ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            title="Italic"
          >
            <Italic size={14} />
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat({ ...activeFormat, underline: !activeFormat.underline })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer",
              activeFormat.underline ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            title="Underline"
          >
            <Underline size={14} />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Text Color */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-orange-400 hover:bg-slate-800 transition cursor-pointer font-black text-sm"
            title="Text Color"
          >
            A<span className="text-[9px] translate-y-1">▼</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => setActiveFormat({ ...activeFormat, align: "left" })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer",
              activeFormat.align === "left" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat({ ...activeFormat, align: "center" })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer",
              activeFormat.align === "center" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat({ ...activeFormat, align: "right" })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer",
              activeFormat.align === "right" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Justify"
          >
            <AlignJustify size={14} />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Lists */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Bullet List"
          >
            <List size={14} />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered size={14} />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Block Insertion Shortcuts */}
          <button
            type="button"
            onClick={() => openAddCell(nextOrder)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Insert Link"
          >
            <LinkIcon size={14} />
          </button>

          <button
            type="button"
            onClick={() => openAddCell(nextOrder)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon size={14} />
          </button>

          <button
            type="button"
            onClick={() => openAddCell(nextOrder)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Insert Video"
          >
            <VideoIcon size={14} />
          </button>

          <button
            type="button"
            onClick={() => openAddCell(nextOrder)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Insert Table"
          >
            <Table size={14} />
          </button>

          <button
            type="button"
            onClick={() => openAddCell(nextOrder)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Insert Code"
          >
            <Code size={14} />
          </button>
        </div>

        {/* Right Add Cell Button */}
        <button
          type="button"
          onClick={() => openAddCell(nextOrder)}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-1.5 transition shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Add Block</span>
        </button>
      </div>

      {/* Canvas */}
      {contents.length === 0 ? (
        <div
          onClick={() => openAddCell(nextOrder)}
          className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-950/40 p-12 text-center transition cursor-pointer group"
        >
          <p className="text-sm font-bold text-slate-300 group-hover:text-orange-400 transition">
            No content in this lesson yet.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click here or use the toolbar above to add your first content block.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortByOrder(contents).map((content: ContentRow) => {
            const badge = getBlockBadge(content);
            const isSelected = effectiveSelectedId === content.id;

            return (
              <div
                key={content.id}
                onClick={() => handleSelectCell(content.id)}
                className={cn(
                  "cursor-pointer rounded-2xl transition-all duration-150",
                  isSelected && "ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950"
                )}
              >
                {renderCell(content, {
                  onDuplicate: () => handleDuplicate(content),
                  isDuplicating: duplicatingId === content.id,
                  badgeText: badge.text,
                  badgeVariant: badge.variant,
                  onSettingsSelect: onSelectCell ? () => handleSelectCell(content.id) : undefined,
                  onAddAbove: () => openAddCell(computeInsertOrder(contents, content.id, "above")),
                  onAddBelow: () => openAddCell(computeInsertOrder(contents, content.id, "below")),
                  isSelected,
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Target UI Bottom Add Content Block Zone */}
      <div
        onClick={() => openAddCell(nextOrder)}
        className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-orange-500/60 bg-slate-950/30 p-4 text-center transition cursor-pointer group flex items-center justify-center gap-2"
      >
        <Plus size={16} className="text-orange-500 group-hover:scale-110 transition" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-orange-400 transition">
          Add Content Block
        </span>
      </div>

      <AddCellModal
        lessonId={lessonId}
        order={insertOrder ?? nextOrder}
        open={insertOrder !== null}
        onOpenChange={(open) => {
          if (!open) setInsertOrder(null);
        }}
      />
    </div>
  );
}
