'use client';

import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Clock, Check, FileText } from 'lucide-react';

export default function LessonNotesTab({ lessonId, videoCurrentTime, onSeekVideo }) {
  const [notes, setNotes] = useState([
    {
      id: 'n1',
      timestamp: '04:15',
      timeSeconds: 255,
      content: 'Important explanation of Servlet Request lifecycle and thread pool allocation.',
      createdAt: 'Jul 23, 2026'
    },
    {
      id: 'n2',
      timestamp: '12:30',
      timeSeconds: 750,
      content: 'Remember to emphasize the distinction between doGet and doPost methods during live session.',
      createdAt: 'Jul 22, 2026'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const timeSec = Math.floor(videoCurrentTime || 0);
    const newNote = {
      id: `n_${Date.now()}`,
      timestamp: formatTime(timeSec),
      timeSeconds: timeSec,
      content: newNoteText.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleSaveEdit = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content: editText } : n));
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n =>
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
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
            disabled={!newNoteText.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 font-black text-[11px] transition shadow-md cursor-pointer"
          >
            <Plus size={13} />
            <span>Save Note</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredNotes.length === 0 ? (
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
                  onClick={() => onSeekVideo?.(note.timeSeconds)}
                  className="flex items-center gap-1.5 text-[10px] font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md hover:bg-orange-500/20 transition cursor-pointer"
                  title="Jump video to timestamp"
                >
                  <Clock size={11} />
                  <span>{note.timestamp}</span>
                </button>
                <span className="text-[9px] text-slate-500 font-mono">{note.createdAt}</span>
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
