"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Bell, BookOpen, Award, CheckCheck, MessageSquare, Calendar } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import { useNotification } from "@/context/NotificationContext";
import Modal from "@/components/ui/Modal";
import MiniCalendar from "@/components/dashboard/MiniCalendar";

// Self-contained high-end chime player using HTML5 AudioContext
const playNotificationChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tone 1: High soft bell note
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain1.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.15);
    
    // Tone 2: Harmonious resonance
    setTimeout(() => {
      try {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      } catch (e) {}
    }, 85);
  } catch (e) {
    console.warn("Chime playback bypassed:", e);
  }
};

export default function Navbar({ title = "Dashboard", setOpen }) {
  const router = useRouter();
  const { logout, user: currentUser } = useAuth();
  const { 
    conversations = [], 
    messages = [], 
    isOpen, 
    setIsOpen, 
    activeConversation, 
    setActiveConversation 
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
  }, [conversations, isMounted, isOpen, activeConversation]);

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
  }, [messages, currentUser, isMounted, isOpen, activeConversation]);

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
        } else {
          // If not in standard list, set a baseline conversation structure
          setActiveConversation({ id: targetConvId, name: n.title.replace("New message from ", "") });
        }
      }
      setIsOpen(true);
    } else if (n.type === "quiz") {
      router.push(currentUser?.role === "INSTRUCTOR" ? "/instructor/quizzes" : "/student/quizzes");
    } else if (n.type === "course") {
      router.push(currentUser?.role === "INSTRUCTOR" ? "/instructor/courses" : "/student/courses");
    }
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
        
        {/* Calendar Button */}
        <button
          onClick={() => setCalendarOpen(true)}
          className="
            p-3
            rounded-lg
            transition-all
            bg-slate-800
            hover:bg-slate-700
            text-slate-300
            hover:text-white
            flex
            items-center
            justify-center
            cursor-pointer
          "
          title="Open Calendar"
        >
          <Calendar size={18} />
        </button>

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
                w-96
                rounded-3xl
                border
                border-slate-800/80
                bg-slate-950/95
                backdrop-blur-md
                p-5
                shadow-2xl
                text-slate-200
                animate-in
                fade-in
                slide-in-from-top-2
                duration-150
              ">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Bell size={16} className="text-orange-500" />
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto mt-3.5 space-y-3 pr-1 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`
                          flex
                          gap-4
                          p-3.5
                          rounded-2xl
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
                        <div className={`p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center ${
                          n.type === "course"
                            ? "bg-orange-500/15 text-orange-400"
                            : n.type === "quiz"
                            ? "bg-purple-500/15 text-purple-400"
                            : n.type === "chat"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          {n.type === "course" ? (
                            <BookOpen size={16} />
                          ) : n.type === "quiz" ? (
                            <Award size={16} />
                          ) : n.type === "chat" ? (
                            <MessageSquare size={16} />
                          ) : (
                            <Bell size={16} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white truncate">
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed break-words">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1.5 block">
                            {n.time}
                          </span>
                        </div>

                        {!n.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-orange-500 self-center flex-shrink-0" />
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
    </header>
  );
}
