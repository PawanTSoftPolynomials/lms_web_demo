"use client";

import { useMutation } from "@tanstack/react-query";
import { createConversation } from "@/features/chat/api/chat.api";

export default function useCreateConversation() {
  return useMutation({
    mutationFn: createConversation,
  });
}
