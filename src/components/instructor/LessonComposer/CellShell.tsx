"use client";

import type { ReactNode } from "react";
import {
  Copy,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";

interface CellShellProps {
  icon: LucideIcon;
  typeLabel: string;
  title: string;
  mode: "view" | "edit";
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  onDuplicate?: () => void;
  isDuplicating?: boolean;
  onSettingsSelect?: () => void;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  /** Keeps the hover-only chrome visible without a mouse — the touch-device fallback, since touch has no hover. */
  isSelected?: boolean;
  badgeText?: string;
  badgeVariant?: "heading" | "text" | "code" | "image" | "video" | "document" | "default";
  children: ReactNode;
}

const BADGE_STYLES = {
  heading: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  text: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  code: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  image: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  video: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  document: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  default: "bg-slate-800 text-slate-300 border-slate-700",
};

export function CellShell({
  icon: Icon,
  typeLabel,
  title,
  mode,
  onEdit,
  onDelete,
  isDeleting = false,
  onDuplicate,
  isDuplicating = false,
  onSettingsSelect,
  onAddAbove,
  onAddBelow,
  isSelected = false,
  badgeText,
  badgeVariant = "default",
  children,
}: CellShellProps) {
  const badgeClass = BADGE_STYLES[badgeVariant] || BADGE_STYLES.default;

  // Every hover-only control (drag handle, header actions, Add Above/Below)
  // shares this: invisible and non-interactive by default so nothing shifts
  // layout, fades in on hover, and — since touch has no hover — also stays
  // visible while `isSelected` or actively `edit`ing (tapping a block on a
  // touch device selects it; see LessonComposerPanel).
  const showControls = isSelected || mode === "edit";
  const hoverVisible = cn(
    "opacity-0 pointer-events-none transition-opacity duration-150",
    "group-hover:opacity-100 group-hover:pointer-events-auto",
    showControls && "opacity-100 pointer-events-auto"
  );

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/90",
        mode === "edit" && "ring-2 ring-orange-500/50 border-orange-500/50"
      )}
    >
      {/* Add Above — top center, fades in over the block's top edge */}
      {onAddAbove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddAbove();
          }}
          className={cn(
            "absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-bold text-slate-400 shadow-md transition-colors hover:border-orange-500 hover:bg-orange-500 hover:text-slate-950 cursor-pointer",
            hoverVisible
          )}
          title="Add block above"
        >
          <Plus size={11} />
          Add Above
        </button>
      )}

      {/* Drag Handle & Type Badge */}
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <div
          className={cn(
            "flex h-8 w-4 items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing transition",
            hoverVisible
          )}
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>

        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl font-extrabold text-xs border shadow-sm shrink-0",
            badgeClass
          )}
        >
          {badgeText ? (
            <span className="text-[11px] font-black uppercase">{badgeText}</span>
          ) : (
            <Icon size={16} />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-2.5">
          <div className="min-w-0">
            <h4 className="truncate text-xs font-bold text-slate-200">
              {title || "Untitled Block"}
            </h4>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {typeLabel}
            </p>
          </div>

          {/* Single Settings Icon Action Button */}
          <div className={cn("flex items-center shrink-0", hoverVisible)}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Block Settings & Actions"
                  title="Settings & Actions"
                >
                  <Settings size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit} disabled={mode === "edit"}>
                  <Pencil className="size-3.5" />
                  Edit Content
                </DropdownMenuItem>
                {onSettingsSelect && (
                  <DropdownMenuItem onSelect={onSettingsSelect}>
                    <Settings className="size-3.5" />
                    Block Settings
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onSelect={onDuplicate} disabled={isDuplicating}>
                    <Copy className="size-3.5" />
                    {isDuplicating ? "Duplicating…" : "Duplicate Block"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={onDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3.5" />
                  {isDeleting ? "Deleting…" : "Delete Block"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cell Body */}
        <div>{children}</div>
      </div>

      {/* Add Below — bottom center, fades in over the block's bottom edge */}
      {onAddBelow && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBelow();
          }}
          className={cn(
            "absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-bold text-slate-400 shadow-md transition-colors hover:border-orange-500 hover:bg-orange-500 hover:text-slate-950 cursor-pointer",
            hoverVisible
          )}
          title="Add block below"
        >
          <Plus size={11} />
          Add Below
        </button>
      )}
    </div>
  );
}
