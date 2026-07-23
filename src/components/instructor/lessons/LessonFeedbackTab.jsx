'use client';

import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

export default function LessonFeedbackTab({ lessonId }) {
  const feedbacks = [
    {
      id: 'fb1',
      studentName: 'Rohan Joshi',
      rating: 5,
      comment: 'Excellent video pace and explanation of the Servlet lifecycle hooks!',
      date: 'Jul 21, 2026'
    },
    {
      id: 'fb2',
      studentName: 'Priya Sen',
      rating: 4,
      comment: 'Very clear explanation. Adding a PDF diagram for request flow would make it even better.',
      date: 'Jul 20, 2026'
    },
    {
      id: 'fb3',
      studentName: 'Karan Malhotra',
      rating: 5,
      comment: 'Loved the hands-on code examples in IntelliJ.',
      date: 'Jul 18, 2026'
    }
  ];

  const avgRating = (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1);

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Average Lesson Rating Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#0D1021] to-purple-500/10 border border-orange-500/20 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Average Lesson Rating</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-white font-mono">{avgRating}</span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-400 font-extrabold font-mono">
          <span>{feedbacks.length} Feedback Comments</span>
        </div>
      </div>

      {/* Feedback List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {feedbacks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <MessageSquare size={24} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No student feedback for this lesson yet.</p>
          </div>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl bg-[#05070E] border border-[#1A1F35] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">{item.studentName}</span>
                <span className="text-[9px] text-slate-500 font-mono">{item.date}</span>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0D1021] p-2.5 rounded-lg border border-white/5">
                "{item.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
