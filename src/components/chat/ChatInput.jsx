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
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const sendMessage = useSendMessage();

  const {
    startTyping,
    stopTyping,
  } = useTyping();

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (uploading || sending) return; // Prevent sending while uploading or a send is already in flight

    try {
      setSending(true);
      await sendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
      stopTyping();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
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
    <div className="border-t border-border/40 bg-background/10 backdrop-blur-md p-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Attachment Previews */}
      {(attachments.length > 0 || uploading) && (
        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-background/40 rounded-xl border border-border/60 max-h-32 overflow-y-auto">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground"
            >
              <Paperclip size={12} className="text-primary" />
              <span className="max-w-[120px] truncate">{att.fileName}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-muted-foreground hover:text-red-400 font-bold ml-1 transition-colors text-sm"
              >
                &times;
              </button>
            </div>
          ))}
          {uploading && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 border border-border border-dashed rounded-lg text-xs text-muted-foreground animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Uploading...
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors duration-200">
          <Smile size={18} />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors duration-200 disabled:opacity-50"
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
          border-border/80
          bg-background/60
          px-5
          py-2.5
          text-sm
          text-foreground
          outline-none
          placeholder:text-muted-foreground
          transition-all
          duration-300
          focus:border-primary/60
          focus:bg-background
          focus:ring-1
          focus:ring-orange-500/30
          focus:shadow-[0_0_15px_rgba(242,199,199,0.08)]
          "
        />

        <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors duration-200">
          <Mic size={18} />
        </button>

        <button
          onClick={handleSend}
          disabled={uploading || sending || (!message.trim() && attachments.length === 0)}
          className="
          rounded-full
          bg-gradient-to-br
          from-orange-500
          to-orange-600
          p-3
          text-foreground
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