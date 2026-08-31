"use client";

import { HelpCircle, ChevronRight } from "lucide-react";
import useFindOrCreateDirectConversation from "@/features/chat/hooks/useFindOrCreateDirectConversation";

// "Ask Instructor" entry point — opens the existing 1:1 conversation with
// this course's instructor if one exists, otherwise creates it, and opens
// the chat widget on it.
export default function AskInstructorCard({ course, setIsOpen }) {
  const { findOrCreateDirectConversation } = useFindOrCreateDirectConversation();

  const handleAskInstructor = async () => {
    const instId = course?.creatorId || course?.creator?.id || course?.creator?._id;
    if (!instId) {
      console.warn("Instructor ID not found for this course.");
      return;
    }

    try {
      await findOrCreateDirectConversation({
        participantId: instId,
        courseId: course.id,
        name: course?.creator?.name || "Instructor",
      });
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to auto-create conversation with instructor:", err);
    }
  };

  return (
    <button
      onClick={handleAskInstructor}
      className="w-full p-4 sm:p-5 rounded-3xl border border-border bg-background/50 hover:bg-background/80 hover:border-primary/40 transition duration-300 group cursor-pointer text-left shadow-lg relative overflow-hidden min-h-[44px]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-amber-500/20 bg-amber-500/10 text-amber-400 shrink-0">
            <HelpCircle size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-foreground group-hover:text-foreground transition truncate">Ask Instructor</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">Instructor Active • Avg response &lt; 2 hrs</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-[10px] text-muted-foreground font-bold flex-wrap">
        <span>Direct Q&amp;A Chat</span>
      </div>
    </button>
  );
}
