'use client';

import { Star, MessageSquare, Loader2 } from 'lucide-react';

import { useCourseReviews } from '@/hooks/queries/instructor/useCourseReviews';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function LessonFeedbackTab({ courseId }) {
  const { data: reviews = [], isLoading } = useCourseReviews(courseId);

  const withComments = reviews.filter((r) => r.review && r.review.trim().length > 0);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 size={20} className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Average Course Rating Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#0D1021] to-purple-500/10 border border-orange-500/20 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Average Course Rating</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-white font-mono">{avgRating}</span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-400 font-extrabold font-mono">
          <span>{withComments.length} Feedback Comment{withComments.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Feedback List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {withComments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <MessageSquare size={24} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No student feedback for this course yet.</p>
          </div>
        ) : (
          withComments.map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl bg-[#05070E] border border-[#1A1F35] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">{item.student?.user?.name || 'Student'}</span>
                <span className="text-[9px] text-slate-500 font-mono">{formatDate(item.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0D1021] p-2.5 rounded-lg border border-white/5">
                "{item.review}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
