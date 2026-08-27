"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { resolveExternalFile } from "@/lib/external/resolveExternalFile";
import PdfViewer from "@/components/student/learn/PdfViewer";
import PptViewer from "@/components/shared/PptViewer";
import DocxViewer from "@/components/shared/DocxViewer";

/**
 * ExternalDocumentViewer component.
 * Retrieves stored external-reference metadata or resolves raw URLs, then selects
 * and renders the appropriate native viewer strategy.
 */
export default function ExternalDocumentViewer({
  fileUrl,
  title = "Document",
  className = "",
  hideToolbar = false,
  onControlsRender,
}) {
  const [refMetadata, setRefMetadata] = useState(null);
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState(null);

  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  // Check if fileUrl points to a Vercel Blob JSON metadata reference
  const isReferenceJson = Boolean(
    fileUrl &&
      typeof fileUrl === "string" &&
      (fileUrl.includes("/external-references/") || fileUrl.endsWith(".json"))
  );

  useEffect(() => {
    if (!fileUrl || !isReferenceJson) {
      setRefMetadata(null);
      setRefLoading(false);
      setRefError(null);
      return;
    }

    let isMounted = true;
    setRefLoading(true);
    setRefError(null);

    async function fetchMetadata() {
      try {
        const apiUrl = `/api/external-file/reference/ref?url=${encodeURIComponent(fileUrl)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) {
          throw new Error(`Failed to retrieve reference metadata (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          if (data && data.success && data.metadata) {
            setRefMetadata(data.metadata);
          } else {
            throw new Error(data?.error || "Invalid metadata response");
          }
          setRefLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("[EXTERNAL VIEWER] Metadata fetch error:", err);
          setRefError(err?.message || "Unable to load reference metadata.");
          setRefLoading(false);
        }
      }
    }

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [fileUrl, isReferenceJson]);

  // Safety Safeguard: Uploaded Vercel Blob PDF -> Delegate directly to native PdfViewer
  const isUploadedBlobPdf = Boolean(
    fileUrl &&
      typeof fileUrl === "string" &&
      (fileUrl.includes("blob.vercel-storage.com") || fileUrl.includes("/api/blob-proxy")) &&
      !fileUrl.includes("/external-references/") &&
      (fileUrl.toLowerCase().includes(".pdf") || fileUrl.toLowerCase().includes("pdf"))
  );

  if (isUploadedBlobPdf) {
    return (
      <PdfViewer
        fileUrl={fileUrl}
        title={title}
        className={className}
        hideToolbar={hideToolbar}
        onControlsRender={onControlsRender}
      />
    );
  }

  // Safety Safeguard: Uploaded Vercel Blob PPT/PPTX -> Delegate directly to client PptViewer
  const isUploadedBlobPpt = Boolean(
    fileUrl &&
      typeof fileUrl === "string" &&
      (fileUrl.includes("blob.vercel-storage.com") || fileUrl.includes("/api/blob-proxy")) &&
      !fileUrl.includes("/external-references/") &&
      (fileUrl.toLowerCase().includes(".ppt") || fileUrl.toLowerCase().includes(".pptx"))
  );

  if (isUploadedBlobPpt) {
    return (
      <PptViewer
        fileUrl={fileUrl}
        title={title}
        className={className}
        hideToolbar={hideToolbar}
        onControlsRender={onControlsRender}
      />
    );
  }

  // Safety Safeguard: Uploaded Vercel Blob DOC/DOCX -> Delegate directly to client DocxViewer
  const isUploadedBlobDoc = Boolean(
    fileUrl &&
      typeof fileUrl === "string" &&
      (fileUrl.includes("blob.vercel-storage.com") || fileUrl.includes("/api/blob-proxy")) &&
      !fileUrl.includes("/external-references/") &&
      (fileUrl.toLowerCase().includes(".doc") || fileUrl.toLowerCase().includes(".docx"))
  );

  if (isUploadedBlobDoc) {
    return (
      <DocxViewer
        fileUrl={fileUrl}
        title={title}
        className={className}
        hideToolbar={hideToolbar}
        onControlsRender={onControlsRender}
      />
    );
  }

  if (!fileUrl || typeof fileUrl !== "string") {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-[#0B101D] p-6 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500" />
        <h4 className="text-sm font-bold text-white">No Document URL Provided</h4>
        <p className="text-xs text-slate-400">Please provide a valid document URL.</p>
      </div>
    );
  }

  // Loading state for metadata reference retrieval
  if (refLoading) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-[#0B101D] p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-xs font-bold text-slate-300">Loading document...</p>
      </div>
    );
  }

  // Error state if reference metadata retrieval failed
  if (refError) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-[#0B101D] p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h4 className="text-sm font-bold text-white">Unable to load document</h4>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{refError}</p>
      </div>
    );
  }

  // Resolve metadata: either from retrieved JSON reference, or via local resolver for direct URLs
  const resolved = refMetadata || resolveExternalFile(fileUrl);

  // 1. Direct PDF -> Existing PdfViewer (react-pdf canvas renderer)
  if (resolved.provider === "DIRECT_URL" && resolved.fileType === "PDF") {
    return (
      <PdfViewer
        fileUrl={resolved.viewerUrl || fileUrl}
        title={title}
        className={className}
        hideToolbar={hideToolbar}
        onControlsRender={onControlsRender}
      />
    );
  }

  // 2. Google Drive / Google Docs / Google Slides Embedded Preview
  if (resolved.provider === "GOOGLE_DRIVE" && resolved.viewerUrl) {
    const isDocs = resolved.viewerUrl.includes("docs.google.com/document");
    const isSlides = resolved.viewerUrl.includes("docs.google.com/presentation");

    let providerLabel = "Google Drive";
    if (isDocs) providerLabel = "Google Docs";
    if (isSlides) providerLabel = "Google Slides";

    return (
      <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-[#060913] ${className}`}>
        {/* Helper Action Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0B101D] px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-orange-400">{providerLabel}</span>
            <span className="text-slate-500 hidden sm:inline">• If preview is restricted by Google Account permissions, open directly:</span>
          </div>
          <a
            href={resolved.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 text-xs font-bold text-orange-400 transition"
          >
            <ExternalLink size={13} />
            <span>Open in {providerLabel}</span>
          </a>
        </div>

        {/* Loading Overlay */}
        {iframeLoading && !iframeError && (
          <div className="absolute inset-x-0 bottom-0 top-[49px] flex flex-col items-center justify-center gap-3 bg-[#060913]/90 z-20">
            <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
            <p className="text-xs font-bold text-slate-300">Loading document preview...</p>
          </div>
        )}

        {/* Clean LMS Error / Permission Fallback */}
        {iframeError ? (
          <div className="flex h-[480px] w-full flex-col items-center justify-center gap-4 p-8 text-center bg-[#060913]">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Google Drive preview unavailable</h4>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
                This file requires Google Drive access to view. You can open it directly in {providerLabel}.
              </p>
            </div>
            {resolved.sourceUrl && (
              <a
                href={resolved.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg"
              >
                <ExternalLink size={14} />
                <span>Open in {providerLabel}</span>
              </a>
            )}
          </div>
        ) : (
          <iframe
            src={resolved.viewerUrl}
            title={title}
            className="w-full h-[68vh] min-h-[480px] max-h-[850px] border-0 bg-[#060913]"
            onLoad={() => setIframeLoading(false)}
            onError={() => {
              setIframeLoading(false);
              setIframeError(true);
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // 3. Direct DOC/DOCX or PPT/PPTX (Public Web URLs)
  const isDocOrPpt =
    resolved.fileType === "DOC" ||
    resolved.fileType === "DOCX" ||
    resolved.fileType === "PPT" ||
    resolved.fileType === "PPTX";

  const targetUrl = resolved.viewerUrl || resolved.sourceUrl || fileUrl;
  const isLocalFile =
    targetUrl.includes("localhost") || targetUrl.includes("127.0.0.1");
  const isPrivateVercelBlob =
    targetUrl.includes("blob.vercel-storage.com") || targetUrl.includes("/api/blob-proxy");

  // Public DOC/DOCX files -> DocxViewer
  if (resolved.provider === "DIRECT_URL" && (resolved.fileType === "DOC" || resolved.fileType === "DOCX")) {
    return (
      <DocxViewer
        fileUrl={targetUrl}
        title={title}
        className={className}
        hideToolbar={hideToolbar}
        onControlsRender={onControlsRender}
      />
    );
  }

  if (resolved.provider === "DIRECT_URL" && isDocOrPpt && !isLocalFile && !isPrivateVercelBlob) {
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      targetUrl
    )}`;

    return (
      <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-[#060913] ${className}`}>
        {iframeLoading && !iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060913]/90 z-20 rounded-2xl">
            <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
            <p className="text-xs font-bold text-slate-300">Loading document preview...</p>
          </div>
        )}

        {iframeError ? (
          <div className="flex h-[480px] w-full flex-col items-center justify-center gap-4 p-8 text-center bg-[#060913]">
            <FileText className="h-12 w-12 text-slate-400 mb-1" />
            <h4 className="text-sm font-bold text-white mb-1">Document preview unavailable</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              Open the document in an external viewer to read its contents.
            </p>
            {resolved.sourceUrl && (
              <a
                href={resolved.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg"
              >
                <ExternalLink size={14} />
                <span>Open Document</span>
              </a>
            )}
          </div>
        ) : (
          <iframe
            src={officeViewerUrl}
            title={title}
            className="w-full h-[68vh] min-h-[480px] max-h-[850px] border-0 bg-[#060913] rounded-2xl"
            onLoad={() => setIframeLoading(false)}
            onError={() => {
              setIframeLoading(false);
              setIframeError(true);
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // 4. Fallback / Unsupported Document Format (Honest "Preview unavailable" state)
  return (
    <div className={`flex h-[480px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-[#060913] p-8 text-center ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
        <FileText size={28} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1">Document preview unavailable</h4>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
          This document format ({resolved.fileType || "file"}) cannot be rendered directly inside the viewer.
        </p>
      </div>
      {resolved.sourceUrl && (
        <a
          href={resolved.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg"
        >
          <ExternalLink size={14} />
          <span>Open Document</span>
        </a>
      )}
    </div>
  );
}
