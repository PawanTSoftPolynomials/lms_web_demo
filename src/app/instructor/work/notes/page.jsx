"use client";

import { useRef, useState } from "react";
import { Edit3, Trash2, Save, Loader2, StickyNote } from "lucide-react";

import Card from "@/components/ui/Card";
import CourseModuleLessonSelect from "@/components/instructor/work/CourseModuleLessonSelect";
import NotesEditor from "@/components/instructor/NotesEditor";
import {
  useLessonNotes,
  useCreateLessonNote,
  useUpdateLessonNote,
  useDeleteLessonNote,
} from "@/hooks/queries/instructor/useLessonNotes";

export default function WorkNotesPage() {
  const [selection, setSelection] = useState({ courseId: "", moduleId: "", lessonId: "" });
  const { lessonId } = selection;

  const { data: notes = [], isLoading } = useLessonNotes(lessonId);
  const createNote = useCreateLessonNote();
  const updateNote = useUpdateLessonNote(lessonId);
  const deleteNote = useDeleteLessonNote(lessonId);

  const editorRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleSave = (status) => {
    const html = editorRef.current?.getHtml() || "";
    if (!html.trim()) return;

    const payload = { lessonId, content: html, attachments, status };

    if (editingId) {
      updateNote.mutate(
        { noteId: editingId, payload: { content: html, attachments, status } },
        { onSuccess: reset }
      );
    } else {
      createNote.mutate(payload, { onSuccess: reset });
    }
  };

  const reset = () => {
    setAttachments([]);
    setEditingId(null);
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setAttachments(note.attachments || []);
  };

  const isSaving = createNote.isPending || updateNote.isPending;

  return (
    <Card className="mx-auto max-w-5xl bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
      <div>
        <h1 className="sr-only">Notes</h1>
        <p className="sr-only">Write private lesson notes with rich formatting, images, and file attachments.</p>
      </div>

      <CourseModuleLessonSelect
        courseId={selection.courseId}
        moduleId={selection.moduleId}
        lessonId={selection.lessonId}
        onChange={setSelection}
      />

      {!lessonId ? (
        <div className="rounded-2xl border border-dashed border-border bg-[#05070E] py-16 text-center">
          <p className="text-xs font-bold text-muted-foreground">Select a Course, Module, and Lesson above to write notes.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-border bg-[#05070E] p-5 space-y-4">
            <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">
              {editingId ? "Edit Note" : "New Note"}
            </h3>
            <NotesEditor
              key={editingId || "new"}
              ref={editorRef}
              initialHtml={editingId ? notes.find((n) => n.id === editingId)?.content || "" : ""}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
            <div className="flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-foreground border border-transparent hover:text-foreground hover:bg-muted transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-foreground bg-primary hover:bg-orange-600 shadow-sm transition disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-[#05070E] p-5 space-y-3">
            <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">
              Notes for this Lesson ({notes.length})
            </h3>
            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 size={18} className="animate-spin text-orange-450" /></div>
            ) : notes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <StickyNote size={22} className="mx-auto text-slate-600" />
                <p className="text-xs font-bold">No notes for this lesson yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl border border-border bg-white/[0.015] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        note.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-transparent"
                      }`}>
                        {note.status || "DRAFT"}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-foreground leading-relaxed [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: note.content }} />
                    <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
                      <button onClick={() => startEdit(note)} className="text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-1">
                        <Edit3 size={11} /> Edit
                      </button>
                      <button onClick={() => deleteNote.mutate(note.id)} className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
