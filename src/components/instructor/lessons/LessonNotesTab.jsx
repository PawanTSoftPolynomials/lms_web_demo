'use client';

import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Clock, Check, FileText, Loader2 } from 'lucide-react';

import {
  useCreateLessonNote,
  useDeleteLessonNote,
  useLessonNotes,
  useUpdateLessonNote,
} from '@/hooks/queries/instructor/useLessonNotes';

export default function LessonNotesTab({ lessonId, videoCurrentTime, onSeekVideo }) {
  const { data: notes = [], isLoading } = useLessonNotes(lessonId);
  const createNote = useCreateLessonNote();
  const updateNote = useUpdateLessonNote(lessonId);
  const deleteNote = useDeleteLessonNote(lessonId);

  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const formatTime = (secs) => {
    const m = Math.floor((secs || 0) / 60);
    const s = Math.floor((secs || 0) % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    createNote.mutate(
      {
        lessonId,
        content: newNoteText.trim(),
        timestampSeconds: Math.floor(videoCurrentTime || 0),
      },
      { onSuccess: () => setNewNoteText('') }
    );
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    updateNote.mutate(
      { noteId: id, payload: { content: editText.trim() } },
      { onSuccess: () => { setEditingId(null); setEditText(''); } }
    );
  };

  const handleDelete = (id) => {
    deleteNote.mutate(id);
  };

  const filteredNotes = notes.filter((n) =>
    (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Search Input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search lesson notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#05070E] border border-[#1A1F35] text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-orange-500/50 transition"
        />
      </div>

      {/* Add New Note Box */}
      <form onSubmit={handleAddNote} className="space-y-2 bg-white/[0.01] border border-[#1A1F35] rounded-xl p-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-black">
          <span>Add Timestamped Note</span>
          <span className="text-orange-400 font-mono">@ {formatTime(videoCurrentTime || 0)}</span>
        </div>
        <textarea
          rows={2}
          placeholder="Write a private note or reminder for this lesson..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          className="w-full bg-[#05070E] border border-[#1A1F35] text-xs text-slate-200 placeholder-slate-500 rounded-lg p-2 outline-none focus:border-orange-500/50 transition resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newNoteText.trim() || createNote.isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 font-black text-[11px] transition shadow-md cursor-pointer"
          >
            {createNote.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            <span>Save Note</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">
            <Loader2 size={20} className="mx-auto animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <FileText size={24} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No notes found.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="p-3 rounded-xl bg-[#05070E] border border-[#1A1F35] space-y-2 group transition hover:border-slate-700">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSeekVideo?.(note.timestampSeconds)}
                  className="flex items-center gap-1.5 text-[10px] font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md hover:bg-orange-500/20 transition cursor-pointer"
                  title="Jump video to timestamp"
                >
                  <Clock size={11} />
                  <span>{formatTime(note.timestampSeconds)}</span>
                </button>
                <span className="text-[9px] text-slate-500 font-mono">{formatDate(note.createdAt)}</span>
              </div>

              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-[#0D1021] border border-orange-500/40 text-xs text-white p-2 rounded-lg outline-none"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-2 py-1 text-[10px] font-black bg-emerald-500 text-slate-950 rounded flex items-center gap-1"
                    >
                      <Check size={10} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{note.content}</p>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-[#1A1F35]/40 opacity-70 group-hover:opacity-100 transition">
                <button
                  onClick={() => {
                    setEditingId(note.id);
                    setEditText(note.content);
                  }}
                  className="text-slate-400 hover:text-white text-[10px] flex items-center gap-0.5"
                >
                  <Edit3 size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-0.5"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
