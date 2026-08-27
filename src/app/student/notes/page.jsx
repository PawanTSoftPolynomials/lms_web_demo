"use client";

import { useState, useMemo } from "react";
import { FileText, Star, Search, Plus, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/layouts/PageHeader";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useToggleNoteStar,
  useDeleteNote,
} from "@/hooks/queries/student/useNotes";
import { useConfirm } from "@/context/ConfirmContext";
import NoteCard from "@/components/student/notes/NoteCard";
import NoteFormModal from "@/components/student/notes/NoteFormModal";

export default function NotesPage() {
  const confirm = useConfirm();
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
    try {
      await toggleStar.mutateAsync(noteId);
    } catch {}
  };

  const handleDelete = async (noteId) => {
    const confirmed = await confirm({
      title: "Delete Note",
      message: "Are you sure you want to delete this note?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    try {
      await deleteNote.mutateAsync(noteId);
    } catch {}
  };

  return (
    <div className="space-y-6 text-white">
      <PageHeader
        title="My Notes"
        subtitle={`${notes.length} notes saved`}
      >
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
        >
          <Plus size={15} /> New Note
        </button>
      </PageHeader>

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
            <NoteCard
              key={note.id}
              note={note}
              onOpen={openEditModal}
              onToggleStar={handleToggleStar}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <NoteFormModal
          editingNote={editingNote}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
