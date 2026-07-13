import { useEffect, useRef } from "react";
import Cookies from "js-cookie";

import socketService from "@/services/socket.service";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";

export default function useSocket() {
  const {
    setSocket,
    setMessages,
    setConversations,
    setOnlineUsers,
    activeConversation,
  } = useChat();

  const { user } = useAuth();

  // Maintain ref to activeConversation to prevent stale closures in event listeners
  const activeConversationRef = useRef(activeConversation);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Handle room joining / leaving when activeConversation changes
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token || !user) return;

    const socket = socketService.connect(token);

    if (activeConversation?.id) {
      socket.emit("join_conversation", activeConversation.id);
      console.log(`🔌 Emitted join_conversation for room: ${activeConversation.id}`);
    }

    return () => {
      if (activeConversation?.id) {
        socket.emit("leave_conversation", activeConversation.id);
        console.log(`🔌 Emitted leave_conversation for room: ${activeConversation.id}`);
      }
    };
  }, [user, activeConversation?.id]);

  // Main socket connections and event listeners
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token || !user) return;

    const socket = socketService.connect(token);
    setSocket(socket);

    socket.on("message:new", (message) => {
      // 1. Update active messages list if the message belongs to current active conversation
      const currentActiveConv = activeConversationRef.current;
      if (currentActiveConv && currentActiveConv.id === message.conversationId) {
        setMessages((prev) => {
          // Prevent duplication of messages
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // 2. Update conversation item in sidebar (text, time, sort to top)
      setConversations((prev) => {
        const conversationId = message.conversationId;
        const convIndex = prev.findIndex((c) => c.id === conversationId);
        
        if (convIndex === -1) return prev;
        
        const targetConv = { ...prev[convIndex] };
        
        // Format last message text
        let text = "";
        if (message.content && message.content.trim()) {
          text = message.content;
        } else if (message.messageAttachments && message.messageAttachments.length > 0) {
          const type = message.messageAttachments[0].type;
          if (type === "IMAGE") text = "📷 Photo";
          else if (type === "VIDEO") text = "🎥 Video";
          else if (type === "AUDIO") text = "🎵 Audio";
          else if (type === "DOCUMENT") text = "📄 Document";
          else text = "📎 Attachment";
        }
        
        targetConv.lastMessage = text;
        
        // Format last message timestamp
        const msgDate = new Date(message.createdAt);
        targetConv.lastSeen = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Increment unread count if not current active conversation
        const isActive = currentActiveConv && currentActiveConv.id === conversationId;
        if (!isActive) {
          targetConv.unread = (targetConv.unread || 0) + 1;
        }
        
        const updatedList = [...prev];
        updatedList.splice(convIndex, 1); // remove from old position
        return [targetConv, ...updatedList]; // insert at top
      });
    });

    socket.on("message:edit", (message) => {
      const currentActiveConv = activeConversationRef.current;
      if (currentActiveConv && currentActiveConv.id === message.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      }

      // Update sidebar last message content if it matches this conversation
      setConversations((prev) => {
        return prev.map((c) => {
          if (c.id === message.conversationId) {
            return { ...c, lastMessage: message.content };
          }
          return c;
        });
      });
    });

    socket.on("message:star", (message) => {
      const currentActiveConv = activeConversationRef.current;
      if (currentActiveConv && currentActiveConv.id === message.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      }
    });

    socket.on("conversation:created", (conversation) => {
      setConversations((prev) => {
        if (prev.some((c) => c.id === conversation.id)) return prev;
        return [conversation, ...prev];
      });
    });

    socket.on("user:online", (onlineUser) => {
      setOnlineUsers((prev) => {
        if (prev.includes(onlineUser.id)) return prev;
        return [...prev, onlineUser.id];
      });
    });

    socket.on("user:offline", (offlineUser) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== offlineUser.id)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketService;
}