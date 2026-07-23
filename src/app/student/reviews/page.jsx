"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Edit, Send, Sparkles, MessageSquare, User } from "lucide-react";
import Link from "next/link";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import useCourse from "@/hooks/queries/student/useCourse";

function ReviewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const { data: course, isLoading, isError } = useCourse(courseId);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewsList, setReviewsList] = useState([
    {
      id: "rev1",
      studentName: "Prasad Kulkarni",
      rating: 5,
      date: "July 12, 2026",
      text: "Excellent course! The modules on Servlet mapping and JSP tags were detailed and clear. Strongly recommended for enterprise Java developers."
    },
    {
      id: "rev2",
      studentName: "Ayan Khan",
      rating: 4,
      date: "July 08, 2026",
      text: "Really good explanations. Pacing is great, although a few more exercises for the self-generate quiz section would make it even better."
    },
    {
      id: "rev3",
      studentName: "Pawan Manohar",
      rating: 5,
      date: "June 28, 2026",
      text: "Orange Tree LMS course delivery is top notch. The sticky notes panel is extremely helpful to bookmark codes during video player sessions."
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const ratingSummary = useMemo(() => {
    if (reviewsList.length === 0) return { avg: 0, count: 0 };
    const total = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    return {
      avg: (total / reviewsList.length).toFixed(1),
      count: reviewsList.length
    };
  }, [reviewsList]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <Card className="border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-xl font-bold text-white">Course not found</h2>
          <p className="text-xs text-slate-400 mt-2">The reviews page is missing a valid course context.</p>
          <Link href="/student/my-courses">
            <button className="mt-6 px-5 py-2.5 bg-orange-500 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-orange-655 transition">
              Back to My Courses
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setSubmitError("Please enter some review text first.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    setTimeout(() => {
      const newReview = {
        id: `rev_${Date.now()}`,
        studentName: "You",
        rating: rating,
        date: "Just now",
        text: reviewText.trim()
      };
      setReviewsList([newReview, ...reviewsList]);
      setReviewText("");
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in duration-300">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-orange-505 font-bold uppercase tracking-wider bg-transparent border-0 outline-none cursor-pointer transition"
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
          <Card className="p-6 border border-slate-800 bg-slate-900/60 rounded-3xl text-center space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average rating</h3>
            <div className="text-4xl font-black text-white">{ratingSummary.avg}</div>
            <div className="flex justify-center items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= Math.round(ratingSummary.avg) ? "fill-orange-500 text-orange-550" : "text-slate-700"}
                />
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{ratingSummary.count} Student Reviews</p>
          </Card>

          {/* Review Submission Form Card */}
          <Card className="p-6 border border-slate-800 bg-slate-900/60 rounded-3xl space-y-5">
            <div className="flex items-center gap-2">
              <Edit size={16} className="text-orange-500" />
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Write a Review</h4>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Select Stars</span>
                <div className="flex items-center gap-1 bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/80">
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
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/20 p-3 text-xs font-semibold text-white outline-none focus:border-orange-505 transition"
                />
              </div>

              {submitError && (
                <div className="text-[10px] font-bold text-rose-455 uppercase tracking-wide bg-rose-500/5 p-2 rounded-lg border border-rose-500/15">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-655 text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer border-0"
              >
                {submitting ? "Posting..." : "Post Review"}
                <Send size={11} />
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column: Reviews List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 pl-1">Written Reviews</h3>
          
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <Card key={rev.id} className="p-5 border border-slate-800 bg-slate-900/30 rounded-3xl space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="h-9 w-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">
                      {rev.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-100">{rev.studentName}</h4>
                      <span className="text-[9px] text-slate-500 font-semibold">{rev.date}</span>
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

                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {rev.text}
                </p>
              </Card>
            ))}
          </div>
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
