"use client";

import { useState } from "react";
import { marked } from "marked";

export function ModuleCellComposer({
  module,
  moduleForm,
  setModuleForm,
  isEditingModule,
  setIsEditingModule,
  onSaveModuleMeta,
  isSavingModule,
  contents = [],
  onOpenAddCellModal,
  onOpenEditCellForm,
  onDeleteContent,
  onShiftContentOrder,
}) {
  const [activeSettingsCellId, setActiveSettingsCellId] = useState(null);

  if (!module) return null;

  const toggleSettingsDropdown = (cellId) => {
    setActiveSettingsCellId((prev) => (prev === cellId ? null : cellId));
  };

  const renderCellContent = (cell) => {
    const type = cell.type?.toLowerCase() || "text";
    const bodyText = cell.body || cell.text || cell.data || "";
    const mediaUrl = cell.url || cell.mediaURL || (cell.dataURLs && cell.dataURLs[0]) || "";

    if (type === "text" || type === "html" || type === "markdown") {
      return (
        <div
          className="markdown-preview text-xs text-slate-200 leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: marked.parse(bodyText || "*Empty markdown block*"),
          }}
        />
      );
    }

    if (type === "image") {
      const imgHtml = mediaUrl ? (
        <div className="text-center">
          <img src={mediaUrl} alt={cell.title || "Image block"} className="max-w-full rounded-xl border border-slate-800 shadow-sm mx-auto" />
        </div>
      ) : (
        <p className="text-slate-500 italic text-xs">No image URL configured.</p>
      );

      const parsedCaption = marked.parse(bodyText || "");

      return (
        <div className="space-y-3">
          {imgHtml}
          {bodyText && (
            <div
              className="markdown-preview text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: parsedCaption }}
            />
          )}
        </div>
      );
    }

    if (type === "video") {
      const isEmbed = mediaUrl && (mediaUrl.includes("youtube.com") || mediaUrl.includes("vimeo.com") || mediaUrl.includes("embed"));

      return (
        <div className="space-y-3">
          {isEmbed ? (
            <div className="flex flex-col items-center">
              <iframe
                src={mediaUrl}
                title={cell.title || "Video"}
                className="w-full max-w-2xl aspect-video rounded-xl border border-slate-800 bg-black"
                allowFullScreen
              />
            </div>
          ) : mediaUrl ? (
            <video src={mediaUrl} controls className="w-full max-h-96 rounded-xl border border-slate-800 bg-black" />
          ) : (
            <p className="text-slate-500 italic text-xs">No video URL configured.</p>
          )}

          {bodyText && (
            <div
              className="markdown-preview text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: marked.parse(bodyText) }}
            />
          )}
        </div>
      );
    }

    if (type === "quiz") {
      return (
        <div className="quiz-player-card bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Interactive Quiz
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{cell.title || "Concept Checkpoint Quiz"}</h4>
          <p className="text-xs text-slate-300">{bodyText || "Test your understanding of the concepts covered in this module."}</p>
        </div>
      );
    }

    if (type === "slideshow" || type === "presentation") {
      return (
        <div className="slideshow-player-card bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              Slideshow Deck
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{cell.title || "Module Slide Deck"}</h4>
          <p className="text-xs text-slate-300">{bodyText || "Interactive slide deck overview."}</p>
        </div>
      );
    }

    return (
      <div className="text-xs text-slate-300">
        <p className="font-semibold text-white mb-1">{cell.title}</p>
        <p>{bodyText}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in duration-200">
      {/* Module Header Card */}
      <div className="notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-md">
        <div className="cell-actions-left mb-3">
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)", textAlign: "center" }}>
            Module Meta
          </div>
        </div>

        <div className="cell-main space-y-3">
          <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="cell-badge rounded bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400">
              Module Header
            </span>
            <div className="cell-controls">
              <button
                className={`btn ${isEditingModule ? "btn-primary bg-orange-500 text-slate-950" : "btn-outline-primary border border-slate-800 text-slate-300 hover:text-white"} rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer`}
                onClick={() => setIsEditingModule(!isEditingModule)}
              >
                {isEditingModule ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          <div className="cell-render-area">
            {isEditingModule ? (
              <div className="space-y-3 text-xs">
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Module Title</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    value={moduleForm.title || ""}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Subtitle / Description</label>
                  <textarea
                    className="cell-textarea w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 resize-none"
                    rows={2}
                    value={moduleForm.subtitle || ""}
                    onChange={(e) => setModuleForm({ ...moduleForm, subtitle: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-xl border border-slate-800 px-3 py-1.5 text-xs text-slate-300"
                    onClick={() => setIsEditingModule(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-orange-600"
                    onClick={onSaveModuleMeta}
                    disabled={isSavingModule}
                  >
                    {isSavingModule ? "Saving..." : "Done"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-white">{module.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{module.subtitle || module.description || "No overview provided."}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Cells Notebook Nodes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
            Notebook Content Cells ({contents.length})
          </h3>

          <button
            className="btn btn-primary flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-1.5 transition shadow-sm cursor-pointer"
            onClick={() => onOpenAddCellModal(contents.length + 1)}
          >
            <span>+ Add Block</span>
          </button>
        </div>

        {contents.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/60 p-6 space-y-3">
            <p className="text-xs text-slate-400 font-bold">This module has no content cells yet.</p>
            <button
              className="btn btn-primary rounded-xl bg-orange-500 text-slate-950 font-black text-xs px-4 py-2"
              onClick={() => onOpenAddCellModal(1)}
            >
              + Add First Content Block
            </button>
          </div>
        ) : (
          contents.map((cell, idx) => {
            const isDropdownOpen = activeSettingsCellId === cell.id;

            return (
              <div
                key={cell.id}
                className="notebook-cell relative rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-md transition hover:border-slate-700"
                data-id={cell.id}
              >
                <div className="cell-main">
                  {/* Settings Gear Toolbar matching PageComponents.js CellNode.render() */}
                  <div className="cell-settings-container absolute top-3 right-3 z-30">
                    <button
                      className="btn-settings-toggle flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                      onClick={() => toggleSettingsDropdown(cell.id)}
                      title="Actions"
                    >
                      ⚙
                    </button>

                    {/* Cell Settings Dropdown */}
                    {isDropdownOpen && (
                      <div className="cell-settings-dropdown absolute right-0 top-10 w-44 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-40 space-y-1 text-xs text-slate-200">
                        <button
                          className="btn-dropdown-action w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer"
                          onClick={() => {
                            toggleSettingsDropdown(cell.id);
                            onOpenEditCellForm(cell);
                          }}
                        >
                          <span>✏️</span> <span>Edit</span>
                        </button>

                        <button
                          className="btn-dropdown-action w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer"
                          onClick={() => {
                            toggleSettingsDropdown(cell.id);
                            onOpenAddCellModal(idx + 1);
                          }}
                        >
                          <span>➕</span> <span>Add Block</span>
                        </button>

                        <hr className="border-slate-800 my-1" />

                        <button
                          className="btn-dropdown-action w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer disabled:opacity-30"
                          disabled={idx === 0}
                          onClick={() => {
                            toggleSettingsDropdown(cell.id);
                            onShiftContentOrder(cell, "up");
                          }}
                        >
                          <span>⬆️</span> <span>Move Up</span>
                        </button>

                        <button
                          className="btn-dropdown-action w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer disabled:opacity-30"
                          disabled={idx === contents.length - 1}
                          onClick={() => {
                            toggleSettingsDropdown(cell.id);
                            onShiftContentOrder(cell, "down");
                          }}
                        >
                          <span>⬇️</span> <span>Move Down</span>
                        </button>

                        <hr className="border-slate-800 my-1" />

                        <button
                          className="btn-dropdown-action btn-delete w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 text-red-400 text-left transition cursor-pointer"
                          onClick={() => {
                            toggleSettingsDropdown(cell.id);
                            onDeleteContent(cell.id);
                          }}
                        >
                          <span>🗑️</span> <span>Delete Block</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cell Render Area */}
                  <div className="cell-render-area pt-2">
                    {renderCellContent(cell)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Add Block Action */}
        {contents.length > 0 && (
          <div className="pt-2">
            <button
              className="btn btn-outline-primary w-full py-2.5 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-orange-500 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
              onClick={() => onOpenAddCellModal(contents.length + 1)}
            >
              <span className="text-sm font-bold">+</span> Add Content Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
