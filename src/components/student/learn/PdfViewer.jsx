"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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

export default function PdfViewer({ fileUrl, title, className = "" }) {
  const resolvedUrl = getDisplayUrl(fileUrl);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Responsive container width tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 32);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isMounted]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err) => {
    console.error("PDF Load Error:", err);
    setLoading(false);
    setError(err?.message || "Failed to load PDF document.");
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) =>
      Math.min(Math.max(1, prevPageNumber + offset), numPages || 1)
    );
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1.0);

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
        <h4 className="text-sm font-bold text-white">No PDF URL Provided</h4>
        <p className="text-xs text-slate-400">Please select a valid PDF file content.</p>
      </div>
    );
  }

  const calculatedPageWidth = containerWidth ? Math.min(containerWidth * scale, 1200) : 600;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-2xl border border-slate-800 bg-[#0B101D] shadow-xl overflow-hidden ${className}`}
    >
      {/* PDF Controls Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0D1222] px-4 py-3 text-slate-300">
        {/* Document Title / Info */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-orange-400" />
          <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
            {title || "PDF Document"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
          {/* Page Navigation */}
          {numPages && (
            <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-800 px-2 py-1">
              <button
                type="button"
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-200 px-1 font-mono">
                {pageNumber} / {numPages}
              </span>
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

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-800 px-2 py-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-semibold text-slate-400 min-w-[36px] text-center font-mono">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 2.5}
              className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            {scale !== 1.0 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="rounded-lg p-1 text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Download Raw File */}
          <a
            href={resolvedUrl || fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-xs font-bold text-slate-950 transition cursor-pointer shadow-md"
            title="Download PDF File"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* PDF Render Canvas Area */}
      <div className="relative min-h-[450px] max-h-[750px] w-full overflow-auto bg-[#060913] p-4 flex justify-center items-start">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060913]/90 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-xs text-slate-400 font-semibold">Loading PDF Document…</p>
          </div>
        )}

        {error ? (
          <div className="my-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-md">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Unable to Render PDF</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{error}</p>
            </div>
            <a
              href={resolvedUrl || fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-slate-950 transition"
            >
              <Download size={14} />
              <span>Download File Instead</span>
            </a>
          </div>
        ) : (
          <Document
            file={resolvedUrl || fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
                <span className="text-xs text-slate-400">Loading document pages…</span>
              </div>
            }
            className="flex flex-col items-center shadow-2xl rounded-lg overflow-hidden"
          >
            <Page
              pageNumber={pageNumber}
              width={calculatedPageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-2xl rounded-lg overflow-hidden border border-slate-800"
            />
          </Document>
        )}
      </div>

      {/* Footer Navigation Bar */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#0D1222] px-4 py-2.5 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <span className="font-semibold text-slate-300 font-mono">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="flex items-center gap-1 font-bold text-slate-300 hover:text-white disabled:opacity-40 transition cursor-pointer"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}