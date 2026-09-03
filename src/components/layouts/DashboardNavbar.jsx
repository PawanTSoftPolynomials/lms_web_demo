"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import { PiOrangeDuotone } from "react-icons/pi";
import { MessageSquare, Menu } from "lucide-react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import { useNotification } from "@/context/NotificationContext";
import { useStudentNavDrawer } from "@/context/StudentNavDrawerContext";
import { useInstructorNavDrawer } from "@/context/InstructorNavDrawerContext";
import { useAdminNavDrawer } from "@/context/AdminNavDrawerContext";
import Modal from "@/components/ui/Modal";
import MiniCalendar from "@/components/dashboard/MiniCalendar";

import GlobalSearch from "@/components/layouts/GlobalSearch";
import { NotificationsMenu, ProfileMenu } from "@/components/layouts/NavUserMenus";
import { NavigationStrip } from "@/components/instructor/NavigationStrip/NavigationStrip";
import StudentDashboardNav from "@/components/layouts/StudentDashboardNav";

function ProfileDropdown({ user, onLogoutRequest, role }) {
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";
  const profileHref = isAdmin ? "/admin/profile" : "/instructor/profile";
  const settingsHref = isAdmin ? "/admin/profile" : "/instructor/settings";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
          open
            ? "bg-[#1A1F35] border-slate-700 text-slate-100"
            : "bg-[#0D1021] border-[#1A1F35] text-slate-400 hover:text-slate-100 hover:border-slate-800"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[9px] font-black font-mono shrink-0">
          {user?.name?.[0]?.toUpperCase() || (isAdmin ? 'A' : 'I')}
        </span>
        <span className="hidden md:inline truncate max-w-[80px]">{user?.name || "Profile"}</span>
        <span className="hidden md:inline text-[9px] text-slate-550 shrink-0">▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-44 rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-[#1A1F35] mb-1">
              <p className="text-[10px] font-black text-slate-200 truncate">{user?.name}</p>
              <p className="text-[8.5px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-100 hover:bg-[#1A1F35] rounded-xl transition"
            >
              👤 My Profile
            </Link>
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-100 hover:bg-[#1A1F35] rounded-xl transition"
            >
              ⚙ Settings
            </Link>
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-100 hover:bg-[#1A1F35] rounded-xl transition"
            >
              🛟 Help & Support
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onLogoutRequest();
              }}
              className="w-full text-left flex items-center px-3 py-2 text-[10px] font-black text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
            >
              🚪 Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function Navbar({ setOpen, role }) {
  const router = useRouter();
  const { logout, user: currentUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { open: openStudentNavDrawer } = useStudentNavDrawer();
  const { open: openInstructorNavDrawer } = useInstructorNavDrawer();
  const { open: openAdminNavDrawer } = useAdminNavDrawer();

  const pathname = usePathname();
  const {
    conversations = [], 
    setConversations,
    messages = [], 
    isOpen, 
    setIsOpen, 
    activeConversation, 
    setActiveConversation,
    toggleChat,
    unreadCount: chatUnreadCount
  } = useChat();

  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAllRead, clearAll, markAsRead, addNotification } = useNotification();
  const [isMounted, setIsMounted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Client-side initialization to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen to new messages in all background conversations
  useEffect(() => {
    if (!isMounted || !conversations || conversations.length === 0) return;
    
    conversations.forEach((conv) => {
      if (conv.unread > 0 && conv.lastMessage) {
        const lastMsgText = conv.lastMessage;
        const notifId = `conv_${conv.id}_${lastMsgText.substring(0, 10)}`;
        
        // Don't show notification if we are actively focused on this conversation
        const isFocused = isOpen && activeConversation && activeConversation.id === conv.id;
        if (isFocused) return;
        
        const alreadyExists = notifications.some((n) => n.id === notifId);
        if (!alreadyExists) {
          addNotification(
            `New message from ${conv.name || "User"}`,
            lastMsgText,
            "chat",
            ""
          );
        }
      }
    });
  }, [conversations, isMounted, isOpen, activeConversation, notifications, addNotification]);

  // Listen to new messages in the currently active conversation
  useEffect(() => {
    if (!isMounted || !messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    const currentUserId = currentUser?.id || currentUser?._id;
    const msgSenderId = lastMsg.senderId || lastMsg.sender?._id || lastMsg.sender?.id;
    const isMine = lastMsg.sender === "me" || lastMsg.senderId === "me" || (currentUserId && msgSenderId && msgSenderId === currentUserId);
    
    // Don't show notification if the chat widget is open and focused on this conversation
    const isFocused = isOpen && activeConversation && (activeConversation.id === lastMsg.conversationId || lastMsg.conversationId === undefined);
    
    if (lastMsg && !isMine && !isFocused) {
      const notifId = `msg_${lastMsg.id || lastMsg._id || Date.now()}`;
      const alreadyExists = notifications.some((n) => n.id === notifId);
      
      if (!alreadyExists) {
        addNotification(
          `New message from ${lastMsg.sender?.name || "User"}`,
          lastMsg.text || lastMsg.content || "Sent a message.",
          "chat",
          ""
        );
      }
    }
  }, [messages, currentUser, isMounted, isOpen, activeConversation, notifications, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleToggleRead = (id) => {
    markAsRead(id);
  };

  // Process notifications clicks: route to relevant page or open chat instantly
  const handleNotificationClick = (n) => {
    handleToggleRead(n.id);
    setShowNotifications(false);

    if (n.type === "chat") {
      const targetConvId = n.conversationId;
      if (targetConvId) {
        const found = conversations.find((c) => c.id === targetConvId);
        if (found) {
          setActiveConversation(found);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === found.id ? { ...c, unread: 0 } : c
            )
          );
        } else {
          // If not in standard list, set a baseline conversation structure
          setActiveConversation({ id: targetConvId, name: n.title.replace("New message from ", "") });
        }
      }
      setIsOpen(true);
    } else if (n.type === "quiz") {
      router.push(currentUser?.role === "INSTRUCTOR" ? "/instructor/quizzes" : "/student/quizzes");
    } else if (n.type === "course") {
      router.push(
        currentUser?.role === "INSTRUCTOR"
          ? "/instructor/courses"
          : currentUser?.role === "ADMIN"
          ? "/admin/courses"
          : "/student/courses"
      );
    }
  };

  if (role === 'INSTRUCTOR' || role === 'ADMIN') {
    const dashboardHref = role === 'ADMIN' ? '/admin/dashboard' : '/instructor/dashboard';
    const openRoleNavDrawer = role === 'ADMIN' ? openAdminNavDrawer : openInstructorNavDrawer;
    return (
      <>
      <header
        className="glass-nav sticky top-0 z-30 px-6 py-3 flex items-center gap-4 text-white"
      >
        <div className="flex items-center gap-6 shrink-0">
          {/* Mobile menu toggle — opens the role's nav drawer (see
              Instructor/AdminNavDrawer); this used to call the unrelated
              `setOpen` prop, which controls a Sidebar that never renders for
              these roles, so the button silently did nothing on mobile. */}
          <button
            type="button"
            onClick={openRoleNavDrawer}
            aria-label="Open navigation menu"
            className="sm:hidden text-xl text-white mr-1"
          >
            <FaBars />
          </button>

          {/* Logo */}
          <Link href={dashboardHref} className="flex items-center gap-2 font-black text-white hover:opacity-90">
            <span className="text-2xl text-orange-500">🍊</span>
            <div className="flex flex-col">
              <span className="text-sm tracking-wider font-extrabold text-orange-500 leading-none">ORANGE TREE</span>
              <span className="text-[9px] text-slate-400 font-medium">Learn. Grow. Succeed.</span>
            </div>
          </Link>

        </div>

        {/* Primary nav — moved in from the strip that used to sit below this
            bar (mobile nav is still handled separately by InstructorBottomNav).
            `bare` renders the items as plain flex children with no pill-strip
            chrome of their own, scrolling horizontally if they don't fit. */}
        {role === 'INSTRUCTOR' && (
          <div className="hidden sm:flex flex-1 min-w-0">
            <NavigationStrip bare />
          </div>
        )}
        {role !== 'INSTRUCTOR' && <div className="flex-1" />}

        {/* Global search — Courses, Students, Batches for the instructor role. */}
        {role === 'INSTRUCTOR' && (
          <div className="hidden sm:block shrink-0">
            <GlobalSearch role="instructor" />
          </div>
        )}

        {/* Right side items */}
        <div className="flex items-center gap-4 shrink-0">

          {/* Messages */}
          <button
            type="button"
            onClick={toggleChat}
            className={`glass-button relative flex h-9 w-9 items-center justify-center rounded-xl border cursor-pointer text-white ${
              isOpen
                ? "bg-primary/15 border-primary/30"
                : "bg-[#0D1021] border-border hover:border-primary/30"
            }`}
            title="Messages"
            aria-label="Messages"
          >
            <MessageSquare size={18} strokeWidth={2.5} />
            {isMounted && chatUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white shadow-sm">
                {chatUnreadCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <NotificationsMenu
            notifications={notifications}
            unreadCount={isMounted ? unreadCount : 0}
            onMarkAllRead={handleMarkAllRead}
            onClearAll={handleClearAll}
            onItemClick={handleNotificationClick}
          />

          {/* Profile Dropdown */}
          <div className="relative">
            <ProfileDropdown onLogoutRequest={() => setShowLogoutModal(true)} user={currentUser} role={role} />
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out"
        size="sm"
      >
        <div className="space-y-6 text-center py-2">
          <p className="text-sm text-slate-400">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-750 text-white transition cursor-pointer"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
      </>
    );
  }

  const isStudentRole = role === "STUDENT" || role === "student" || (!role && pathname?.includes("/student"));

  return (
    <>
      <header
        className="
        glass-nav
        flex
        flex-col
        sticky
        top-0
        z-40
        text-white
      "
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 shrink-0">
            {!isStudentRole && (
              <button
                onClick={() => setOpen?.(true)}
                className="
                  md:hidden
                  text-xl
                  text-white
                  shrink-0
                "
              >
                <FaBars />
              </button>
            )}
            {isStudentRole && (
              <>
                <button
                  type="button"
                  onClick={openStudentNavDrawer}
                  aria-label="Open navigation menu"
                  className="sm:hidden shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Menu size={20} aria-hidden="true" />
                </button>
                <Link href="/student/dashboard" className="flex items-center gap-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <PiOrangeDuotone className="text-lg text-orange-500" />
                  </div>
                  <span className="text-sm font-black text-white tracking-tight whitespace-nowrap">
                    Orange Tree <span className="text-orange-500">LMS</span>
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Primary nav — moved in from the strip that used to sit below
              this bar, same as Instructor (mobile nav is still handled
              separately by StudentBottomNav / StudentNavDrawer). */}
          {isStudentRole && (
            <div className="hidden sm:flex flex-1 min-w-0">
              <StudentDashboardNav bare />
            </div>
          )}
          {!isStudentRole && <div className="flex-1" />}

          <div className="flex gap-2 sm:gap-3 items-center relative shrink-0">

            {/* Global Search: Courses, Assignments, Live Classes, Notes (hidden on mobile to make room for the hamburger + wordmark) */}
            {isStudentRole && (
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>
            )}

            {/* Chat Message Icon (hidden on mobile for Student — reachable via the nav drawer's Messages item instead) */}
            <button
              onClick={toggleChat}
              className={`
                p-3
                rounded-lg
                transition-all
                relative
                ${isStudentRole ? "hidden sm:flex" : "flex"}
                items-center
                justify-center
                ${
                  isOpen
                    ? "bg-slate-800 text-orange-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                }
              `}
              title="Messages"
            >
              <MessageSquare size={18} />
              {isMounted && chatUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(242,199,199,0.45)]">
                  {chatUnreadCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <NotificationsMenu
              notifications={notifications}
              unreadCount={isMounted ? unreadCount : 0}
              onMarkAllRead={handleMarkAllRead}
              onClearAll={handleClearAll}
              onItemClick={handleNotificationClick}
            />

            {/* Profile */}
            <ProfileMenu
              user={currentUser}
              onLogout={() => setShowLogoutModal(true)}
              profileHref={isStudentRole ? "/student/profile" : "/admin/profile"}
              settingsHref={isStudentRole ? "/student/settings" : null}
            />
          </div>
        </div>
      </header>

      {/* Calendar Modal Popup */}
      <Modal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Schedule Calendar"
        size="md"
      >
        <div className="text-white">
          <MiniCalendar role={currentUser?.role} />
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out"
        size="sm"
      >
        <div className="space-y-6 text-center py-2">
          <p className="text-sm text-slate-400">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-750 text-white transition cursor-pointer"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
