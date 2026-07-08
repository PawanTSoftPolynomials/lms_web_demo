"use client";

import { useState } from "react";
import { Check, CheckCheck, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import useChat from "@/hooks/useChat";
import { deleteMessage, updateMessage } from "@/features/chat/api/chat.api";
import ChatAvatar from "./ChatAvatar";

export default function ChatMessage({ message }) {
  const { user } = useAuth();
  const { setMessages, setConfirmDialog } = useChat();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || message.content || "");
  
  const currentUserId = user?.id || user?._id;
  const senderId = message.senderId || 
                   message.sender?._id || 
                   message.sender?.id || 
                   (typeof message.sender === "string" ? message.sender : null);

  const isMine = message.sender === "me" || 
                 message.senderId === "me" || 
                 (currentUserId && senderId && senderId === currentUserId);

  const senderName = typeof message.sender === "object"
    ? message.sender?.name
    : message.sender;

  const handleDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Message",
      message: "Are you sure you want to delete this message? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteMessage(message.id);
          setMessages((prev) => prev.filter((m) => m.id !== message.id));
        } catch (err) {
          console.error("Failed to delete message:", err);
        }
      }
    });
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      await updateMessage(message.id, { text: editText.trim() });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, text: editText.trim(), content: editText.trim(), edited: true }
            : m
        )
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut"
      }}
      className={`mb-4 flex gap-2.5 max-w-[85%] ${
        isMine ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
      }`}
    >
      {/* Sender Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <ChatAvatar
          name={isMine ? (user?.name || "Me") : (senderName || "User")}
          image={isMine ? user?.avatar : (typeof message.sender === "object" ? message.sender?.avatar : null)}
          size="sm"
        />
      </div>

      {/* Message Content Container */}
      <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {/* Sender Name for incoming messages */}
        {!isMine && senderName && (
          <span className="text-[10px] font-bold text-orange-400/80 mb-1 ml-1 tracking-wider uppercase">
            {senderName}
          </span>
        )}

        {/* Bubble & Hover Actions Row */}
        <div className="relative flex items-center group">
          
          {/* Action icons on hover (only visible for own messages and when not editing) */}
          {isMine && !isEditing && (
            <div className="
              absolute
              left-[-62px]
              flex
              items-center
              gap-1
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-200
              bg-slate-900/90
              border
              border-slate-800/80
              rounded-xl
              p-1
              shadow-md
              z-10
            ">
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-orange-500 transition-colors p-1"
                title="Edit message"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Delete message"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}

          <div
            className={`
              relative
              px-4.5
              py-3
              shadow-md
              transition-all
              duration-300

              ${
                isMine
                  ? "rounded-2xl rounded-tr-none bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 text-white shadow-[0_4px_15px_rgba(249,115,22,0.2)]"
                  : "rounded-2xl rounded-tl-none border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm text-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
              }
            `}
          >
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-transparent text-[14px] text-white focus:outline-none w-full resize-none leading-relaxed border-b border-orange-300/60 pb-1"
                  rows={1}
                  autoFocus
                />
                <div className="flex justify-end gap-1.5 text-[9px] font-bold">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.text || message.content || "");
                    }}
                    className="text-slate-300 hover:text-white bg-slate-850 px-2 py-1 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded-md shadow-sm transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[14px] leading-relaxed break-words font-medium tracking-wide">
                {message.text || message.content}
              </p>
            )}

            {!isEditing && (
              <div
                className={`
                  mt-2
                  flex
                  items-center
                  justify-end
                  gap-1
                  text-[9px]
                  font-semibold
                  tracking-wider

                  ${
                    isMine
                      ? "text-orange-100/80"
                      : "text-slate-500"
                  }
                `}
              >
                <span>
                  {message.time}
                  {(message.edited || message.isEdited) && (
                    <span className="text-[8px] font-normal italic ml-1 opacity-80">(edited)</span>
                  )}
                </span>

                {isMine && (
                  <>
                    {message.read ? (
                      <CheckCheck
                        size={12}
                        className="text-sky-300 drop-shadow-[0_0_5px_rgba(125,211,252,0.4)]"
                      />
                    ) : (
                      <Check
                        size={12}
                        className="text-orange-200"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}