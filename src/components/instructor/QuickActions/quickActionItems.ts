import {
  FolderPlus,
  Megaphone,
  Plus,
  UploadCloud,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface QuickActionItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  shortcut?: string;
  actionType?: 'create-lesson' | 'upload-content';
}

export const QUICK_ACTION_ITEMS: QuickActionItem[] = [
  { label: "Create Course", href: "/instructor/courses/create", icon: Plus },
  { label: "Upload Content", actionType: "upload-content", icon: UploadCloud },
  { label: "Create Quiz", href: "/instructor/quizzes/create", icon: FolderPlus },
  { label: "Import Questions", href: "/instructor/questions/upload", icon: UploadCloud },
  { label: "Make Announcement", href: "/instructor/announcements", icon: Megaphone },
  { label: "Schedule Live Class", href: "/instructor/calendar", icon: Video },
];
