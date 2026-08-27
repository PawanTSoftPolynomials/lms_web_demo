"use client";

import { useCallback } from "react";

import useChat from "@/hooks/useChat";
import useCreateConversation from "@/hooks/queries/student/useCreateConversation";

// Finds the existing 1:1 (non-GROUP) conversation with `participantId` among
// the current conversation list, or creates one via the existing
// useCreateConversation mutation if none exists yet — the same "message this
// person directly" flow shared by the Learn page's Ask Instructor card and
// the Messages page's ?instructorId= auto-open.
export default function useFindOrCreateDirectConversation() {
  const { conversations = [], setConversations, setActiveConversation } = useChat();
  const { mutateAsync: createConversation } = useCreateConversation();

  const findOrCreateDirectConversation = useCallback(
    async ({ participantId, courseId, name }) => {
      if (!participantId) return null;

      const matched = conversations.find((c) =>
        c.type !== "GROUP" && c.participants?.some((p) => {
          const pId = p.userId || p.user?.id || p.id;
          return pId === participantId;
        })
      );

      if (matched) {
        setActiveConversation(matched);
        return matched;
      }

      const res = await createConversation({
        name,
        participantIds: [participantId],
        courseId,
        isGroup: false,
      });
      const newConv = res.data || res;
      if (newConv) {
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
      }
      return newConv;
    },
    [conversations, setConversations, setActiveConversation, createConversation]
  );

  return { findOrCreateDirectConversation };
}
