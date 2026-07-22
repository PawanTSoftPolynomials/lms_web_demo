'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Search, ArrowLeft, Users, CheckCheck } from 'lucide-react';

const mockConversations = [
  {
    id: 'conv1',
    name: 'Amit Sharma',
    course: 'Java Full Stack Development',
    unreadCount: 1,
    lastMsgTime: '15 mins ago',
    messages: [
      { sender: 'student', text: 'Hello instructor, I had a query regarding Quiz 2 question 4. Is the option B correct?', time: 'Yesterday, 4:12 PM' },
      { sender: 'instructor', text: 'Hi Amit, yes, option B is correct because the streams API processes elements lazily. Check the recap slides in Module 2.', time: 'Yesterday, 5:30 PM' },
      { sender: 'student', text: 'Got it, thank you! Also, can you please check my Quiz 2 submission? I got some errors in the compilation step.', time: '15 mins ago' }
    ]
  },
  {
    id: 'conv2',
    name: 'Meera Deshmukh',
    course: 'React Development',
    unreadCount: 0,
    lastMsgTime: '1 hour ago',
    messages: [
      { sender: 'instructor', text: 'Hello Meera, excellent work on the React Concurrent rendering assignment! You scored 98.', time: 'Yesterday, 11:30 AM' },
      { sender: 'student', text: 'Thank you so much! I uploaded the updated module file containing the extra credit features.', time: '1 hour ago' }
    ]
  },
  {
    id: 'conv3',
    name: 'Rahul Varma',
    course: 'Express API Design & Security',
    unreadCount: 0,
    lastMsgTime: '2 days ago',
    messages: [
      { sender: 'student', text: 'Hi Sir, I am facing some issues setting up the JWT authentication middleware in my local node project.', time: '2 days ago' },
      { sender: 'instructor', text: 'Hi Rahul, make sure you installed the jsonwebtoken package and configured the secret key in your .env configuration.', time: '2 days ago' }
    ]
  }
];

export default function MessagingCenterPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConvId, setSelectedConvId] = useState('conv1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  const chatEndRef = useRef(null);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Selected conversation object
  const activeConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Mark active conversation read
  useEffect(() => {
    if (selectedConvId) {
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConvId ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  }, [selectedConvId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            lastMsgTime: 'Just now',
            messages: [
              ...c.messages,
              { sender: 'instructor', text: inputText.trim(), time: 'Just now' }
            ]
          };
        }
        return c;
      })
    );

    setInputText('');
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col bg-[#080B11] pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#1A1F35] pb-4">
        <div>
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest font-mono">
            Messaging Center
          </h1>
          <p className="text-[10px] text-slate-550 font-semibold mt-0.5">
            Resolve student queries and coordinate learning activities
          </p>
        </div>
        <Link href="/instructor/dashboard" className="text-[10px] font-black text-slate-500 hover:text-slate-350 flex items-center gap-1">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* CORE SPLIT INTERFACE */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-4 h-[550px] items-stretch">
        
        {/* LEFT COLUMN: ACTIVE CONVERSATIONS LIST */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-4 flex flex-col gap-4 overflow-hidden h-full">
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
            {filteredConversations.length === 0 ? (
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
                      {conv.messages[conv.messages.length - 1]?.text}
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
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl flex flex-col overflow-hidden h-full">
          {activeConv ? (
            <>
              {/* Active Chat Header */}
              <div className="px-5 py-4 border-b border-[#1A1F35] bg-white/[0.01] flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-200">{activeConv.name}</h3>
                  <p className="text-[9px] font-semibold text-slate-550 mt-0.5">{activeConv.course}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-450 font-black bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 animate-pulse shrink-0" />
                  Active Query
                </div>
              </div>

              {/* Chat Thread Bubbles */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeConv.messages.map((msg, idx) => {
                  const isInstructor = msg.sender === 'instructor';
                  return (
                    <div
                      key={idx}
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
                })}
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
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white transition flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send size={13} />
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
