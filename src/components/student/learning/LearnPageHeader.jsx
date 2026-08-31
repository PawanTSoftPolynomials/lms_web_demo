"use client";

import { MessageSquare, PanelLeftOpen } from "lucide-react";
import { FaSignOutAlt } from "react-icons/fa";
import { NotificationsMenu } from "@/components/layouts/NavUserMenus";

// Sticky top bar for the learning workspace — course-map toggle, current
// lesson title, chat/notifications/logout. Deliberately lighter than the
// shared dashboard Navbar (no breadcrumbs/profile menu/sidebar toggle):
// this is the immersive learning workspace, not a standard dashboard page.
export default function LearnPageHeader({
  courseSidebarOpen,
  onOpenSidebar,
  selectedLesson,
  course,
  chatOpen,
  chatUnreadCount,
  onToggleChat,
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationItemClick,
  onLogout,
}) {
  return (
    <header className="sticky top-0 bg-[#07080f]/80 backdrop-blur-md border-b border-[#1e2030]/40 py-3 px-4 sm:px-6 flex items-center justify-between z-30 select-none">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {!courseSidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden xl:flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-background text-primary shadow-md transition hover:bg-primary/10 hover:border-primary hover:text-orange-300 cursor-pointer"
            aria-label="Show course map"
            title="Show course map"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate block">
            LEARNING WORKSPACE
          </span>
          <h2 className="text-sm font-bold text-foreground truncate">
            {selectedLesson ? `Lesson: ${selectedLesson.title}` : course?.title || "Course Overview"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
        {/* Messages button */}
        <button
          onClick={onToggleChat}
          className={`p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition relative flex items-center justify-center border-0 cursor-pointer outline-none ${
            chatOpen
              ? "bg-muted text-primary"
              : "bg-background/60 hover:bg-muted text-foreground hover:text-foreground"
          }`}
          title="Messages"
        >
          <MessageSquare size={16} />
          {chatUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-foreground shadow-[0_0_8px_rgba(249,115,22,0.4)]">
              {chatUnreadCount}
            </span>
          )}
        </button>

        {/* Notifications */}
        <NotificationsMenu
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={onMarkAllRead}
          onItemClick={onNotificationItemClick}
        />

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-foreground transition p-2.5 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center cursor-pointer outline-none"
          title="Sign Out"
        >
          <FaSignOutAlt size={14} />
        </button>
      </div>
    </header>
  );
}
