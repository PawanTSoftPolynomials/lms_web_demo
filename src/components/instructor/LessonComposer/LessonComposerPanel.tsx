"use client";

import { useEffect, useRef, useState } from "react";
import {
  Code,
  FileText,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  MoreHorizontal,
  Table,
  Type,
  Video as VideoIcon,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { useToast } from "@/components/ui/ToastProvider";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";

const AddCellModal = dynamic(
  () => import("./AddCellModal").then((mod) => mod.AddCellModal),
  { ssr: false }
);
import { TextCell } from "./cells/TextCell";
import { HeadingCell } from "./cells/HeadingCell";
import { ImageCell } from "./cells/ImageCell";
import { VideoCell } from "./cells/VideoCell";
import { LinkCell } from "./cells/LinkCell";
import { DocumentCell } from "./cells/DocumentCell";
import { InteractiveCell } from "./cells/InteractiveCell";
import { useDuplicateContent, useUpdateContent } from "./contentMutations";
import { CELL_TYPES, type ContentType } from "./cellTypes";
import { detectHtmlCellVariant } from "./htmlCellVariant";
import { planInsert, sortByOrder } from "./blockOrder";
import { getErrorMessage } from "./getErrorMessage";
import type { CellActionProps, ContentRow } from "./types";

interface LessonComposerPanelProps {
  topicId: string;
  selectedCellId?: string | null;
  onSelectCell?: (contentId: string) => void;
  /** Bump this (e.g. a counter) to immediately open the Add Content picker for the current topic — used by the Course Map's "Add Content" action so it never has to navigate to a separate page. */
  autoOpenAddSignal?: number;
  draftContents?: ContentRow[];
  isDraftMode?: boolean;
  onUpdateDraftContents?: (contents: ContentRow[]) => void;
  /** Opens the lesson-quiz creation flow for this topic's parent lesson — a Quiz isn't a Content row, so picking it from the Add Content grid hands off to that flow instead of an in-panel form. Omit to hide the Quiz option. */
  onAddQuiz?: () => void;
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
    case "IMAGE":
      return { text: "IMG", variant: "image" };
    case "VIDEO":
      return { text: "VID", variant: "video" };
    case "EMBED":
      return { text: "IFRM", variant: "code" };
    case "LINK":
      return { text: "LINK", variant: "default" };
    case "DOCUMENT":
    case "FILE":
      return { text: "DOC", variant: "document" };
    case "PRESENTATION":
      return { text: "SLIDE", variant: "document" };
    case "CODE":
      return { text: "</>", variant: "code" };
    default:
      return { text: (content.type || "FILE").toUpperCase().slice(0, 4), variant: "default" };
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
    case "IMAGE":
      return <ImageCell content={content} {...actionProps} />;
    case "VIDEO":
      return <VideoCell content={content} {...actionProps} />;
    case "EMBED":
      return <InteractiveCell content={content} {...actionProps} />;
    case "LINK":
      return <LinkCell content={content} {...actionProps} />;
    case "DOCUMENT":
    case "FILE":
      return (
        <DocumentCell
          content={content}
          cellType={
            CELL_TYPES.find((c) => c.id === "document") || {
              id: "document",
              label: "Document",
              description: "An uploaded document or file.",
              icon: FileText,
              contentType: "DOCUMENT",
              supportedByApiToday: true,
            }
          }
          {...actionProps}
        />
      );
    case "PRESENTATION":
      return (
        <DocumentCell
          content={content}
          cellType={
            CELL_TYPES.find((c) => c.id === "presentation") || {
              id: "presentation",
              label: "Presentation",
              description: "A presentation slide deck or PPTX file.",
              icon: Layers,
              contentType: "PRESENTATION",
              supportedByApiToday: true,
            }
          }
          {...actionProps}
        />
      );
    default:
      if (content.htmlContent) {
        return <TextCell content={content} {...actionProps} />;
      }
      return (
        <DocumentCell
          content={content}
          cellType={{
            id: "document",
            label: content.type ? content.type.charAt(0) + content.type.slice(1).toLowerCase() : "File",
            description: "Uploaded file resource.",
            icon: FileText,
            contentType: (content.type as unknown as ContentType) || "DOCUMENT",
            supportedByApiToday: true,
          }}
          {...actionProps}
        />
      );
  }
}

