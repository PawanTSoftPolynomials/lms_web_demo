"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Bell, BookOpen, Award, CheckCheck, MessageSquare } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";

export default function Navbar({ title = "Dashboard", setOpen }) {
  const router = useRouter();
  const { logout, user: currentUser } = useAuth();
  const { conversations = [], messages = [] } = useChat();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side initialization to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("lms_notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      // Default initial notifications
      const defaults = [
        {
          id: "notif_1",
          title: "New Lecture Uploaded",
          message: "Professor Alan added a new video lecture on 'OOP Concepts' in Java Batch.",
          type: "course",
          time: "2 hours ago",
          read: false
        },
        {
          id: "notif_2",
          title: "Quiz Graded Successfully",
          message: "Your submission for 'Java Basics Quiz' has been graded. Score: 95%.",
          type: "quiz",
          time: "1 day ago",
          read: false
        },
        {
          id: "notif_3",
          title: "Welcome to Orange Tree LMS",
          message: "Explore your dashboard, complete course milestones, and chat with classmate groups.",
          type: "system",
          time: "3 days ago",
          read: true
        }
      ];
      localStorage.setItem("lms_notifications", JSON.stringify(defaults));
      setNotifications(defaults);
    }
  }, []);

  // Listen to new messages in all background conversations
  useEffect(() => {
    if (!isMounted || !conversations || conversations.length === 0) return;
    
    conversations.forEach((conv) => {
      if (conv.unread > 0 && conv.lastMessage) {
        const lastMsgText = conv.lastMessage;
        const notifId = `conv_${conv.id}_${lastMsgText.substring(0, 10)}`;
        
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notifId)) return prev;
          
          const newNotif = {
            id: notifId,
            title: `New message from ${conv.name || "User"}`,
            message: lastMsgText,
            type: "chat",
            time: "Just now",
            read: false
          };
          const updated = [newNotif, ...prev];
          localStorage.setItem("lms_notifications", JSON.stringify(updated));
          return updated;
        });
      }
    });
  }, [conversations, isMounted]);

  // Listen to new messages in the currently active conversation
  useEffect(() => {
    if (!isMounted || !messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    const currentUserId = currentUser?.id || currentUser?._id;
    const msgSenderId = lastMsg.senderId || lastMsg.sender?._id || lastMsg.sender?.id;
    const isMine = lastMsg.sender === "me" || lastMsg.senderId === "me" || (currentUserId && msgSenderId && msgSenderId === currentUserId);
    
    if (lastMsg && !isMine) {
      const notifId = `msg_${lastMsg.id || lastMsg._id || Date.now()}`;
      
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notifId)) return prev;
        
        const newNotif = {
          id: notifId,
          title: `New message from ${lastMsg.sender?.name || "User"}`,
          message: lastMsg.text || lastMsg.content || "Sent a message.",
          type: "chat",
          time: "Just now",
          read: false
        };
        const updated = [newNotif, ...prev];
        localStorage.setItem("lms_notifications", JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentUser, isMounted]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("lms_notifications", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.setItem("lms_notifications", JSON.stringify([]));
  };

  const handleToggleRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem("lms_notifications", JSON.stringify(updated));
  };

  return (
    <header
      className="
      bg-slate-900
      border-b
      border-slate-800
      px-4
      py-4
      flex
      items-center
      justify-between
    "
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen?.(true)}
          className="
            md:hidden
            text-xl
            text-white
          "
        >
          <FaBars />
        </button>
        <button
          onClick={() => router.back()}
          className="
            bg-slate-800
            hover:bg-slate-700
            transition
            p-3
            rounded-lg
            text-slate-300
            hover:text-white
            flex
            items-center
            justify-center
          "
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex gap-3 items-center relative">
        
        {/* Notifications Icon & Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className={`
              p-3
              rounded-lg
              transition-all
              relative
              flex
              items-center
              justify-center
              ${
                showNotifications
                  ? "bg-slate-800 text-orange-500"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              }
            `}
          >
            <Bell size={18} />
            {isMounted && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(249,115,22,0.45)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown overlay panel */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowNotifications(false)}
              />

              <div className="
                absolute
                right-0
                top-14
                z-50
                w-80
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-950/95
                backdrop-blur-md
                p-4
                shadow-2xl
                text-slate-200
                animate-in
                fade-in
                slide-in-from-top-2
                duration-150
              ">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Bell size={14} className="text-orange-500" />
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto mt-2 space-y-2 pr-1 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleToggleRead(n.id)}
                        className={`
                          flex
                          gap-3
                          p-2.5
                          rounded-xl
                          transition-all
                          cursor-pointer
                          border
                          ${
                            n.read
                              ? "bg-slate-900/20 hover:bg-slate-900/50 border-transparent"
                              : "bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/10"
                          }
                        `}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${
                          n.type === "course"
                            ? "bg-orange-500/15 text-orange-400"
                            : n.type === "quiz"
                            ? "bg-purple-500/15 text-purple-400"
                            : n.type === "chat"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          {n.type === "course" ? (
                            <BookOpen size={14} />
                          ) : n.type === "quiz" ? (
                            <Award size={14} />
                          ) : n.type === "chat" ? (
                            <MessageSquare size={14} />
                          ) : (
                            <Bell size={14} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-white truncate">
                            {n.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed break-words">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {n.time}
                          </span>
                        </div>

                        {!n.read && (
                          <div className="h-2 w-2 rounded-full bg-orange-500 self-center flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/60 flex justify-end mt-2">
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-medium transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
            bg-red-600/10
            hover:bg-red-600
            border
            border-red-500/20
            text-red-400
            hover:text-white
            transition-all
            p-3
            rounded-lg
            flex
            items-center
            justify-center
            cursor-pointer
          "
          title="Sign Out"
        >
          <FaSignOutAlt />
        </button>

      </div>
    </header>
  );
}
