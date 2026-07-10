import { useEffect } from "react";
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
  } = useChat();

  const { user } = useAuth();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token || !user) return;

    const socket = socketService.connect(token);

    setSocket(socket);

    socket.on("message:new", (message) => {
      setMessages((prev) => {
        // Prevent duplication of messages
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
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