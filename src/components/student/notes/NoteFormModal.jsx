"use client";

import { X, Loader2 } from "lucide-react";
import { NOTES_CATEGORIES } from "@/features/student/constants/notesConfig";

export default function NoteFormModal({ editingNote, form, setForm, saving, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 text-foreground">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-black text-foreground">{editingNote ? "Edit Note" : "New Note"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Note title..."
              required
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer [&>option]:bg-card [&>option]:text-foreground"
            >
              {NOTES_CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} className="bg-background">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your notes here..."
              rows={6}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border text-foreground text-sm font-semibold rounded-xl hover:bg-muted transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="flex-1 py-2 bg-primary hover:bg-orange-600 text-foreground text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingNote ? "Update Note" : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
