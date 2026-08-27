"use client";

import { useEffect } from "react";

import ChatWindow from "./ChatWindow";

import useChat from "@/hooks/useChat";
import useConversation from "@/features/chat/hooks/useConversation";
import useSocket from "@/features/chat/hooks/useSocket";

export default function ChatWidget() {
  const { isOpen } = useChat();
  const { loadConversations } = useConversation();

  useSocket();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  return (
    <>
      <ChatWindow />
    </>
  );
}