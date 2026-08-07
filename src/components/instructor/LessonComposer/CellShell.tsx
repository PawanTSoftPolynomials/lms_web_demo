"use client";

import type { ReactNode } from "react";
import {
  Copy,
  GripVertical,
  MoreVertical,
  Pencil,
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
  badgeText,
  badgeVariant = "default",
  children,
}: CellShellProps) {
  const badgeClass = BADGE_STYLES[badgeVariant] || BADGE_STYLES.default;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/90",
        mode === "edit" && "ring-2 ring-orange-500/50 border-orange-500/50"
      )}
    >
      {/* Drag Handle & Type Badge */}
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <div className="flex h-8 w-4 items-center justify-center text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing transition">
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

          {/* Block Header Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {onSettingsSelect && (
              <button
                type="button"
                onClick={onSettingsSelect}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Block Settings"
              >
                <Settings size={13} />
              </button>
            )}

            {onDuplicate && (
              <button
                type="button"
                onClick={onDuplicate}
                disabled={isDuplicating}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                title="Duplicate Block"
              >
                <Copy size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-slate-950/60 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition cursor-pointer disabled:opacity-50"
              title="Delete Block"
            >
              <Trash2 size={13} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  aria-label="More options"
                >
                  <MoreVertical size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit} disabled={mode === "edit"}>
                  <Pencil className="size-3.5" />
                  Edit Content
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onSelect={onDuplicate} disabled={isDuplicating}>
                    <Copy className="size-3.5" />
                    {isDuplicating ? "Duplicating…" : "Duplicate"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={onDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3.5" />
                  {isDeleting ? "Deleting…" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cell Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
