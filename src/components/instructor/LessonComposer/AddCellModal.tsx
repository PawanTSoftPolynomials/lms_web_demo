"use client";

import { useState, type ComponentType } from "react";
import { ArrowLeft, Layers, Upload } from "lucide-react";

import Modal from "@/components/ui/Modal";

import { CreateTextForm } from "./cells/TextCell";
import { CreateHeadingForm } from "./cells/HeadingCell";
import { CreateImageForm } from "./cells/ImageCell";
import { CreateVideoForm } from "./cells/VideoCell";
import { CreateLinkForm } from "./cells/LinkCell";
import { CreateFileForm } from "./cells/DocumentCell";
import { CELL_TYPES, type CellTypeId } from "./cellTypes";
import type { CreateCellFormProps } from "./types";

interface AddCellModalProps {
  topicId: string;
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
 * The "Add Content" picker + per-type creation form — a single centered
 * modal (same Modal primitive as the Module/Lesson/Topic create/edit
 * modals), opened from the Canvas toolbar, the empty-state, Add Above/Add
 * Below on any existing block, and the Course Map sidebar's "Add Content"
 * action. Only lists cell types that can actually be created against the
 * live API today (`supportedByApiToday`) — Interactive Embed is excluded
 * (see cellTypes.ts for why).
 */
export function AddCellModal({ topicId, order, open, onOpenChange }: AddCellModalProps) {
  const [selectedId, setSelectedId] = useState<CellTypeId | null>(null);
  // Presentation only: which of the two presentation workflows the
  // instructor picked, chosen as its own step so CreateFileForm never has
  // to ask the same question again.
  const [presentationChoice, setPresentationChoice] = useState<"slideshow" | "upload" | null>(null);

  const close = () => {
    onOpenChange(false);
    setSelectedId(null);
    setPresentationChoice(null);
  };

  const selectedCellType = selectedId ? CELL_TYPES.find((c) => c.id === selectedId) ?? null : null;
  const SimpleForm = selectedId ? SIMPLE_FORMS[selectedId] : undefined;
  const isFileType = selectedId ? FILE_TYPES.includes(selectedId) : false;
  const isPresentation = selectedId === "presentation";
  const awaitingPresentationChoice = isPresentation && presentationChoice === null;

  const title = !selectedCellType
    ? "Add Content"
    : awaitingPresentationChoice
      ? "Add Presentation"
      : `Add ${selectedCellType.label}`;

  const handleBack = () => {
    if (awaitingPresentationChoice || !isPresentation) {
      setSelectedId(null);
      setPresentationChoice(null);
    } else {
      // Presentation, past the choice step — back goes to the choice, not the type grid.
      setPresentationChoice(null);
    }
  };

  return (
    <Modal open={open} onClose={close} title={title} size="lg">
      <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
        {selectedCellType && (
          <button
            type="button"
            onClick={handleBack}
            className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>
        )}

        {!selectedCellType ? (
          <>
            <p className="mb-4 text-xs text-muted-foreground">Choose what you want to add.</p>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_TYPES.map((cellType) => {
                const Icon = cellType.icon;
                return (
                  <button
                    key={cellType.id}
                    type="button"
                    onClick={() => setSelectedId(cellType.id)}
                    className="flex flex-col items-start gap-2 rounded-xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-bold text-foreground">{cellType.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : awaitingPresentationChoice ? (
          <>
            <p className="mb-4 text-xs text-muted-foreground">How do you want to create it?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPresentationChoice("slideshow")}
                className="flex flex-col items-start gap-2 rounded-xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-primary">
                  <Layers className="size-4" />
                </span>
                <span className="text-sm font-bold text-foreground">Create Slides</span>
                <span className="text-xs text-muted-foreground">Build the presentation inside the LMS.</span>
              </button>

              <button
                type="button"
                onClick={() => setPresentationChoice("upload")}
                className="flex flex-col items-start gap-2 rounded-xl border border-card-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-pink-500/15 text-primary">
                  <Upload className="size-4" />
                </span>
                <span className="text-sm font-bold text-foreground">Upload PPTX</span>
                <span className="text-xs text-muted-foreground">Upload an existing PowerPoint file.</span>
              </button>
            </div>
          </>
        ) : SimpleForm ? (
          <SimpleForm topicId={topicId} order={order} onCreated={close} onCancel={() => setSelectedId(null)} />
        ) : isFileType ? (
          <CreateFileForm
            topicId={topicId}
            order={order}
            cellType={selectedCellType}
            accept={selectedId ? FILE_TYPE_ACCEPT[selectedId] : undefined}
            presentationMode={presentationChoice ?? undefined}
            onCreated={close}
            onCancel={() => setSelectedId(null)}
          />
        ) : null}
      </div>
    </Modal>
  );
}
