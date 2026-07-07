"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Users, 
  User, 
  Search, 
  Smile,
  Loader2,
  Cpu,
  Sparkles,
  Zap,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import useMessages from "@/features/chat/hooks/useMessages";
import useSendMessage from "@/hooks/useSendMessage";
import { getEnrollments } from "@/services/enrollment.service";
import { createConversation } from "@/features/chat/api/chat.api";

export default function CourseChat({ course, courseId }) {
  const { user: currentUser } = useAuth();
  const { 
    conversations, 
    setConversations,
    activeConversation, 
    setActiveConversation, 
    messages, 
    setMessages,
    loading: messagesLoading 
  } = useChat();

  const { loadMessages } = useMessages();
  const sendMessage = useSendMessage();

  const [classmates, setClassmates] = useState([]);
  const [classmatesLoading, setClassmatesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch classmates enrolled in the course
  useEffect(() => {
    async function fetchClassmates() {
      try {
        setClassmatesLoading(true);
        const data = await getEnrollments(null, courseId);
        if (data) {
          const list = data
            .map((enrollment) => enrollment.student?.user || enrollment.user || enrollment)
            .filter((c) => c && c.id !== currentUser?.id);
          setClassmates(list);
        }
      } catch (err) {
        console.error("Failed to load classmates:", err);
      } finally {
        setClassmatesLoading(false);
      }
    }
    if (courseId && currentUser) {
      fetchClassmates();
    }
  }, [courseId, currentUser]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Find or create direct chat
  const handleSelectUser = async (targetUser) => {
    if (!targetUser || !currentUser) return;

    const existing = conversations.find((c) => {
      if (c.isGroup) return false;
      const otherParticipant = c.participants?.find((p) => p.id === targetUser.id);
      return !!otherParticipant;
    });

    if (existing) {
      setActiveConversation(existing);
    } else {
      try {
        const payload = {
          name: targetUser.name,
          isGroup: false,
          participantIds: [targetUser.id],
          participants: [targetUser.id]
        };
        const response = await createConversation(payload);
        const newConv = response.data || response;
        
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
      } catch (err) {
        console.error("Failed to start direct conversation:", err);
      }
    }
  };

  // Find or create course community group chat
  const handleSelectCommunity = async () => {
    if (!course || !currentUser) return;

    const groupName = `${course.title} Community`;
    const existing = conversations.find((c) => {
      return c.isGroup && (c.courseId === courseId || c.name === groupName || c.title === groupName);
    });

    if (existing) {
      setActiveConversation(existing);
    } else {
      try {
        const allParticipantIds = [
          currentUser.id,
          ...classmates.map((c) => c.id),
          course.creator?.id
        ].filter(Boolean);

        const payload = {
          name: groupName,
          isGroup: true,
          courseId: courseId,
          participantIds: allParticipantIds,
          participants: allParticipantIds
        };

        const response = await createConversation(payload);
        const newConv = response.data || response;

        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
      } catch (err) {
        console.error("Failed to start community group conversation:", err);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !activeConversation) return;

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

  const filteredClassmates = useMemo(() => {
    if (!searchQuery.trim()) return classmates;
    return classmates.filter((c) => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classmates, searchQuery]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Normalize messages for rendering
  const normalizedMessages = useMemo(() => {
    return messages.map((m) => {
      const currentUserId = currentUser?.id || currentUser?._id;
      const msgSenderId = m.senderId || m.sender?._id || m.sender?.id || (typeof m.sender === "string" ? m.sender : null);
      const isMine = m.sender === "me" || m.senderId === "me" || (currentUserId && msgSenderId && msgSenderId === currentUserId);

      return {
        id: m.id || m._id || Math.random().toString(),
        text: m.text || m.content || "",
        sender: isMine ? "me" : "other",
        senderName: m.sender?.name || (isMine ? "You" : "Classmate"),
        time: m.time || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""),
        read: m.read || false,
      };
    });
  }, [messages, currentUser]);

  const activeHeaderName = useMemo(() => {
    if (!activeConversation) return "";
    return activeConversation.name;
  }, [activeConversation]);

  return (
    <div className="relative grid h-[600px] overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 shadow-[0_20px_50px_rgba(249,115,22,0.12)] lg:grid-cols-[290px_1fr] backdrop-blur-xl">
      {/* Background visual neon grid effects */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Left Sidebar Directory */}
      <div className="relative flex flex-col border-r border-slate-850/80 bg-slate-950/45 p-4 backdrop-blur-md z-10">
        {/* Header decoration */}
        <div className="mb-5 flex items-center gap-2 px-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 shadow-md">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 uppercase">
            NetHub Portal
          </span>
        </div>

        {/* Course Group Channel */}
        <div className="mb-6">
          <h3 className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Nodes
          </h3>
          <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSelectCommunity}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition duration-300 border ${
              activeConversation?.isGroup && activeConversation?.courseId === courseId
                ? "bg-gradient-to-r from-orange-500/20 to-pink-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-200 border-slate-900/30"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold">Course Community</p>
              <p className="text-[9px] text-slate-500">Public Channel</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-650 opacity-60" />
          </motion.button>
        </div>

        {/* Instructor */}
        {course?.creator && (
          <div className="mb-6">
            <h3 className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Uplink / Teacher
            </h3>
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectUser(course.creator)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-300 border ${
                activeConversation && !activeConversation.isGroup && activeConversation.participants?.some(p => p.id === course.creator.id)
                  ? "bg-gradient-to-r from-orange-500/20 to-pink-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                  : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-200 border-slate-900/30"
              }`}
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600/30 to-pink-600/30 text-xs font-bold text-orange-300 border border-orange-500/20">
                  {getInitials(course.creator.name)}
                </div>
                {/* Glowing tech active light */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{course.creator.name}</p>
                <p className="truncate text-[9px] text-slate-400">Primary Instructor</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-650 opacity-60" />
            </motion.button>
          </div>
        )}

        {/* Classmates List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-2 px-1 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Classmate Terminals
            </h3>
            {classmatesLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
            )}
          </div>

          {/* Styled search field */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search classmates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredClassmates.length === 0 ? (
              <p className="text-center text-xs text-slate-600 py-6">
                {classmatesLoading ? "Pinging terminals..." : "No peers connected"}
              </p>
            ) : (
              filteredClassmates.map((student) => {
                const isSelected = activeConversation && !activeConversation.isGroup && activeConversation.participants?.some(p => p.id === student.id);
                return (
                  <motion.button
                    key={student.id}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectUser(student)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition duration-300 border ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500/20 to-pink-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border-transparent hover:border-slate-850"
                    }`}
                  >
                    <div className="relative">
                      <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-slate-300 border border-slate-800/80">
                        {getInitials(student.name)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-700"></span>
                      </span>
                    </div>
                    <span className="truncate font-medium">{student.name}</span>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Conversation Window */}
      <div className="relative flex flex-col bg-gradient-to-b from-slate-950/80 to-slate-900/60 backdrop-blur-xl z-10">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-850/80 bg-slate-950/50 px-6">
              <div className="flex items-center gap-3">
                {activeConversation.isGroup ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 text-orange-400 border border-orange-500/20">
                    <Users className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-orange-400 border border-slate-800">
                    {getInitials(activeHeaderName)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {activeHeaderName}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                    </span>
                    <p className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                      {activeConversation.isGroup ? "Node Group Chat" : "Direct Uplink"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Tech Badges */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                  SECURE CHAT
                </span>
                <span className="rounded-full border border-orange-500/25 bg-orange-500/5 px-2.5 py-0.5 text-[9px] font-bold text-orange-400 tracking-widest uppercase">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : normalizedMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                  <Zap className="h-8 w-8 text-slate-600 mb-2 animate-bounce" />
                  <p className="text-xs text-slate-500">Secure pipeline initiated. Send a message to start.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {normalizedMessages.map((message) => {
                    const isMine = message.sender === "me";
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                      >
                        {/* Sender name for group chats */}
                        {activeConversation.isGroup && !isMine && (
                          <span className="text-[9px] font-bold text-slate-500 mb-1 ml-2 tracking-wider uppercase">
                            {message.senderName}
                          </span>
                        )}
                        <div
                          className={`relative max-w-[70%] rounded-2xl px-4.5 py-3 shadow-lg border ${
                            isMine
                              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-tr-none border-orange-400/25 shadow-[0_5px_15px_rgba(249,115,22,0.15)]"
                              : "bg-slate-900 text-slate-100 rounded-tl-none border-slate-800/80 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                          }`}
                        >
                          <p className="text-[13px] leading-relaxed break-words font-medium">
                            {message.text || message.content}
                          </p>
                          <p className={`text-[9px] text-right mt-1.5 ${isMine ? "text-orange-100/70" : "text-slate-500"}`}>
                            {message.time}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-850/80 bg-slate-950/60 backdrop-blur-md">
              <div className="flex items-center gap-3 max-w-5xl mx-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeHeaderName}...`}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/25"
                  />
                  <div className="absolute right-3 top-3.5 flex items-center gap-2 text-slate-600 hover:text-slate-400 cursor-pointer transition">
                    <Smile className="h-4.5 w-4.5" />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, shadow: "0 0 15px rgba(249, 115, 22, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold transition disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
                >
                  <Send className="h-4.5 w-4.5" />
                </motion.button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-2 flex items-center justify-center">
              <Sparkles className="h-96 w-96 text-orange-500 animate-spin-slow" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="z-10"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white tracking-wide">Ready for Transmission</h4>
              <p className="mt-2 max-w-xs text-xs text-slate-400 leading-relaxed mx-auto">
                Select the Course Community channel, message the instructor, or pick a classmate terminal from the directory to establish a connection.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
