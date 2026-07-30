import { useEffect, useCallback } from "react";

import useChat from "@/hooks/useChat";

import { getConversations } from "../api/chat.api";

export default function useConversation() {
  const {
    setLoading,
    setConversations,
  } = useChat();

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getConversations();
      const dbConvs = Array.isArray(response) ? response : response?.data ?? [];

      setConversations(Array.isArray(dbConvs) ? dbConvs : []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    loadConversations,
  };
}
