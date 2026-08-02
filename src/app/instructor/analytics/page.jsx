"use client";

import { useEffect, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Video } from "lucide-react";
import { useSearchParams } from "next/navigation";

import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import StudentEngagement from "@/components/instructor/dashboard/StudentEngagement";
import ConceptMastery from "@/components/tables/ConceptMastery";

function InstructorAnalyticsContent() {
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get("courseId") || "";
  const [selectedCourseId, setSelectedCourseId] = useState(urlCourseId);

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["instructorCoursesList"],
    queryFn: async () => {
      const { data } = await api.get("/courses");
      return data.data ?? data;
    },
  });

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const { data: dashboardData } = useQuery({
    queryKey: ["instructorDashboard", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      const { data } = await api.get(`/dashboard/instructor?courseId=${selectedCourseId}`);
      return data.data ?? data;
    },
    enabled: !!selectedCourseId,
  });

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || null;
  const videoKpi = dashboardData?.kpis?.find((k) => k.title === "Total Video Watch Time");

  if (loadingCourses) return <Loader />;

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Analytics</h1>
          <p className="text-xs text-slate-400 mt-1.5">Student engagement and concept mastery for {activeCourse?.title || "your course"}.</p>
        </div>
        {courses.length > 0 && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:border-orange-500 transition cursor-pointer outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedCourseId ? (
        <Card className="p-10 border border-slate-800 bg-slate-900/60 text-center space-y-2">
          <BarChart2 size={26} className="mx-auto text-slate-600" />
          <p className="text-xs font-bold text-slate-400">Create a course to see analytics.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {videoKpi && (
            <Card className="p-6 border border-slate-800 bg-slate-900/60 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Total Video Engagement</h3>
                  <p className="text-xs text-slate-400 mt-1">Total time students spent watching video lessons in this course.</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-400">{videoKpi.value}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">{videoKpi.status}</div>
              </div>
            </Card>
          )}

          <StudentEngagement courseId={selectedCourseId} />

          <ConceptMastery
            title="Module & Quiz Concept Mastery"
            subtitle="Average percentage score metrics across lesson groups"
          />
        </div>
      )}
    </div>
  );
}

export default function InstructorAnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><Loader /></div>}>
      <InstructorAnalyticsContent />
    </Suspense>
  );
}
