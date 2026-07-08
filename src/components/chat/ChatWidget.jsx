"use client";

import { useEffect } from "react";

import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

import useConversation from "@/features/chat/hooks/useConversation";
import useSocket from "@/features/chat/hooks/useSocket";

export default function ChatWidget() {
  const { loadConversations } = useConversation();

  useSocket();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <>
      <ChatWindow />
      <ChatButton />
    </>
  );
}