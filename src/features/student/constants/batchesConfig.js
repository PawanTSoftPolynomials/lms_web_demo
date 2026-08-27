import { LayoutGrid, Calendar, Megaphone, ClipboardList, FolderOpen, MessageSquare, Users } from "lucide-react";

export const BATCHES_PAGE_SIZE = 6;

export const BATCH_WORKSPACE_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "classmates", label: "Classmates", icon: Users },
];
