"use client";

import { useEffect, useState } from "react";
import { StickyNote, Save } from "lucide-react";

import Button from "@/components/ui/Button";

export default function LessonNotes({
                                        lesson,
                                    }) {
    const storageKey = lesson
        ? `lesson-notes-${lesson.id}`
        : null;

    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!storageKey) {
            setNotes("");
            return;
        }

        const savedNotes =
            localStorage.getItem(storageKey);

        setNotes(savedNotes || "");
    }, [storageKey]);

    const saveNotes = () => {
        if (!storageKey) return;

        localStorage.setItem(
            storageKey,
            notes
        );
    };

    if (!lesson) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <StickyNote className="mx-auto h-12 w-12 text-slate-600" />

                <h2 className="mt-4 text-xl font-semibold text-white">
                    No Lesson Selected
                </h2>

                <p className="mt-2 text-slate-400">
                    Select a lesson to start taking notes.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                        <StickyNote className="h-6 w-6 text-orange-500" />
                        My Notes
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Notes for: {lesson.title}
                    </p>
                </div>

                <Button
                    onClick={saveNotes}
                    className="flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save Notes
                </Button>
            </div>

            {/* Editor */}
            <div className="p-6">
        <textarea
            value={notes}
            onChange={(e) =>
                setNotes(e.target.value)
            }
            placeholder="Write your notes here..."
            rows={16}
            className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            p-4
            text-white
            outline-none
            transition
            focus:border-orange-500
            resize-none
          "
        />

                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Notes are stored locally in your browser.
          </span>

                    <span>
            {notes.length} characters
          </span>
                </div>
            </div>
        </div>
    );
}