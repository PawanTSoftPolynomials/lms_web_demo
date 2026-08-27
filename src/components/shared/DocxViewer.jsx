"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

import { getDisplayUrl } from "@/lib/blob";
import { parseDocxArrayBuffer } from "@/lib/docxParser";

export default function DocxViewer({
  fileUrl,
  title = "Document",
  className = "",
  hideToolbar = false,
  onControlsRender,
}) {
  const resolvedUrl = getDisplayUrl(fileUrl);

  const [elements, setElements] = useState([]);
  const [loadingStep, setLoadingStep] = useState("Loading document..."); // "Loading document..." | "Preparing view..." | null
  const [error, setError] = useState(null);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!fileUrl) return;

    let isMountedFlag = true;
    setLoadingStep("Loading document...");
    setError(null);
    setElements([]);

    async function loadDocument() {
      try {
        const fetchUrl = resolvedUrl || fileUrl;
        const response = await axios.get(fetchUrl, {
          responseType: "arraybuffer",
          withCredentials: true,
        });

        if (!isMountedFlag) return;
        setLoadingStep("Preparing view...");

        const parsed = await parseDocxArrayBuffer(response.data);

        if (!isMountedFlag) return;

        if (parsed && parsed.elements && parsed.elements.length > 0) {
          setElements(parsed.elements);
          setLoadingStep(null);
        } else {
          throw new Error("No readable text or elements extracted from document.");
        }
      } catch (err) {
        if (!isMountedFlag) return;
        console.error("[DOCX VIEWER] Parsing error:", err);
        setLoadingStep(null);
        setError(
          err?.response?.status === 401 || err?.response?.status === 403
            ? "Unauthorized access to document file."
            : err?.message || "Unable to render document content."
        );
      }
    }

    loadDocument();

    return () => {
      isMountedFlag = false;
    };
  }, [fileUrl, resolvedUrl]);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoomScale(1.0);

  // Controls bar node
  const controlsNode = (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 px-2 py-1">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomScale <= 0.7}
          className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>

        <span className="text-[11px] font-semibold text-slate-300 min-w-[36px] text-center font-mono">
          {Math.round(zoomScale * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomScale >= 2.0}
          className="rounded-lg p-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        {zoomScale !== 1.0 && (
          <button
            type="button"
            onClick={handleResetZoom}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-orange-400 hover:bg-orange-500/10 border border-orange-500/30 transition cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">Reset</span>
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
        title="Download Word Document"
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

  useEffect(() => {
    if (onControlsRenderRef.current) {
      onControlsRenderRef.current(controlsNode);
    }
  }, [zoomScale, resolvedUrl, fileUrl]);

  if (!isMounted) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-slate-800 bg-[#0B101D]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col w-full ${
        !hideToolbar
          ? "rounded-2xl border border-slate-800 bg-[#0B101D] shadow-2xl overflow-hidden"
          : ""
      } ${className}`}
    >
      {/* Header Toolbar */}
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 bg-[#0D1222] px-3.5 py-2.5 text-slate-300 rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0">
              <FileText size={15} />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {title || "Word Document"}
            </span>
          </div>

          {controlsNode}
        </div>
      )}

      {/* DOCUMENT PAPER VIEWPORT */}
      <div className="relative w-full h-[78vh] min-h-[520px] max-h-[900px] overflow-auto bg-[#060913] p-4 sm:p-8 flex justify-center items-start scroll-smooth rounded-2xl border border-slate-800/80">
        {/* Loading Overlay */}
        {loadingStep && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060913]/90 z-20 rounded-2xl">
            <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
            <p className="text-xs font-bold text-slate-300">{loadingStep}</p>
          </div>
        )}

        {/* Error / Fallback State */}
        {error ? (
          <div className="my-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Document preview unavailable</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                This Word document cannot be rendered directly in the browser preview. You can download the file to view it on your device.
              </p>
            </div>
            <a
              href={resolvedUrl || fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg"
            >
              <Download size={15} />
              <span>Download Document</span>
            </a>
          </div>
        ) : elements.length > 0 ? (
          /* Render Document Paper Container */
          <div
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-100 p-6 sm:p-12 shadow-2xl rounded-2xl transition-transform duration-150 origin-top"
            style={{
              transform: `scale(${zoomScale})`,
            }}
          >
            {elements.map((elem, idx) => {
              if (elem.type === "image") {
                return (
                  <div key={idx} className="my-6 flex justify-center">
                    <img
                      src={elem.src}
                      alt="Document graphic"
                      className="max-w-full max-h-[500px] object-contain rounded-lg border border-slate-800 shadow-md"
                    />
                  </div>
                );
              }

              if (elem.type === "paragraph") {
                let textClass = "text-sm text-slate-300 leading-relaxed mb-3";
                if (elem.style === "h1") {
                  textClass = "text-2xl font-bold text-white mb-4 mt-6 border-b border-slate-800 pb-2";
                } else if (elem.style === "h2") {
                  textClass = "text-xl font-bold text-slate-100 mb-3 mt-5";
                } else if (elem.style === "h3") {
                  textClass = "text-lg font-semibold text-slate-200 mb-2 mt-4";
                }

                return (
                  <p
                    key={idx}
                    className={textClass}
                    style={{ textAlign: elem.alignment || "left" }}
                  >
                    {elem.runs?.map((run, rIdx) => (
                      <span
                        key={rIdx}
                        style={{
                          fontWeight: run.bold ? "bold" : "normal",
                          fontStyle: run.italic ? "italic" : "normal",
                          textDecoration: run.underline ? "underline" : "none",
                          color: run.color || undefined,
                        }}
                      >
                        {run.text}
                      </span>
                    ))}
                  </p>
                );
              }

              if (elem.type === "table") {
                return (
                  <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                    <table className="w-full text-xs text-slate-200 border-collapse">
                      <tbody>
                        {elem.rows?.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-800/80">
                            {row?.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-slate-800/80">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
