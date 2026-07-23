'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Search, ArrowLeft, Users, CheckCheck, Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
} from '@/features/chat/api/chat.api';

export default function MessagingCenterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-slate-100 flex items-center justify-center bg-[#080B11]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-orange-500" size={24} />
          <span className="text-xs font-black text-slate-450 uppercase tracking-widest font-mono">Loading Messages...</span>
        </div>
      </div>
    }>
      <MessagingCenterContent />
    </Suspense>
  );
}

function MessagingCenterContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId');

  const queryClient = useQueryClient();

  const [selectedConvId, setSelectedConvId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  const chatEndRef = useRef(null);

  // --- 1. FETCH CONVERSATIONS FROM REAL API ---
  const { data: convsData, isLoading: loadingConvs, refetch: refetchConvs } = useQuery({
    queryKey: ['conversationsList'],
    queryFn: async () => {
      const res = await getConversations();
      return res?.data ?? res ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Resolve conversations list from API
  const conversationsList = useMemo(() => {
    const rawList = Array.isArray(convsData) ? convsData : (convsData?.data ?? []);
    if (rawList.length > 0) {
      return rawList.map(c => ({
        id: c.id || c._id,
        name: c.name || c.participantName || c.participants?.[0]?.name || 'Student Query',
        course: c.courseName || c.course || 'Course',
        unreadCount: c.unread || c.unreadCount || 0,
        lastMsgTime: c.lastSeen || c.lastMsgTime || 'Recently',
        lastMessageText: c.lastMessage || c.lastMsg || 'No message preview',
        messages: c.messages || null
      }));
    }
    return [];
  }, [convsData]);

  // Set initial selected conversation ID or search query parameter match
  useEffect(() => {
    if (conversationsList.length > 0) {
      if (studentIdParam) {
        const match = conversationsList.find(c => c.id === studentIdParam || c.id === `s${studentIdParam}`);
        if (match) setSelectedConvId(match.id);
        else setSelectedConvId(conversationsList[0].id);
      } else {
        const exists = conversationsList.some(c => c.id === selectedConvId);
        if (!selectedConvId || !exists) {
          setSelectedConvId(conversationsList[0].id);
        }
      }
    }
  }, [conversationsList, studentIdParam, selectedConvId]);

  // --- 2. FETCH REAL MESSAGES FOR SELECTED THREAD ---
  const { data: rawMessagesData, isLoading: loadingMsgs, refetch: refetchMsgs } = useQuery({
    queryKey: ['messagesThread', selectedConvId],
    queryFn: async () => {
      if (!selectedConvId) return [];
      const res = await getMessages(selectedConvId);
      return res?.data ?? res ?? [];
    },
    enabled: !!selectedConvId,
    staleTime: 1000 * 15,
  });

  // Resolve active conversation object
  const activeConv = useMemo(() => {
    return conversationsList.find(c => c.id === selectedConvId) || conversationsList[0] || null;
  }, [conversationsList, selectedConvId]);

  // Resolve active messages thread without fallback to dummy messages if DB list exists
  const activeMessages = useMemo(() => {
    let fetchedMsgs = [];
    if (Array.isArray(rawMessagesData)) {
      fetchedMsgs = rawMessagesData;
    } else if (Array.isArray(rawMessagesData?.data)) {
      fetchedMsgs = rawMessagesData.data;
    } else if (Array.isArray(rawMessagesData?.messages)) {
      fetchedMsgs = rawMessagesData.messages;
    } else if (Array.isArray(rawMessagesData?.data?.messages)) {
      fetchedMsgs = rawMessagesData.data.messages;
    }

    if (fetchedMsgs.length > 0) {
      return fetchedMsgs.map((m, idx) => {
        const isInstructor = m.senderId === user?.id || m.senderId === 'me' || m.sender === 'me' || m.isInstructor || m.sender === 'instructor' || m.senderRole === 'INSTRUCTOR';
        return {
          id: m.id || m._id || `m_${idx}`,
          sender: isInstructor ? 'instructor' : 'student',
          text: m.text || m.content || m.message || '',
          time: m.time || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently')
        };
      });
    }

    if (activeConv?.messages && activeConv.messages.length > 0) {
      return activeConv.messages;
    }

    return [];
  }, [rawMessagesData, activeConv, user?.id]);

  // --- 3. REAL MESSAGE SEND MUTATION ---
  const sendMutation = useMutation({
    mutationFn: async (text) => {
      return await sendMessage(selectedConvId, { text });
    },
    onSuccess: () => {
      refetchMsgs();
      refetchConvs();
      queryClient.invalidateQueries({ queryKey: ['messagesThread', selectedConvId] });
      setInputText('');
    },
  });

  // Filter conversations by search input
  const filteredConversations = useMemo(() => {
    return conversationsList.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversationsList, searchQuery]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Mark active conversation read via API
  useEffect(() => {
    if (selectedConvId) {
      markAsRead(selectedConvId).catch(() => {});
    }
  }, [selectedConvId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col bg-[#080B11] pb-10 select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#1A1F35] pb-4">
        <div>
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest font-mono">
            Messaging Center
          </h1>
          <p className="text-[10px] text-slate-550 font-semibold mt-0.5">
            Resolve student queries and coordinate learning activities with real-time API sync
          </p>
        </div>
        <Link href="/instructor/dashboard" className="text-[10px] font-black text-slate-500 hover:text-slate-350 flex items-center gap-1">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* CORE SPLIT INTERFACE */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-4 h-[550px] items-stretch">
        
        {/* LEFT COLUMN: ACTIVE CONVERSATIONS LIST */}
        <div className={`bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-4 flex flex-col gap-4 overflow-hidden h-full ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          {/* Search box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-[#1A1F35] text-[10.5px] pl-8 pr-3 py-2 rounded-xl outline-none text-slate-200 placeholder-slate-500 focus:border-slate-700 transition"
            />
          </div>

          {/* Conversations Thread Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {loadingConvs ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                <Loader2 size={18} className="animate-spin text-orange-500" />
                <span className="text-[10px] font-mono font-bold">Loading Chats...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-8">No chats found</p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 cursor-pointer ${
                    selectedConvId === conv.id
                      ? 'bg-orange-500/5 border-orange-500/20 text-slate-100'
                      : 'bg-white/[0.01] border-transparent hover:bg-white/[0.02] text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-200 truncate">{conv.name}</span>
                    <span className="text-[8px] font-bold text-slate-500">{conv.lastMsgTime}</span>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-500 truncate">{conv.course}</p>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[9.5px] text-slate-450 truncate max-w-[170px] leading-snug">
                      {conv.lastMessageText || 'No message preview'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-[8px] font-black h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE THREAD */}
        <div className={`bg-[#0D1021] border border-[#1A1F35] rounded-2xl flex flex-col overflow-hidden h-full ${selectedConvId ? 'flex' : 'hidden md:flex'}`}>
          {activeConv ? (
            <>
              {/* Active Chat Header */}
              <div className="px-5 py-4 border-b border-[#1A1F35] bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {/* Back button visible only on mobile */}
                  <button
                    onClick={() => setSelectedConvId('')}
                    className="md:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div>
                    <h3 className="text-xs font-black text-slate-200">{activeConv.name}</h3>
                    <p className="text-[9px] font-semibold text-slate-550 mt-0.5">{activeConv.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-450 font-black bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 animate-pulse shrink-0" />
                  Active Query
                </div>
              </div>

              {/* Chat Thread Bubbles */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingMsgs ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
                    <Loader2 size={20} className="animate-spin text-orange-500" />
                    <span className="text-[10px] font-mono font-bold">Syncing Messages...</span>
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                    <MessageSquare size={24} className="mb-2 text-slate-600" />
                    <p className="text-xs font-black text-slate-400">No messages in this chat yet</p>
                    <p className="text-[9.5px] text-slate-500 mt-1">Send a message below to start communicating with {activeConv.name}.</p>
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isInstructor = msg.sender === 'instructor';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col max-w-[70%] ${
                          isInstructor ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold ${
                            isInstructor
                              ? 'bg-orange-500 text-white rounded-tr-none'
                              : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-slate-550 mt-1 font-semibold">
                          {msg.time} {isInstructor && '• Sent'}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1A1F35] bg-white/[0.01] flex gap-3.5">
                <input
                  type="text"
                  placeholder="Type a message to student..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[#080B11] border border-[#1A1F35] text-xs px-4 py-2.5 rounded-xl outline-none text-slate-200 placeholder-slate-500 focus:border-slate-750 transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sendMutation.isPending}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white transition flex items-center justify-center cursor-pointer shrink-0"
                >
                  {sendMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare size={24} className="text-slate-600 mb-2" />
              <p className="text-xs font-black text-slate-400">No chat selected</p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">Please select an active conversation from the sidebar list.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
