"use client";

import { useState } from "react";

const CELL_TYPE_OPTIONS = [
  { id: "HTML", label: "Markdown", icon: "📝" },
  { id: "IMAGE", label: "Image", icon: "🖼️" },
  { id: "VIDEO", label: "Video", icon: "🎬" },
  { id: "QUIZ", label: "Quiz", icon: "❓" },
  { id: "SLIDESHOW", label: "Slideshow", icon: "📊" },
  { id: "CHART", label: "Chart", icon: "📈" },
];

export function AddCellTypeModal({
  isOpen,
  onClose,
  onConfirmAddCell,
  position = "below",
  setPosition,
}) {
  const [selectedType, setSelectedType] = useState("HTML");

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay flex items-center justify-center fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 animate-fade-in"
      id="addCellModal"
    >
      <div className="glass-card modal-container w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 text-slate-200">
        <div>
          <h3 className="modal-title text-lg font-bold text-white mb-1" id="addCellModalTitle">
            Add New Content Cell
          </h3>
          <p className="modal-subtitle text-xs text-slate-400" id="addCellModalSubtitle">
            Choose the block type to insert.
          </p>
        </div>

        {/* Cell Type Grid matching composerV2.html */}
        <div className="form-group space-y-2">
          <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Select Cell Type
          </label>
          <div className="cell-type-grid grid grid-cols-3 gap-2.5" id="addCellGridContainer">
            {CELL_TYPE_OPTIONS.map((opt) => {
              const isSelected = selectedType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedType(opt.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    isSelected
                      ? "border-orange-500 bg-orange-500/15 text-orange-400 font-bold"
                      : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300"
                  }`}
                >
                  <span className="text-xl mb-1">{opt.icon}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Insert Position Dropdown */}
        <div className="form-group space-y-1.5">
          <label className="cell-field-label block text-[10px] font-black uppercase tracking-wider text-slate-400" htmlFor="addCellPosition">
            Insert Position
          </label>
          <select
            className="cell-select w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500 cursor-pointer"
            id="addCellPosition"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="below">Below current cell</option>
            <option value="above">Above current cell</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            className="btn rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
            id="cancelAddCellBtn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-5 py-2 transition shadow-md cursor-pointer"
            id="confirmAddCellBtn"
            onClick={() => onConfirmAddCell(selectedType, position)}
          >
            Add Cell
          </button>
        </div>
      </div>
    </div>
  );
}
