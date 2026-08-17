"use client";

import { useState, useEffect } from "react";
import { UploadButton } from "@/components/instructor/courses/UploadButton";

export function DynamicEditFormModal({
  isOpen,
  onClose,
  title = "Edit Properties",
  cellData,
  onSave,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "",
    type: "HTML",
  });

  useEffect(() => {
    if (cellData) {
      setFormData({
        title: cellData.title || "",
        body: cellData.body || cellData.text || cellData.data || "",
        url: cellData.url || cellData.mediaURL || (cellData.dataURLs && cellData.dataURLs[0]) || "",
        type: cellData.type || "HTML",
      });
    }
  }, [cellData]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay flex items-center justify-center fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 animate-fade-in">
      <div className="modal-container glass-card w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 text-slate-200" id="formPopupModal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="modal-title text-lg font-bold text-white" id="formPopupModalTitle">
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="space-y-4 text-xs" id="formPopupModalContent">
          <div className="form-group">
            <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Block Title
            </label>
            <input
              type="text"
              className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Data / Content Body (Markdown Supported)
            </label>
            <textarea
              className="cell-textarea w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 resize-none font-mono"
              rows={6}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            />
          </div>

          {(formData.type === "IMAGE" || formData.type === "VIDEO" || formData.type === "DOCUMENT" || formData.type === "LINK" || formData.type === "SLIDESHOW" || formData.type === "CHART") && (
            <div className="form-group space-y-1">
              <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Media / Resource URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="cell-input flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
                  placeholder="https://... or click Upload"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <UploadButton
                  onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, url }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-xl border border-slate-800 px-4 py-2 text-xs text-slate-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn rounded-xl bg-orange-500 px-5 py-2 text-xs font-black text-slate-950 hover:bg-orange-600 shadow-md"
            onClick={() => onSave(formData)}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
