"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

export default function ChatMessages({ messages = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      className="
      flex
      h-full
      flex-col
      overflow-y-auto

      bg-transparent

      px-4.5
      py-5
      "
    >
      <div
        className="
        mb-6

        flex
        items-center
        justify-center
        "
      >
        <span
          className="
          rounded-full

          bg-slate-800

          px-4
          py-1

          text-xs
          font-medium

          text-slate-400
          "
        >
          Today
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">
            No messages yet.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))
      )}

      <div ref={bottomRef} />
    </div>
  );
}