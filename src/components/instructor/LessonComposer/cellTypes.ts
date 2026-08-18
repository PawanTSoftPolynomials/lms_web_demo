import {
  File,
  FileText,
  Heading,
  Image,
  Link2,
  MonitorPlay,
  Presentation,
  Video,
  type LucideIcon,
} from "lucide-react";

import { detectHtmlCellVariant } from "./htmlCellVariant";
import type { ContentRow } from "./types";

/**
 * Mirrors the subset of the backend `ContentType` enum (prisma/schema.prisma,
 * lms-api) that the Lesson Composer can currently produce. Each cell is
 * persisted as one `Content` row via the existing `/contents` endpoints —
 * there is no separate "block" storage.
 *
 * Heading, Image, and PDF do NOT have their own backend `ContentType` value
 * reachable through this API today (the Joi allow-list only permits
 * VIDEO | DOCUMENT | PRESENTATION | HTML | LINK on create/update). Rather
 * than blocking on a backend change, they're adapted onto an already-allowed
 * type: Heading and Image are stored as `HTML` (a recognizable marker class
 * — see `htmlCellVariant.ts` — lets the composer tell them apart from plain
 * Text after reloading), and PDF is stored as `DOCUMENT` (identical
 * upload/viewer behavior already exists for that type). This is a frontend
 * adaptation only; no backend code changes.
 */
export type ContentType =
  | "HTML"
  | "VIDEO"
  | "LINK"
  | "EMBED"
  | "DOCUMENT"
  | "PRESENTATION";

export type CellTypeId =
  | "text"
  | "heading"
  | "image"
  | "video"
  | "link"
  | "interactive"
  | "document"
  | "presentation"
  | "pdf";

export interface CellTypeDefinition {
  id: CellTypeId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** The backend `Content.type` value this cell is saved as. */
  contentType: ContentType;
  /**
   * Whether creating/editing this cell actually works against the live API
   * today. `false` means there is no reachable adaptation — the backend
   * itself must change before this cell can be built (see the migration
   * report's API Gap Analysis / Risk Analysis).
   */
  supportedByApiToday: boolean;
}

export const CELL_TYPES: CellTypeDefinition[] = [
  {
    id: "text",
    label: "Text",
    description: "Rich formatted text — paragraphs, lists, quotes.",
    icon: FileText,
    contentType: "HTML",
    supportedByApiToday: true,
  },
  {
    id: "heading",
    label: "Heading",
    description: "A section heading.",
    icon: Heading,
    contentType: "HTML",
    supportedByApiToday: true,
  },
  {
    id: "image",
    label: "Image",
    description: "A single image with an optional caption.",
    icon: Image,
    contentType: "HTML",
    supportedByApiToday: true,
  },
  {
    id: "video",
    label: "Video",
    description: "An uploaded video file or a YouTube/Vimeo link.",
    icon: Video,
    contentType: "VIDEO",
    supportedByApiToday: true,
  },
  {
    id: "link",
    label: "Link",
    description: "A link out to an external resource.",
    icon: Link2,
    contentType: "LINK",
    supportedByApiToday: true,
  },
  {
    id: "interactive",
    label: "Interactive Embed",
    description: "An embedded interactive widget or simulation (iframe).",
    icon: MonitorPlay,
    contentType: "EMBED",
    supportedByApiToday: false,
  },
  {
    id: "document",
    label: "Document",
    description: "An uploaded document (Word, Excel, etc.) viewed in-browser.",
    icon: FileText,
    contentType: "DOCUMENT",
    supportedByApiToday: true,
  },
  {
    id: "presentation",
    label: "Presentation",
    description: "An uploaded slide deck viewed in-browser.",
    icon: Presentation,
    contentType: "PRESENTATION",
    supportedByApiToday: true,
  },
  {
    id: "pdf",
    label: "PDF / File",
    description: "An uploaded PDF or other file, viewed natively in the browser.",
    icon: File,
    contentType: "DOCUMENT",
    supportedByApiToday: true,
  },
];

/**
 * Resolves the `CellTypeDefinition` a given Content row renders as — the
 * same type-detection `LessonComposerPanel`'s `renderCell` switches on,
 * exposed for callers (the Block Settings panel) that need the icon/label
 * for the currently selected block without duplicating that switch.
 */
export function getCellTypeForContent(content: ContentRow): CellTypeDefinition | undefined {
  switch (content.type) {
    case "HTML":
      return CELL_TYPES.find((c) => c.id === detectHtmlCellVariant(content.htmlContent));
    case "IMAGE":
      return CELL_TYPES.find((c) => c.id === "image");
    case "VIDEO":
      return CELL_TYPES.find((c) => c.id === "video");
    case "LINK":
      return CELL_TYPES.find((c) => c.id === "link");
    case "DOCUMENT":
    case "FILE":
      return CELL_TYPES.find((c) => c.id === "document") || CELL_TYPES.find((c) => c.id === "pdf");
    case "PRESENTATION":
      return CELL_TYPES.find((c) => c.id === "presentation");
    default:
      return CELL_TYPES.find((c) => c.id === "document") || CELL_TYPES.find((c) => c.id === "text");
  }
}

// Quiz (embedded by reference to an existing Quiz) and Slideshow (Marp) are
// intentionally not registered yet — both are deferred: Quiz needs a
// reference-field decision, Slideshow needs a new dependency
// (@marp-team/marp-core). "interactive" IS registered but stays
// unsupported — unlike Heading/Image/PDF above, there's no reachable
// adaptation for it: the backend's HTML sanitizer (src/utils/sanitizer.js)
// hard-restricts <iframe src> to youtube.com/vimeo.com hostnames only, so an
// arbitrary embed URL would be silently stripped server-side even if sent
// as HTML content. That's a backend change (widening the sanitizer's
// allowedIframeHostnames), not something this composer can work around.
