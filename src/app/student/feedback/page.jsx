"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, Star, Smile, Meh, Frown } from "lucide-react";
import Link from "next/link";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import useCourse from "@/hooks/queries/student/useCourse";

function FeedbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const { data: course, isLoading, isError } = useCourse(courseId);

  const [rating, setRating] = useState(5);
  const [satisfaction, setSatisfaction] = useState("satisfied");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <Card className="border-transparent bg-background/60 p-8">
          <h2 className="text-xl font-bold text-foreground">Course not found</h2>
          <p className="text-xs text-muted-foreground mt-2">The feedback link is missing a valid course context.</p>
          <Link href="/student/my-courses">
            <button className="mt-6 px-5 py-2.5 bg-primary text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-primary transition">
              Back to My Courses
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-fade-in duration-300">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider bg-transparent border-0 outline-none cursor-pointer transition"
        >
          <ArrowLeft size={14} />
          Back to Course Player
        </button>
      </div>

      <PageHeader
        title="Course Feedback"
        subtitle={`Help us improve the quality of "${course.title || "this course"}" by sharing your thoughts.`}
      />

      {submitted ? (
        <Card className="p-8 border border-emerald-500/20 bg-emerald-500/5 text-center space-y-4 rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-black text-foreground tracking-tight">Feedback Submitted!</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for taking the time to share your feedback. Your input helps us and our instructors build better learning experiences.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition cursor-pointer"
          >
            Return to Learning
          </button>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 border border-transparent bg-background/60 rounded-3xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Satisfaction Level */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Overall Satisfaction</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "dissatisfied", label: "Needs Improvement", icon: Frown, color: "text-rose-500", border: "border-rose-500/20", bg: "bg-rose-500/5" },
                  { id: "neutral", label: "Neutral / Average", icon: Meh, color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/5" },
                  { id: "satisfied", label: "Highly Satisfied", icon: Smile, color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/5" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = satisfaction === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSatisfaction(item.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition cursor-pointer ${
                        isSelected
                          ? `bg-background/80 border-primary text-foreground`
                          : "border-transparent bg-background/10 text-muted-foreground hover:bg-background/40"
                      }`}
                    >
                      <Icon size={20} className={`${isSelected ? "text-primary" : "text-muted-foreground"} mb-2 transition`} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wide leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Rating */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Quality Rating (1 to 5)</label>
              <div className="flex items-center gap-2 bg-background/30 p-4 rounded-2xl border border-transparent">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition transform hover:scale-110 bg-transparent border-0 outline-none"
                  >
                    <Star
                      size={24}
                      className={star <= rating ? "fill-orange-500 text-orange-500" : "text-slate-700"}
                    />
                  </button>
                ))}
                <span className="text-xs font-black text-muted-foreground ml-4">{rating} out of 5 Stars</span>
              </div>
            </div>

            {/* Structured Questions */}
            <div className="space-y-4 border-t border-transparent pt-5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Structured Evaluations</label>
              
              <div className="space-y-4">
                {[
                  "The pacing of the course materials was well-balanced.",
                  "The concepts and quizzes accurately reflected real-world applications.",
                  "The learning resources provided were comprehensive and supportive."
                ].map((question, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-background/20 rounded-xl border border-border/60">
                    <span className="text-xs font-semibold text-foreground">{question}</span>
                    <div className="flex gap-2.5">
                      {["Disagree", "Neutral", "Agree"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border border-transparent bg-background hover:border-transparent text-muted-foreground hover:text-foreground cursor-pointer transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-2 border-t border-transparent pt-5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Detailed Review & Comments</label>
              <textarea
                rows={5}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about this course? How can we make it better?"
                className="w-full rounded-2xl border border-transparent bg-background/30 p-4 text-xs font-semibold text-foreground outline-none focus:border-primary transition leading-relaxed"
              />
            </div>

            {/* Submit block */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary hover:bg-primary text-slate-950 font-black uppercase text-xs tracking-widest shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
              >
                {submitting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Submitting Feedback...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <Send size={13} />
                  </>
                )}
              </button>
            </div>

          </form>
        </Card>
      )}

    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<Loader />}>
      <FeedbackPageContent />
    </Suspense>
  );
}
