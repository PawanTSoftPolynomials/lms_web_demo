"use client";

import { useState, useRef } from "react";
import {
  Smile,
  Paperclip,
  Mic,
  SendHorizontal,
} from "lucide-react";

import useSendMessage from "@/hooks/useSendMessage";
import useTyping from "@/hooks/useTyping";
import { uploadAttachment } from "@/features/chat/api/chat.api";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const sendMessage = useSendMessage();

  const {
    startTyping,
    stopTyping,
  } = useTyping();

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (uploading) return; // Prevent sending while uploading file

    try {
      await sendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
      stopTyping();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await uploadAttachment(file);
      if (response.success && response.data) {
        setAttachments((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset
      }
    }
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="border-t border-slate-800/40 bg-slate-900/10 backdrop-blur-md p-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Attachment Previews */}
      {(attachments.length > 0 || uploading) && (
        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800/60 max-h-32 overflow-y-auto">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <Paperclip size={12} className="text-orange-400" />
              <span className="max-w-[120px] truncate">{att.fileName}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-slate-400 hover:text-red-400 font-bold ml-1 transition-colors text-sm"
              >
                &times;
              </button>
            </div>
          ))}
          {uploading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 border-dashed rounded-lg text-xs text-slate-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              Uploading...
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors duration-200">
          <Smile size={18} />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors duration-200 disabled:opacity-50"
        >
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
          disabled={uploading || (!message.trim() && attachments.length === 0)}
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
          disabled:opacity-50
          disabled:scale-100
          disabled:shadow-none
          "
        >
          <SendHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}