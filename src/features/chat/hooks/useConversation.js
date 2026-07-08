import { useEffect } from "react";

import useChat from "@/hooks/useChat";

import {
  getConversations,
  getLocalConvs,
} from "../api/chat.api";

export default function useConversation() {
  const {
    setLoading,
    setConversations,
  } = useChat();

  const loadConversations = async () => {
    try {
      setLoading(true);

      let dbConvs = [];
      try {
        const response = await getConversations();
        dbConvs = response.data || response || [];
        if (!Array.isArray(dbConvs)) dbConvs = [];
      } catch (err) {
        console.warn("Failed to load database conversations:", err);
      }

      // Load mock conversations from local cache
      const localConvs = getLocalConvs() || [];

      // Merge DB conversations and local mock conversations
      const mergedConvs = [...dbConvs];
      localConvs.forEach((lc) => {
        if (
          lc &&
          lc.id &&
          !lc.id.toString().includes("undefined") &&
          !lc.id.toString().includes("null") &&
          !mergedConvs.some((dc) => dc.id === lc.id)
        ) {
          mergedConvs.push(lc);
        }
      });

      setConversations(mergedConvs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "lms_conversations") {
        loadConversations();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    loadConversations,
  };
}