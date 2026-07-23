'use client';

import { Star, Award, TrendingUp } from 'lucide-react';

export default function LessonReviewsTab({ courseId }) {
  const ratingDistribution = [
    { stars: 5, percentage: 78, count: 98 },
    { stars: 4, percentage: 15, count: 18 },
    { stars: 3, percentage: 5, count: 6 },
    { stars: 2, percentage: 1, count: 1 },
    { stars: 1, percentage: 1, count: 1 }
  ];

  const recentReviews = [
    {
      id: 'rev1',
      studentName: 'Alex Morgan',
      rating: 5,
      date: 'Jul 19, 2026',
      review: 'Top-tier curriculum! The explanations of backend thread execution are unmatched.'
    },
    {
      id: 'rev2',
      studentName: 'Meera Deshmukh',
      rating: 5,
      date: 'Jul 15, 2026',
      review: 'Well structured course modules with excellent code walkthroughs.'
    }
  ];

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Course Overall Rating Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0D1021] via-[#0D1021] to-orange-950/20 border border-[#1A1F35] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Overall Course Rating</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-white font-mono">4.8</span>
              <span className="text-[10px] text-slate-400 font-mono">out of 5</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-0.5 text-amber-400 justify-end">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">124 Global Reviews</p>
          </div>
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="space-y-1.5 pt-2 border-t border-[#1A1F35]">
          {ratingDistribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-2 text-[10px] font-mono">
              <span className="w-6 text-slate-400 font-bold">{dist.stars} ★</span>
              <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-slate-400 font-bold">{dist.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono border-b border-[#1A1F35] pb-1.5">
          Recent Course Reviews
        </p>

        {recentReviews.map((rev) => (
          <div key={rev.id} className="p-3.5 rounded-xl bg-[#05070E] border border-[#1A1F35] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white">{rev.studentName}</span>
              <span className="text-[9px] text-slate-500 font-mono">{rev.date}</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}
                />
              ))}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0D1021] p-2.5 rounded-lg border border-white/5">
              "{rev.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
