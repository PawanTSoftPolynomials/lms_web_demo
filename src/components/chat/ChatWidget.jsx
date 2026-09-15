"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import useChat from "@/hooks/useChat";
import useConversation from "@/features/chat/hooks/useConversation";
import useSocket from "@/features/chat/hooks/useSocket";

// ChatWindow (and framer-motion with it, ~65KB compressed) used to ship with
// every dashboard page even though the window only renders while chat is open.
// Load it on first open and keep it mounted afterwards so its exit animation
// still plays on close.
const ChatWindow = dynamic(() => import("./ChatWindow"), { ssr: false });

export default function ChatWidget() {
  const { isOpen } = useChat();
  const { loadConversations } = useConversation();
  const [hasOpened, setHasOpened] = useState(isOpen);

  if (isOpen && !hasOpened) {
    setHasOpened(true);
  }

  useSocket();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  return hasOpened ? <ChatWindow /> : null;
}
