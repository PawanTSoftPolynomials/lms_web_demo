import { StickyNote, HelpCircle, Star } from "lucide-react";

// Mobile tab strip definition for the learning page — mirrors the desktop
// stacked sections 1:1, just presented one-at-a-time instead of all at once.
// Overview/Transcript/Resources/Quiz were dropped from both (redundant with
// the content player, sidebar tree, and inline quiz experience).
export const LEARN_PAGE_CONTENT_TABS = [
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "query", label: "Query", icon: HelpCircle },
  { id: "feedback", label: "Feedback", icon: Star },
];
