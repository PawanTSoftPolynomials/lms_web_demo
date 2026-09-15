"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// The document viewers bring pdf.js (react-pdf), jszip + pako and
// @xmldom/xmldom with them — ~190KB compressed that every lesson, topic and
// content page used to download up front, even when the item on screen is a
// video or text. Import the viewers from here so that weight only loads when a
// document is actually rendered. The fallback is the same box PdfViewer shows
// before it mounts, so first paint is unchanged.
function ViewerLoading() {
  return (
    <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-border bg-[#0B101D]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export const PdfViewer = dynamic(() => import("@/components/student/learn/PdfViewer"), {
  ssr: false,
  loading: ViewerLoading,
});

export const PptViewer = dynamic(() => import("@/components/shared/PptViewer"), {
  ssr: false,
  loading: ViewerLoading,
});

export const DocxViewer = dynamic(() => import("@/components/shared/DocxViewer"), {
  ssr: false,
  loading: ViewerLoading,
});

export const ExternalDocumentViewer = dynamic(() => import("@/components/shared/ExternalDocumentViewer"), {
  ssr: false,
  loading: ViewerLoading,
});
