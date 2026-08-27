import { BookOpen, AlignLeft, StickyNote, Paperclip, HelpCircle, Star, ClipboardList } from "lucide-react";

// Mobile tab strip definition for the learning page — mirrors the desktop
// stacked sections 1:1, just presented one-at-a-time instead of all at once.
export const LEARN_PAGE_CONTENT_TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "transcript", label: "Transcript", icon: AlignLeft },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "resources", label: "Resources", icon: Paperclip },
  { id: "query", label: "Query", icon: HelpCircle },
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "quiz", label: "Quiz", icon: ClipboardList },
];
