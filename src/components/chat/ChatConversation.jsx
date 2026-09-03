"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Phone, Video, MoreVertical, Trash2, Eraser } from "lucide-react";

import useChat from "@/hooks/useChat";
import useMessages from "@/features/chat/hooks/useMessages";
import { deleteConversation } from "@/features/chat/api/chat.api";
import { useAuth } from "@/context/AuthContext";

import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import EmptyConversation from "./EmptyConversation";

export default function ChatConversation() {
  const { user: currentUser } = useAuth();
  const {
    activeConversation,
    setActiveConversation,
    setConversations,
    setMessages,
    messages,
    setConfirmDialog,
    typingUsers,
  } = useChat();

  const isRecipientTyping = typingUsers.some(
    (t) => t.conversationId === activeConversation?.id && t.userId !== currentUser?.id
  );

  const { loadMessages } = useMessages();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (activeConversation?.id) {
      setMessages([]); // Clear previous messages instantly
      loadMessages(activeConversation.id);
    }
    setShowMenu(false); // Reset menu when changing conversation
  }, [activeConversation, loadMessages, setMessages]);

  if (!activeConversation) {
    return <EmptyConversation />;
  }

  const recipient = activeConversation?.participants?.find((p) => {
    const pId = p?.userId || p?.user?.id || p?.id;
    const pEmail = p?.user?.email || p?.email;
    const currentUserId = currentUser?.id || currentUser?._id;
    return p && pId !== currentUserId && pEmail !== currentUser?.email;
  });
  const isGroup = activeConversation?.type === "GROUP";
  const role = recipient?.role || recipient?.user?.role || activeConversation?.role || (isGroup ? "GROUP" : "STUDENT");
  const displayName = isGroup
    ? activeConversation?.name || "Unknown Conversation"
    : recipient?.user?.name || recipient?.name || activeConversation?.name || "Unknown Conversation";

  const getRoleBadgeStyle = (userRole) => {
    const formatted = (userRole || "").toUpperCase();
    if (formatted.includes("INSTRUCTOR")) {
      return "bg-primary/10 text-primary border border-primary/25";
    }
    if (formatted.includes("ADMIN")) {
      return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
    }
    if (formatted.includes("GROUP")) {
      return "bg-teal-500/10 text-teal-400 border border-teal-500/25";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/25";
  };

  const handleDeleteChat = () => {
    setShowMenu(false);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Conversation",
      message: "Are you sure you want to delete this conversation? This will permanently delete all message history.",
      onConfirm: async () => {
        try {
          await deleteConversation(activeConversation.id);
          setConversations((prev) => prev.filter((c) => c.id !== activeConversation.id));
          setActiveConversation(null);
        } catch (err) {
          console.error("Failed to delete conversation:", err);
        }
      }
    });
  };

  const handleClearHistory = () => {
    setShowMenu(false);
    setConfirmDialog({
      isOpen: true,
      title: "Clear Chat History",
      message: "Are you sure you want to clear the chat history locally? This cannot be undone.",
      onConfirm: () => {
        setMessages([]);
      }
    });
  };

  return (
    <div className="flex h-full flex-col relative">

      <div className="flex h-16 items-center justify-between border-b border-border bg-background px-5">

        <div className="flex items-center gap-2 min-w-0">

          <button
            onClick={() => setActiveConversation(null)}
            className="md:hidden shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="min-w-0">

          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <span>{displayName}</span>
            {role && (
              <span className={`
                rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider
                ${getRoleBadgeStyle(role)}
              `}>
                {role}
              </span>
            )}
          </h2>

          <p className={`text-xs ${isRecipientTyping ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            {isRecipientTyping
              ? "Typing..."
              : activeConversation.online
              ? "Online"
              : activeConversation.lastSeen}
          </p>

          </div>

        </div>

        <div className="flex gap-2 relative">

          <button className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Phone size={18} />
          </button>

          <button className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Video size={18} />
          </button>

          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className={`rounded-lg p-2 transition-colors ${
              showMenu ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <MoreVertical size={18} />
          </button>

          {/* Three-dot dropdown menu */}
          {showMenu && (
            <>
              {/* Fullscreen transparent overlay to close the dropdown when clicking outside */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowMenu(false)}
              />

              <div className="
                absolute
                right-0
                top-11
                z-50
                w-48
                rounded-xl
                border
                border-border/80
                bg-background/95
                backdrop-blur-md
                p-1.5
                shadow-2xl
                animate-in
                fade-in
                slide-in-from-top-2
                duration-150
              ">
                <button
                  onClick={handleClearHistory}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-lg
                    px-3
                    py-2
                    text-left
                    text-xs
                    font-medium
                    text-foreground
                    hover:bg-muted/60
                    hover:text-foreground
                    transition-all
                  "
                >
                  <Eraser size={14} />
                  Clear Chat History
                </button>

                <button
                  onClick={handleDeleteChat}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-lg
                    px-3
                    py-2
                    text-left
                    text-xs
                    font-medium
                    text-red-400
                    hover:bg-red-500/10
                    hover:text-red-300
                    transition-all
                  "
                >
                  <Trash2 size={14} />
                  Delete Conversation
                </button>
              </div>
            </>
          )}

        </div>

      </div>

      <ChatMessages messages={messages} />

      <ChatInput />

    </div>
  );
}