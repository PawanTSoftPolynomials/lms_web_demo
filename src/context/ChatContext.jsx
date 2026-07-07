"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  // Chat panel state
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Sidebar mode: 'chats' or 'users'
  const [sidebarMode, setSidebarMode] = useState("chats");

  // Conversations
  const [conversations, setConversations] = useState([]);

  // Selected conversation
  const [activeConversation, setActiveConversation] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Socket instance
  const [socket, setSocket] = useState(null);

  // Typing users
  const [typingUsers, setTypingUsers] = useState([]);

  // Online users
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Total unread messages
  const [unreadCount, setUnreadCount] = useState(0);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleChat,

      sidebarMode,
      setSidebarMode,

      conversations,
      setConversations,

      activeConversation,
      setActiveConversation,

      messages,
      setMessages,

      loading,
      setLoading,

      socket,
      setSocket,

      typingUsers,
      setTypingUsers,

      onlineUsers,
      setOnlineUsers,

      unreadCount,
      setUnreadCount,

      confirmDialog,
      setConfirmDialog,
    }),
    [
      isOpen,
      toggleChat,
      sidebarMode,
      conversations,
      activeConversation,
      messages,
      loading,
      socket,
      typingUsers,
      onlineUsers,
      unreadCount,
      confirmDialog,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used inside ChatProvider");
  }

  return context;
}