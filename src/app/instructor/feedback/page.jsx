"use client";

import { useState } from "react";
import { Star, MessageSquareText, Loader2 } from "lucide-react";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useMyReviews } from "@/hooks/queries/instructor/useMyReviews";

const selectClass =
  "w-full bg-white/[0.02] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition";
const labelClass = "text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
      <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1.5">{value}</p>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={12} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-700"} />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { data: courses = [] } = useInstructorCourses();
  const [filters, setFilters] = useState({ courseId: "", rating: "", startDate: "", endDate: "" });
  const { data, isLoading } = useMyReviews(filters);

  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Feedback</h1>
        <p className="text-xs text-slate-400 mt-1">Student ratings and reviews across your courses.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Average Rating" value={data ? `${data.averageRating.toFixed(1)} / 5` : "—"} />
        <StatCard label="Total Reviews" value={data?.totalReviews ?? "—"} />
      </div>

      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Course</label>
            <select className={selectClass} value={filters.courseId} onChange={(e) => setFilters((f) => ({ ...f, courseId: e.target.value }))}>
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rating</label>
            <select className={selectClass} value={filters.rating} onChange={(e) => setFilters((f) => ({ ...f, rating: e.target.value }))}>
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} Stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>From</label>
            <input type="date" className={selectClass} value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>To</label>
            <input type="date" className={selectClass} value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 size={20} className="animate-spin text-orange-450" /></div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <MessageSquareText size={22} className="mx-auto text-slate-600" />
            <p className="text-xs font-bold">No feedback found for the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-[#1A1F35] bg-white/[0.015]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{r.student?.user?.name || "Student"}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.course?.title} • {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                {r.review && <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
