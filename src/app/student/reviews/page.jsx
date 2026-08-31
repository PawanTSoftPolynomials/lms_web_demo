"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Edit, Send } from "lucide-react";
import Link from "next/link";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import useCourse from "@/hooks/queries/student/useCourse";
import useCourseReviews from "@/hooks/queries/student/useCourseReviews";
import useCourseReviewStats from "@/hooks/queries/student/useCourseReviewStats";
import useCreateReview from "@/hooks/queries/student/useCreateReview";

function ReviewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const { data: course, isLoading, isError } = useCourse(courseId);
  const { data: reviewsList = [] } = useCourseReviews(courseId);
  const { data: stats } = useCourseReviewStats(courseId);
  const createReviewMutation = useCreateReview();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitError, setSubmitError] = useState("");

  const ratingSummary = {
    avg: stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "0.0",
    count: stats?.totalReviews ?? reviewsList.length,
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <Card className="border-transparent bg-background/60 p-8">
          <h2 className="text-xl font-bold text-foreground">Course not found</h2>
          <p className="text-xs text-muted-foreground mt-2">The reviews page is missing a valid course context.</p>
          <Link href="/student/my-courses">
            <button className="mt-6 px-5 py-2.5 bg-primary text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-orange-655 transition">
              Back to My Courses
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setSubmitError("Please enter some review text first.");
      return;
    }
    setSubmitError("");

    try {
      await createReviewMutation.mutateAsync({
        courseId,
        rating,
        review: reviewText.trim(),
      });
      setReviewText("");
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in duration-300">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-orange-505 font-bold uppercase tracking-wider bg-transparent border-0 outline-none cursor-pointer transition"
        >
          <ArrowLeft size={14} />
          Back to Course Player
        </button>
      </div>

      <PageHeader
        title="Student Reviews"
        subtitle={`See what others say about "${course.title || "this course"}", or add your own review.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Summary & Review Submission */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Summary Card */}
          <Card className="p-6 border border-transparent bg-background/60 rounded-3xl text-center space-y-3">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Average rating</h3>
            <div className="text-4xl font-black text-foreground">{ratingSummary.avg}</div>
            <div className="flex justify-center items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= Math.round(ratingSummary.avg) ? "fill-orange-500 text-orange-550" : "text-slate-700"}
                />
              ))}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{ratingSummary.count} Student Reviews</p>
          </Card>

          {/* Review Submission Form Card */}
          <Card className="p-6 border border-transparent bg-background/60 rounded-3xl space-y-5">
            <div className="flex items-center gap-2">
              <Edit size={16} className="text-primary" />
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Write a Review</h4>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Select Stars</span>
                <div className="flex items-center gap-1 bg-background/20 p-2.5 rounded-xl border border-transparent/80">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 cursor-pointer bg-transparent border-0 outline-none"
                    >
                      <Star
                        size={16}
                        className={star <= rating ? "fill-orange-500 text-orange-505" : "text-slate-700"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block">Review Details</span>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience learning this course..."
                  className="w-full rounded-xl border border-transparent bg-background/20 p-3 text-xs font-semibold text-foreground outline-none focus:border-orange-505 transition"
                />
              </div>

              {submitError && (
                <div className="text-[10px] font-bold text-rose-455 uppercase tracking-wide bg-rose-500/5 p-2 rounded-lg border border-rose-500/15">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-orange-655 text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer border-0"
              >
                {createReviewMutation.isPending ? "Posting..." : "Post Review"}
                <Send size={11} />
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column: Reviews List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 pl-1">Written Reviews</h3>
          
          {reviewsList.length === 0 ? (
            <Card className="p-8 border border-transparent bg-background/30 rounded-3xl text-center">
              <p className="text-xs text-muted-foreground">No reviews yet — be the first to share your thoughts!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((rev) => {
                const reviewerName = rev.student?.user?.name || "Anonymous Student";
                return (
                  <Card key={rev.id} className="p-5 border border-transparent bg-background/30 rounded-3xl space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-foreground">{reviewerName}</h4>
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            className={star <= rev.rating ? "fill-orange-500 text-orange-550" : "text-slate-700"}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {rev.review}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ReviewsPageContent />
    </Suspense>
  );
}
