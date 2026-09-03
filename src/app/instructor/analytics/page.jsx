"use client";

import { useEffect, useState, Suspense } from "react";
import { BarChart2, Video } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import ConceptMastery from "@/components/tables/ConceptMastery";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useDashboardKPIs, useConceptMastery } from "@/hooks/queries/instructor/useInstructorDashboard";

// Dynamically imported so recharts (bundled once per dynamic() boundary
// instead of once per static-import route) is shared across every
// chart-bearing page rather than duplicated in each one's own chunk.
const StudentEngagement = dynamic(() => import("@/components/instructor/dashboard/StudentEngagement"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-slate-800/50 rounded-2xl" />,
});

function InstructorAnalyticsContent() {
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get("courseId") || "";
  const [selectedCourseId, setSelectedCourseId] = useState(urlCourseId);

  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const { data: kpis = [] } = useDashboardKPIs(selectedCourseId);
  const { data: conceptMasteryData = [] } = useConceptMastery(selectedCourseId);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || null;
  const videoKpi = kpis.find((k) => k.title === "Total Video Watch Time");

  if (loadingCourses) return <Loader />;

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl border border-[#D9D9D9] bg-[#C1D3C6] p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight leading-none">Analytics</h1>
          <p className="text-xs text-[#333333] mt-1.5">Student engagement and concept mastery for {activeCourse?.title || "your course"}.</p>
        </div>
        {courses.length > 0 && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-[#D9D9D9] bg-[#C1D3C6] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:border-orange-500 transition cursor-pointer outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedCourseId ? (
        <Card className="p-10 border border-[#D9D9D9]! bg-[#C1D3C6]! text-center space-y-2">
          <BarChart2 size={26} className="mx-auto text-[#555555]" />
          <p className="text-xs font-bold text-[#333333]">Create a course to see analytics.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {videoKpi && (
            <Card className="p-6 border border-[#D9D9D9]! bg-[#C1D3C6]! shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-black">Total Video Engagement</h3>
                  <p className="text-xs text-[#333333] mt-1">Total time students spent watching video lessons in this course.</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-400">{videoKpi.value}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">{videoKpi.status}</div>
              </div>
            </Card>
          )}

          <StudentEngagement courseId={selectedCourseId} />

          <ConceptMastery data={conceptMasteryData} />
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
