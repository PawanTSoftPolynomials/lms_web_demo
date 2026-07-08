"use client";

import { useState } from "react";
import {
  Smile,
  Paperclip,
  Mic,
  SendHorizontal,
} from "lucide-react";

import useSendMessage from "@/hooks/useSendMessage";
import useTyping from "@/hooks/useTyping";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const sendMessage = useSendMessage();

  const {
    startTyping,
    stopTyping,
  } = useTyping();

  const handleSend = async () => {
    if (!message.trim()) return;

    await sendMessage(message);

    setMessage("");

    stopTyping();
  };

  return (
    <div className="border-t border-slate-800/40 bg-slate-900/10 backdrop-blur-md p-4">

      <div className="flex items-center gap-1.5">

        <button className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors duration-200">
          <Smile size={18} />
        </button>

        <button className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors duration-200">
          <Paperclip size={18} />
        </button>

        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            if (e.target.value.length) {
              startTyping();
            } else {
              stopTyping();
            }
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="
          flex-1
          rounded-full
          border
          border-slate-800/80
          bg-slate-950/60
          px-5
          py-2.5
          text-sm
          text-slate-100
          outline-none
          placeholder:text-slate-500
          transition-all
          duration-300
          focus:border-orange-500/60
          focus:bg-slate-950
          focus:ring-1
          focus:ring-orange-500/30
          focus:shadow-[0_0_15px_rgba(249,115,22,0.08)]
          "
        />

        <button className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors duration-200">
          <Mic size={18} />
        </button>

        <button
          onClick={handleSend}
          className="
          rounded-full
          bg-gradient-to-br
          from-orange-500
          to-orange-600
          p-3
          text-white
          shadow-[0_4px_15px_rgba(249,115,22,0.3)]
          hover:shadow-[0_4px_20px_rgba(249,115,22,0.45)]
          hover:scale-105
          active:scale-95
          transition-all
          duration-200
          "
        >
          <SendHorizontal size={16} />
        </button>

      </div>

    </div>
  );
}