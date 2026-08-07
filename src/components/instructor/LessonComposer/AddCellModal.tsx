"use client";

import { useState, type ComponentType } from "react";
import { ArrowLeft } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/shadcn/sheet";

import { CreateTextForm } from "./cells/TextCell";
import { CreateHeadingForm } from "./cells/HeadingCell";
import { CreateImageForm } from "./cells/ImageCell";
import { CreateVideoForm } from "./cells/VideoCell";
import { CreateLinkForm } from "./cells/LinkCell";
import { CreateFileForm } from "./cells/DocumentCell";
import { CELL_TYPES, type CellTypeId } from "./cellTypes";
import type { CreateCellFormProps } from "./types";

interface AddCellModalProps {
  lessonId: string;
  /** Pre-computed `max(existing order) + 1`, shared by whichever type ends up being added. */
  order: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Cell types whose create form only needs the shared `CreateCellFormProps`. */
const SIMPLE_FORMS: Partial<Record<CellTypeId, ComponentType<CreateCellFormProps>>> = {
  text: CreateTextForm,
  heading: CreateHeadingForm,
  image: CreateImageForm,
  video: CreateVideoForm,
  link: CreateLinkForm,
};

/** Document/Presentation/PDF all share `CreateFileForm` — this restricts the file picker per type. */
const FILE_TYPE_ACCEPT: Partial<Record<CellTypeId, string>> = {
  pdf: ".pdf",
};
const FILE_TYPES: CellTypeId[] = ["document", "presentation", "pdf"];

const AVAILABLE_TYPES = CELL_TYPES.filter((cellType) => cellType.supportedByApiToday);

/**
 * The "Add Cell" picker + per-type creation form, opened from the Canvas
 * toolbar. Only lists cell types that can actually be created against the
 * live API today (`supportedByApiToday`) — Interactive Embed is excluded
 * (see cellTypes.ts for why).
 */
export function AddCellModal({ lessonId, order, open, onOpenChange }: AddCellModalProps) {
  const [selectedId, setSelectedId] = useState<CellTypeId | null>(null);

  const close = () => {
    onOpenChange(false);
    setSelectedId(null);
  };

  const selectedCellType = selectedId ? CELL_TYPES.find((c) => c.id === selectedId) ?? null : null;
  const SimpleForm = selectedId ? SIMPLE_FORMS[selectedId] : undefined;
  const isFileType = selectedId ? FILE_TYPES.includes(selectedId) : false;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          {selectedCellType && (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
          )}
          <SheetTitle>{selectedCellType ? `Add ${selectedCellType.label}` : "Add Cell"}</SheetTitle>
          <SheetDescription>
            {selectedCellType ? selectedCellType.description : "Choose a block type to add to this lesson."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!selectedCellType ? (
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_TYPES.map((cellType) => {
                const Icon = cellType.icon;
                return (
                  <button
                    key={cellType.id}
                    type="button"
                    onClick={() => setSelectedId(cellType.id)}
                    className="flex flex-col items-start gap-2 rounded-xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-bold text-foreground">{cellType.label}</span>
                  </button>
                );
              })}
            </div>
          ) : SimpleForm ? (
            <SimpleForm lessonId={lessonId} order={order} onCreated={close} onCancel={() => setSelectedId(null)} />
          ) : isFileType ? (
            <CreateFileForm
              lessonId={lessonId}
              order={order}
              cellType={selectedCellType}
              accept={selectedId ? FILE_TYPE_ACCEPT[selectedId] : undefined}
              onCreated={close}
              onCancel={() => setSelectedId(null)}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
