'use client';

import { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, Clock, User, Filter } from 'lucide-react';

export default function LessonQueriesTab({ lessonId }) {
  const [queries, setQueries] = useState([
    {
      id: 'q1',
      studentName: 'Amit Sharma',
      avatar: 'A',
      question: 'In the Servlet Request lifecycle, does the service() method get called on every new thread?',
      status: 'Pending', // Pending | Answered
      askedAt: '2 hours ago',
      reply: ''
    },
    {
      id: 'q2',
      studentName: 'Sneha Patil',
      avatar: 'S',
      question: 'Where can I download the sample source code for the doGet controller demo?',
      status: 'Answered',
      askedAt: '1 day ago',
      reply: 'The source code repository link is attached in the Resources tab of this lesson.'
    }
  ]);

  const [filter, setFilter] = useState('All'); // All | Pending | Answered
  const [replyTextMap, setReplyTextMap] = useState({});

  const handleSendReply = (id) => {
    const text = replyTextMap[id];
    if (!text || !text.trim()) return;

    setQueries(queries.map(q => q.id === id ? { ...q, reply: text.trim(), status: 'Answered' } : q));
    setReplyTextMap({ ...replyTextMap, [id]: '' });
  };

  const handleToggleStatus = (id) => {
    setQueries(queries.map(q => q.id === id ? {
      ...q,
      status: q.status === 'Answered' ? 'Pending' : 'Answered'
    } : q));
  };

  const filteredQueries = queries.filter(q => {
    if (filter === 'Pending') return q.status === 'Pending';
    if (filter === 'Answered') return q.status === 'Answered';
    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Filter Selector Bar */}
      <div className="flex items-center justify-between border-b border-[#1A1F35] pb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
          <Filter size={13} className="text-orange-400" />
          <span>Queries ({filteredQueries.length})</span>
        </div>

        <div className="flex gap-1 bg-[#05070E] p-1 rounded-xl border border-[#1A1F35]">
          {['All', 'Pending', 'Answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition cursor-pointer ${
                filter === f ? 'bg-orange-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <HelpCircle size={24} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No student queries found.</p>
          </div>
        ) : (
          filteredQueries.map((q) => (
            <div key={q.id} className="p-3.5 rounded-xl bg-[#05070E] border border-[#1A1F35] space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-black">
                    {q.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white leading-tight">{q.studentName}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{q.askedAt}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                  q.status === 'Answered'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {q.status}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0D1021] p-2.5 rounded-lg border border-white/5">
                "{q.question}"
              </p>

              {/* Reply Section */}
              {q.reply ? (
                <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-1">
                  <p className="text-[9px] font-black text-orange-400 uppercase tracking-wider font-mono">Your Instructor Reply</p>
                  <p className="text-xs text-slate-200">{q.reply}</p>
                </div>
              ) : null}

              {/* Reply Form & Resolution Toggle */}
              <div className="space-y-2 pt-1 border-t border-[#1A1F35]/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={replyTextMap[q.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [q.id]: e.target.value })}
                    className="flex-1 bg-[#0D1021] border border-[#1A1F35] text-xs text-slate-200 placeholder-slate-500 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-500/50"
                  />
                  <button
                    onClick={() => handleSendReply(q.id)}
                    disabled={!replyTextMap[q.id]?.trim()}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 font-black text-[10px] flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Send size={11} /> Reply
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleToggleStatus(q.id)}
                    className="text-[9.5px] font-black text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                  >
                    <CheckCircle2 size={11} /> Mark as {q.status === 'Answered' ? 'Pending' : 'Resolved'}
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
