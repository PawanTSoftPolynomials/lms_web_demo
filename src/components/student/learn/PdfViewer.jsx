"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

import { getDisplayUrl } from "@/lib/blob";

// Configure PDF.js worker using unpkg CDN matching the installed pdfjs version
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const MIN_ZOOM = 0.5; // 50%
const MAX_ZOOM = 2.5; // 250%
const ZOOM_STEP = 0.15;

export default function PdfViewer({
  fileUrl,
  title,
  className = "",
  hideToolbar = false,
  onControlsRender,
}) {
  const resolvedUrl = getDisplayUrl(fileUrl);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Container measurement & zoom state
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFitToWidth, setIsFitToWidth] = useState(true);
  const [customScale, setCustomScale] = useState(1.0); // Multiplier when manual zoom is used
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Responsive container measurement using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const measureContainer = () => {
      if (containerRef.current) {
        // Measure exact available inner width excluding outer border/padding
        const width = containerRef.current.clientWidth;
        const padding = width < 640 ? 12 : 24;
        setContainerWidth(Math.max(width - padding, 260));
      }
    };

    measureContainer();
    const observer = new ResizeObserver(measureContainer);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isMounted]);

  // Keep pageInput synced with pageNumber
  useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err) => {
    console.error("[PDF VIEWER] Document Load Error:", err);
    setLoading(false);
    setError(err?.message || "Failed to load PDF document.");
  };

  const changePage = (offset) => {
    setPageNumber((prev) => {
      const next = Math.min(Math.max(1, prev + offset), numPages || 1);
      if (viewportRef.current) {
        viewportRef.current.scrollTop = 0;
      }
      return next;
    });
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter") {
      const parsed = parseInt(pageInput, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= (numPages || 1)) {
        setPageNumber(parsed);
        if (viewportRef.current) viewportRef.current.scrollTop = 0;
      } else {
        setPageInput(String(pageNumber));
      }
    }
  };

  // Zoom Action Handlers
  const handleZoomIn = () => {
    setIsFitToWidth(false);
    setCustomScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setIsFitToWidth(false);
    setCustomScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleFitToWidth = () => {
    setIsFitToWidth(true);
    setCustomScale(1.0);
  };

  // Calculate final page width for react-pdf Page component
  const baseWidth = containerWidth ? Math.min(containerWidth, 1400) : 600;
  const renderPageWidth = isFitToWidth ? baseWidth : Math.round(baseWidth * customScale);

  // Effective display zoom percentage
  const effectiveZoomPercentage = isFitToWidth
    ? 100
    : Math.round(customScale * 100);

  // Reusable Controls Bar JSX (used inside inner toolbar or passed to parent header)
  const controlsNode = (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Page Navigation */}
      {numPages && (
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 px-2 py-1">
          <button
            type="button"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-200 font-mono">
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              className="w-8 rounded bg-slate-900 border border-slate-700 px-1 py-0.5 text-center text-xs font-bold text-white focus:outline-none focus:border-orange-500 font-mono"
              title="Type page number and press Enter"
            />
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">{numPages}</span>
          </div>

          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Zoom Model Controls */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 px-2 py-1">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={!isFitToWidth && customScale <= MIN_ZOOM}
          className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
          title="Zoom Out (-15%)"
        >
          <ZoomOut size={15} />
        </button>

        <span className="text-[11px] font-semibold text-slate-300 min-w-[36px] text-center font-mono">
          {isFitToWidth ? "Fit" : `${effectiveZoomPercentage}%`}
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={!isFitToWidth && customScale >= MAX_ZOOM}
          className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
          title="Zoom In (+15%)"
        >
          <ZoomIn size={15} />
        </button>

        {/* Fit to Width Button */}
        {!isFitToWidth && (
          <button
            type="button"
            onClick={handleFitToWidth}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-orange-400 hover:bg-orange-500/10 border border-orange-500/30 transition cursor-pointer"
            title="Fit to Width"
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">Fit</span>
          </button>
        )}
      </div>

      {/* Download Button */}
      <a
        href={resolvedUrl || fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-xs font-extrabold text-slate-950 transition cursor-pointer shadow-md"
        title="Download PDF Document"
      >
        <Download size={14} />
        <span className="hidden sm:inline">Download</span>
      </a>
    </div>
  );

  const onControlsRenderRef = useRef(onControlsRender);
  useEffect(() => {
    onControlsRenderRef.current = onControlsRender;
  }, [onControlsRender]);

  // Notify parent of rendered controls when onControlsRender callback is supplied
  useEffect(() => {
    if (onControlsRenderRef.current) {
      onControlsRenderRef.current(controlsNode);
    }
  }, [
    numPages,
    pageNumber,
    pageInput,
    isFitToWidth,
    customScale,
    effectiveZoomPercentage,
    resolvedUrl,
    fileUrl,
  ]);

  if (!isMounted) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-slate-800 bg-[#0B101D]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-[#0B101D] p-6 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500" />
        <h4 className="text-sm font-bold text-white">No PDF File Provided</h4>
        <p className="text-xs text-slate-400">Please select a valid PDF content item.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full ${
        !hideToolbar
          ? "rounded-2xl border border-slate-800 bg-[#0B101D] shadow-2xl overflow-hidden"
          : ""
      } ${className}`}
    >
      {/* Standalone Header Toolbar (rendered ONLY when hideToolbar is false) */}
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 bg-[#0D1222] px-3.5 py-2.5 text-slate-300 rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0">
              <FileText size={15} />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {title || "PDF Document"}
            </span>
          </div>

          {controlsNode}
        </div>
      )}

      {/* PDF CANVAS VIEWPORT CONTAINER */}
      <div
        ref={viewportRef}
        className="relative w-full h-[82vh] min-h-[560px] max-h-[950px] overflow-auto bg-[#060913] p-2 sm:p-3.5 flex justify-center items-start scroll-smooth rounded-2xl border border-slate-800/80"
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060913]/90 z-20 rounded-2xl">
            <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
            <p className="text-xs font-bold text-slate-300">Rendering PDF Document…</p>
          </div>
        )}

        {/* Error State */}
        {error ? (
          <div className="my-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center max-w-md">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Unable to Render PDF</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{error}</p>
            </div>
            <a
              href={resolvedUrl || fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg"
            >
              <Download size={15} />
              <span>Download File Instead</span>
            </a>
          </div>
        ) : (
          /* PDF Document Rendering with Native Pixel Width */
          <Document
            file={resolvedUrl || fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                <span className="text-xs font-semibold text-slate-400">Loading document pages…</span>
              </div>
            }
            className="flex flex-col items-center max-w-full"
          >
            <div className="my-auto py-1.5 transition-all duration-150 flex justify-center">
              <Page
                pageNumber={pageNumber}
                width={renderPageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white"
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  );
}