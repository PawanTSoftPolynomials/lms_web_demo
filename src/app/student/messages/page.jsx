"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Search,
  Send,
  Phone,
  Video as VideoIcon,
  MoreVertical,
  Plus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Bookmark,
  Download,
  Info,
  User
} from "lucide-react";

import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import useMessages from "@/features/chat/hooks/useMessages";
import useSendMessage from "@/hooks/useSendMessage";

export default function MessagesPage() {
  const { user: currentUser } = useAuth();

  // Real database chat hooks
  const {
    conversations = [],
    setConversations,
    activeConversation,
    setActiveConversation,
    messages = [],
    setMessages,
    loading: chatLoading
  } = useChat();

  const { loadMessages } = useMessages();
  const sendMessage = useSendMessage();

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const messagesEndRef = useRef(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation?.id) return;

    try {
      setSending(true);
      await sendMessage(inputText.trim());
      setInputText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  // Filter conversations based on query
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  return (
    <div className="bg-[#f8f9fa] h-[calc(100vh-4rem)] p-6 -m-6 flex gap-4 overflow-hidden font-sans">

      {/* Layout Header Override */}
      <style jsx global>{`
        header.bg-slate-900 {
          display: none !important;
        }
      `}</style>

      {/* 1. Left Sidebar Panel */}
      <div className="w-80 bg-white border border-slate-100 rounded-2xl flex flex-col h-full shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden flex-shrink-0">
        {/* Search header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Messages</h2>
            <button className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500">
              <Plus size={16} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 gap-2">
          <button className="px-2.5 py-1 text-indigo-600 bg-indigo-50 rounded-lg">All</button>
          <button className="px-2.5 py-1 hover:text-slate-700 transition">Direct</button>
          <button className="px-2.5 py-1 hover:text-slate-700 transition">Groups</button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatLoading ? (
            <div className="flex justify-center items-center py-10 text-xs text-slate-400">Loading...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition ${
                    isActive
                      ? "bg-indigo-50 border border-indigo-100 text-slate-800"
                      : "hover:bg-slate-50 border border-transparent text-slate-700"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 border border-indigo-200 flex-shrink-0 text-sm">
                    {conv.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-slate-800 truncate">{conv.name || "Chat Room"}</h4>
                      <span className="text-[8px] text-slate-400 flex-shrink-0 ml-1">{conv.time || "10:30 AM"}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{conv.lastMessage || "No messages yet."}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Chat Room View */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl flex flex-col h-full shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden min-w-0">
        {activeConversation ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 border border-indigo-200 text-sm">
                  {activeConversation.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 leading-none">{activeConversation.name}</h3>
                  <span className="text-[9px] text-emerald-500 font-bold mt-1 block">● Online</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <button className="hover:text-slate-700 transition"><Phone size={18} /></button>
                <button className="hover:text-slate-700 transition"><VideoIcon size={18} /></button>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={`hover:text-slate-700 transition ${showRightPanel ? "text-indigo-600" : ""}`}
                >
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">

              {/* Pinned Message */}
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-[10px] text-indigo-600 font-bold flex gap-2 items-center">
                <span>📌 Pinned: Please complete your homework assignments before our next lecture class.</span>
              </div>

              {messages.map((msg, idx) => {
                const currentUserId = currentUser?.id || currentUser?._id;
                const msgSenderId = msg.senderId || msg.sender?._id || msg.sender?.id;
                const isMe = msg.sender === "me" || (currentUserId && msgSenderId && msgSenderId === currentUserId);

                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm"
                    }`}>
                      {!isMe && (
                        <div className="text-[8px] font-black text-indigo-600 mb-1.5">
                          {msg.sender?.name || "Member"}
                        </div>
                      )}

                      <p>{msg.content || msg.text}</p>

                      <span className={`text-[8px] text-right block mt-1.5 font-bold ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                        {msg.time || "10:30 AM"}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-3 items-center flex-shrink-0">
              <button type="button" className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"><Paperclip size={18} /></button>
              <button type="button" className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"><ImageIcon size={18} /></button>

              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition min-w-0"
              />

              <button
                type="submit"
                disabled={sending}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="p-4 bg-slate-50 rounded-full text-indigo-600 mb-3">
              <Send size={32} />
            </div>
            <h3 className="text-sm font-black text-slate-800">Select a conversation</h3>
            <p className="text-xs text-slate-500 mt-1">Pick a teammate or course group to begin messaging.</p>
          </div>
        )}
      </div>

      {/* 3. Right Conversation Details Panel */}
      {activeConversation && showRightPanel && (
        <div className="w-72 bg-white border border-slate-100 rounded-2xl flex flex-col h-full shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden p-5 flex-shrink-0">
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center font-black text-xl text-indigo-700 border border-indigo-200 mx-auto mb-3">
              {activeConversation.name?.charAt(0).toUpperCase()}
            </div>
            <h4 className="text-xs font-black text-slate-800 leading-none">{activeConversation.name}</h4>
            <span className="text-[9px] text-slate-400 mt-2 block">Instructor • Computer Science</span>
          </div>

          {/* Quick options */}
          <div className="grid grid-cols-4 gap-2 text-center py-4 border-b border-slate-100">
            <button className="flex flex-col items-center gap-1.5"><span className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 transition"><Phone size={14} /></span><span className="text-[8px] font-bold text-slate-500">Call</span></button>
            <button className="flex flex-col items-center gap-1.5"><span className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 transition"><VideoIcon size={14} /></span><span className="text-[8px] font-bold text-slate-500">Video</span></button>
            <button className="flex flex-col items-center gap-1.5"><span className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 transition"><User size={14} /></span><span className="text-[8px] font-bold text-slate-500">Profile</span></button>
            <button className="flex flex-col items-center gap-1.5"><span className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 transition"><Bookmark size={14} /></span><span className="text-[8px] font-bold text-slate-500">Mute</span></button>
          </div>

          {/* Shared files list */}
          <div className="flex-1 overflow-y-auto pt-4 space-y-4">
            <div>
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">Conversation Files</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded"><FileText size={14} /></div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-700 block truncate">Assignment_Guidelines.pdf</span>
                      <span className="text-[8px] text-slate-400 font-semibold">1.2 MB • PDF</span>
                    </div>
                  </div>
                  <Download size={12} className="text-slate-400 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded"><FileText size={14} /></div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-700 block truncate">LinkedList_Implementation.cpp</span>
                      <span className="text-[8px] text-slate-400 font-semibold">3.4 KB • Source</span>
                    </div>
                  </div>
                  <Download size={12} className="text-slate-400 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* About metadata */}
            <div className="border-t border-slate-100 pt-4">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">About</h5>
              <div className="space-y-2 text-[10px] text-slate-500 font-medium">
                <p>This is the start of your message thread. Feel free to collaborate, coordinate, and ask any questions.</p>
                <div className="flex justify-between font-semibold"><span className="text-slate-400">Member since</span><span className="text-slate-700">March 12, 2025</span></div>
                <div className="flex justify-between font-semibold"><span className="text-slate-400">Associated course</span><span className="text-slate-700 truncate max-w-[110px]">Data Structures</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
