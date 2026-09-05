"use client";

import { FileText, Trash2, Star } from "lucide-react";

export default function NoteCard({ note, onOpen, onToggleStar, onDelete }) {
  return (
    <div
      className="bg-background/50 border border-border/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md hover:border-primary/40 transition group cursor-pointer"
      onClick={() => onOpen(note)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <FileText size={14} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {note.category || "General"}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleStar(note.id)}
            aria-label={note.starred ? "Remove from favorites" : "Add to favorites"}
            className="p-1 hover:bg-amber-500/10 rounded-lg transition text-muted-foreground hover:text-amber-500"
          >
            <Star size={14} className={note.starred ? "fill-amber-500 text-amber-500" : ""} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            aria-label="Delete note"
            className="p-1 hover:bg-red-500/10 rounded-lg transition text-muted-foreground hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-black text-foreground mb-2 leading-snug line-clamp-2">{note.title}</h3>
      {note.content && (
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{note.content}</p>
      )}

      <div className="mt-4 pt-3 border-t border-border/80 flex justify-between items-center">
        <span className="text-[9px] font-semibold text-muted-foreground">
          {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        {note.starred && <Star size={12} className="fill-amber-500 text-amber-500" />}
      </div>
    </div>
  );
}