export function LessonComposerPanel({
  topicId,
  selectedCellId,
  onSelectCell,
  autoOpenAddSignal,
  draftContents,
  isDraftMode = false,
  onUpdateDraftContents,
  onAddQuiz,
}: LessonComposerPanelProps) {
  const { data: apiContents = [], isLoading: isApiLoading, isError: isApiError } = useContents(isDraftMode ? "" : topicId);

  const contents: ContentRow[] = isDraftMode ? (draftContents || []) : (apiContents || []);
  const isLoading = isDraftMode ? false : isApiLoading;
  const isError = isDraftMode ? false : isApiError;
  const [insertOrder, setInsertOrder] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [insertingAnchorId, setInsertingAnchorId] = useState<string | null>(null);
  const { duplicate } = useDuplicateContent();
  const updateContent = useUpdateContent();
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

  const openAddCell = (order: number) => {
    if (!topicId) {
      showToast("Please select or create a topic in the left sidebar first.", "error", "Topic Required");
      return;
    }
    setInsertOrder(order);
  };

  /**
   * "Add Above"/"Add Below": makes room at the target integer `order` slot
   * (see blockOrder.ts for why shifting — not a fractional order — is what
   * the backend actually supports), then opens the same Add Content picker
   * every other insertion uses. Guarded by `insertingAnchorId` since the
   * shifts are awaited sequentially and a second click mid-sequence would
   * plan against a now-stale `contents` snapshot.
   */
  const handleInsert = async (anchorId: string, position: "above" | "below") => {
    if (insertingAnchorId) return;

    const plan = planInsert(contents, anchorId, position);
    if (plan.shifts.length === 0) {
      openAddCell(plan.insertOrder);
      return;
    }

    setInsertingAnchorId(anchorId);
    try {
      for (const shift of plan.shifts) {
        await updateContent.mutateAsync({
          contentId: shift.contentId,
          contentData: { order: shift.newOrder, topicId },
        });
      }
      openAddCell(plan.insertOrder);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Failed to make room for the new block. Nothing was added — try again."),
        "error",
        "Insert failed"
      );
    } finally {
      setInsertingAnchorId(null);
    }
  };

  const validOrders = (contents || [])
    .map((c: ContentRow) => (typeof c.order === "number" && !isNaN(c.order) && c.order > 0 ? c.order : 0))
    .filter((o: number) => o > 0);

  const nextOrder = validOrders.length > 0 ? Math.max(...validOrders) + 1 : (contents.length > 0 ? contents.length + 1 : 1);

  // Lets the Course Map's "Add Content" action open this topic's Add
  // Content picker immediately, without a second click once the topic
  // becomes the active composer view.
  const handledAutoOpenSignal = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!autoOpenAddSignal || autoOpenAddSignal <= 0) return;
    if (isLoading) return;
    if (handledAutoOpenSignal.current === autoOpenAddSignal) return;
    handledAutoOpenSignal.current = autoOpenAddSignal;
    openAddCell(nextOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenAddSignal, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-[#D9D9D9] bg-[#B7C9C5]/60">
        <CardContent className="py-12 text-center text-sm text-slate-400">
          Failed to load lesson content.
        </CardContent>
      </Card>
    );
  }

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
      {/* Canvas */}
      {!topicId ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-12 text-center">
          <p className="text-sm font-bold text-amber-400">
            No topic found for this lesson.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Please click <strong className="text-white">+ New Topic</strong> in the left Course Map sidebar to create a topic before adding content blocks.
          </p>
        </div>
      ) : contents.length === 0 ? (
        <div
          onClick={() => openAddCell(nextOrder)}
          className="rounded-2xl border-2 border-dashed border-[#D9D9D9] hover:border-orange-500/50 bg-[#B7C9C5]/40 p-12 text-center transition cursor-pointer group"
        >
          <p className="text-sm font-bold text-slate-300 group-hover:text-orange-400 transition">
            No content in this lesson yet.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click here to add your first content block.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#D9D9D9]/80 bg-[#B7C9C5]/60 p-6 sm:p-8 md:p-10 shadow-lg space-y-2">
          {sortByOrder(contents).map((content: ContentRow) => {
            const badge = getBlockBadge(content);
            const isSelected = effectiveSelectedId === content.id;
            const isHeadingBlock = badge.variant === "heading";

            return (
              <div
                key={content.id}
                onClick={() => handleSelectCell(content.id)}
                className={cn(
                  "cursor-pointer transition-all duration-150 rounded-xl",
                  isHeadingBlock && "pt-4 sm:pt-6 border-t border-[#D9D9D9]/60 first:pt-0 first:border-t-0 mt-3 first:mt-0",
                  isSelected && "ring-2 ring-orange-500/80 ring-offset-2 ring-offset-slate-950"
                )}
              >
                {renderCell(content, {
                  onDuplicate: () => handleDuplicate(content),
                  isDuplicating: duplicatingId === content.id,
                  badgeText: badge.text,
                  badgeVariant: badge.variant,
                  onSettingsSelect: onSelectCell ? () => handleSelectCell(content.id) : undefined,
                  onAddAbove: () => handleInsert(content.id, "above"),
                  onAddBelow: () => handleInsert(content.id, "below"),
                  isSelected,
                })}
              </div>
            );
          })}
        </div>
      )}

      <AddCellModal
        topicId={topicId}
        order={insertOrder ?? nextOrder}
        open={insertOrder !== null}
        onOpenChange={(open) => {
          if (!open) setInsertOrder(null);
        }}
        onAddQuiz={onAddQuiz}
      />
    </div>
  );
}
