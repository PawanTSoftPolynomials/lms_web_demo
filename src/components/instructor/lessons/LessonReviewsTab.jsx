'use client';

import { Star, Loader2 } from 'lucide-react';

import { useCourseReviews, useCourseReviewStats } from '@/hooks/queries/instructor/useCourseReviews';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function LessonReviewsTab({ courseId }) {
  const { data: reviews = [], isLoading: loadingReviews } = useCourseReviews(courseId);
  const { data: stats, isLoading: loadingStats } = useCourseReviewStats(courseId);

  const isLoading = loadingReviews || loadingStats;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, percentage, count };
  });

  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Course Overall Rating Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0D1021] via-[#0D1021] to-orange-950/20 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground font-mono">Overall Course Rating</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-foreground font-mono">
                {(stats?.averageRating ?? 0).toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">out of 5</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-0.5 text-amber-400 justify-end">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(stats?.averageRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-1">
              {stats?.totalReviews ?? 0} Review{(stats?.totalReviews ?? 0) === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Rating Distribution Bar Chart */}
        {reviews.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-2 text-[10px] font-mono">
                <span className="w-6 text-muted-foreground font-bold">{dist.stars} ★</span>
                <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground font-bold">{dist.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground font-mono border-b border-border pb-1.5">
          Recent Course Reviews
        </p>

        {recentReviews.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <Star size={24} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No reviews for this course yet.</p>
          </div>
        ) : (
          recentReviews.map((rev) => (
            <div key={rev.id} className="p-3.5 rounded-xl bg-[#05070E] border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground">{rev.student?.user?.name || 'Student'}</span>
                <span className="text-[9px] text-muted-foreground font-mono">{formatDate(rev.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                  />
                ))}
              </div>

              {rev.review && (
                <p className="text-xs text-foreground leading-relaxed font-normal bg-card p-2.5 rounded-lg border border-white/5">
                  "{rev.review}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
