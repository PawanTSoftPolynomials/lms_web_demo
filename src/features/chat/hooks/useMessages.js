import { useEffect } from "react";
import useChat from "@/hooks/useChat";

import {
  getMessages,
} from "../api/chat.api";

export default function useMessages() {
  const {
    setMessages,
    setLoading,
    activeConversation,
  } = useChat();

  const loadMessages = async (
    conversationId
  ) => {
    try {
      setLoading(true);

      const response =
        await getMessages(conversationId);

      setMessages(
        response.data || response
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeConversation?.id) return;

    const handleStorage = (e) => {
      if (e.key === `lms_messages_${activeConversation.id}`) {
        loadMessages(activeConversation.id);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [activeConversation?.id]);

  return {
    loadMessages,
  };
}