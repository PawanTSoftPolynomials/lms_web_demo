"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  FolderOpen,
  Trash2,
  Star,
  Search,
  Plus,
  BookOpen,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useToggleNoteStar,
  useDeleteNote,
} from "@/hooks/queries/student/useNotes";

const CATEGORIES = ["All", "General", "JavaScript", "React", "Database", "Operating Systems", "Python", "Algorithms", "Other"];

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showStarred, setShowStarred] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", category: "General" });
  const [saving, setSaving] = useState(false);

  // Real API hooks
  const { data: notes = [], isLoading, isError } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const toggleStar = useToggleNoteStar();
  const deleteNote = useDeleteNote();

  const categories = useMemo(() => {
    const cats = new Set(notes.map((n) => n.category).filter(Boolean));
    return ["All", ...cats];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || note.category === categoryFilter;
      const matchesStarred = !showStarred || note.starred;
      return matchesSearch && matchesCategory && matchesStarred;
    });
  }, [notes, searchQuery, categoryFilter, showStarred]);

  const openAddModal = () => {
    setEditingNote(null);
    setForm({ title: "", content: "", category: "General" });
    setShowModal(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content || "", category: note.category || "General" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingNote) {
        await updateNote.mutateAsync({ noteId: editingNote.id, payload: form });
      } else {
        await createNote.mutateAsync(form);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStar = async (noteId) => {
    try { await toggleStar.mutateAsync(noteId); } catch {}
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Delete this note?")) return;
    try { await deleteNote.mutateAsync(noteId); } catch {}
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Notes</h1>
          <p className="text-xs text-slate-400 mt-1">{notes.length} notes saved</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
        >
          <Plus size={15} /> New Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition cursor-pointer"
        >
          {categories.map((c) => <option key={c} className="bg-slate-950">{c}</option>)}
        </select>

        <button
          onClick={() => setShowStarred(!showStarred)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
            showStarred 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
              : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-amber-500/50"
          }`}
        >
          <Star size={14} className={showStarred ? "fill-amber-500 text-amber-500" : ""} />
          Starred
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading notes…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-red-500 gap-2 text-sm">
          <AlertCircle size={18} /> Failed to load notes. Please refresh.
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <FileText size={40} className="mx-auto mb-3 opacity-40 text-slate-400" />
          <p className="text-sm font-semibold text-white">No notes found</p>
          <p className="text-xs mt-1 text-slate-400">Create your first note to get started.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-650 transition cursor-pointer"
          >
            Add Note
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md hover:border-orange-500/40 transition group cursor-pointer"
              onClick={() => openEditModal(note)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg">
                    <FileText size={14} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                    {note.category || "General"}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleStar(note.id)}
                    className="p-1 hover:bg-amber-500/10 rounded-lg transition text-slate-400 hover:text-amber-500"
                  >
                    <Star size={14} className={note.starred ? "fill-amber-500 text-amber-500" : ""} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 hover:bg-red-500/10 rounded-lg transition text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-black text-white mb-2 leading-snug line-clamp-2">{note.title}</h3>
              {note.content && (
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{note.content}</p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-[9px] font-semibold text-slate-400">
                  {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {note.starred && <Star size={12} className="fill-amber-500 text-amber-500" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 text-white">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-black text-white">{editingNote ? "Edit Note" : "New Note"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} className="bg-slate-950">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your notes here..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
