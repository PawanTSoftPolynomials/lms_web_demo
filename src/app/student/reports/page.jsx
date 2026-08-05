"use client";

import { useMemo, useState } from "react";
import { BookOpen, ClipboardCheck, ClipboardList, Medal } from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";

import ReportsTabStrip from "@/components/student/reports/ReportsTabStrip";
import ReportStreakCard from "@/components/student/reports/ReportStreakCard";
import ReportFilters from "@/components/student/reports/ReportFilters";
import ReportSummaryCard from "@/components/student/reports/ReportSummaryCard";
import ReportsEmptyState from "@/components/student/reports/ReportsEmptyState";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useProgress from "@/hooks/queries/student/useProgress";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useAssignments from "@/hooks/queries/student/useAssignments";
import useCertificates from "@/hooks/queries/student/useCertificates";

export default function StudentReportsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [timeRange, setTimeRange] = useState("All Time");

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: progressData, isLoading: progressLoading } = useProgress();

  const courses = progressData?.courses || [];
  const enrolledCourses = dashboardData?.enrolledCoursesList ?? [];
  const selectedCourse =
    selectedCourseId !== "all" ? courses.find((c) => c.id === selectedCourseId) : null;

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzes(
    selectedCourse ? selectedCourse.id : undefined
  );
  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignments();
  const { data: certificates = [], isLoading: certificatesLoading } = useCertificates();

  const filteredAssignments = useMemo(() => {
    if (!selectedCourse) return assignments;
    return assignments.filter((a) => (a.course?.title || a.courseTitle) === selectedCourse.title);
  }, [assignments, selectedCourse]);

  const filteredCertificates = useMemo(() => {
    if (!selectedCourse) return certificates;
    return certificates.filter((c) => c.course?.title === selectedCourse.title);
  }, [certificates, selectedCourse]);

  if (dashboardLoading || progressLoading) {
    return <Loader />;
  }

  const stats = dashboardData?.stats || {};
  const streak = stats.streak ?? 0;
  const hasEnrolledCourses = enrolledCourses.length > 0;
  const displayCourse = selectedCourse || courses[0] || null;

  const attemptedQuizzes = quizzes.filter((q) => !!q.quizSubmissions?.[0]);
  const passedQuizzes = attemptedQuizzes.filter((q) => q.quizSubmissions[0].passed);
  const avgQuizPercentage = attemptedQuizzes.length
    ? Math.round(
        attemptedQuizzes.reduce((sum, q) => sum + (q.quizSubmissions[0].percentage ?? 0), 0) /
          attemptedQuizzes.length
      )
    : 0;

  const assignmentBuckets = {
    Graded: filteredAssignments.filter((a) => a.status === "Graded").length,
    Pending: filteredAssignments.filter((a) => a.status !== "Submitted" && a.status !== "Graded").length,
  };

  return (
    <div className="space-y-4 pb-16">
      <PageHeader title="Reports" subtitle="Your grades, quiz performance, and course completion at a glance." />

      <ReportsTabStrip />

      <ReportStreakCard streak={streak} />

      {!hasEnrolledCourses ? (
        <ReportsEmptyState />
      ) : (
        <>
          <ReportFilters
            courses={courses}
            selectedCourseId={selectedCourseId}
            onCourseChange={setSelectedCourseId}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          <div className="space-y-2">
            <ReportSummaryCard
              icon={BookOpen}
              title="Course Progress"
              href="/student/progress"
              primaryText={displayCourse ? displayCourse.title : "No enrolled course yet."}
              secondaryText={displayCourse ? `${displayCourse.progress}% Complete` : undefined}
              progress={displayCourse ? displayCourse.progress : undefined}
            />

            <ReportSummaryCard
              icon={ClipboardCheck}
              title="Quiz Performance"
              href="/student/quizzes"
              primaryText={
                quizzesLoading
                  ? "Loading quiz results…"
                  : attemptedQuizzes.length === 0
                    ? "No quizzes attempted yet."
                    : `${avgQuizPercentage}% Average Score`
              }
              secondaryText={
                !quizzesLoading && attemptedQuizzes.length > 0
                  ? `${passedQuizzes.length}/${attemptedQuizzes.length} Passed`
                  : undefined
              }
            />

            <ReportSummaryCard
              icon={ClipboardList}
              title="Assignment Summary"
              href="/student/assignments"
              primaryText={
                assignmentsLoading
                  ? "Loading assignments…"
                  : filteredAssignments.length === 0
                    ? "No assignments yet."
                    : `${assignmentBuckets.Pending} Pending • ${assignmentBuckets.Graded} Graded`
              }
              secondaryText={
                !assignmentsLoading && filteredAssignments.length > 0
                  ? `${filteredAssignments.length} Total`
                  : undefined
              }
            />

            <ReportSummaryCard
              icon={Medal}
              title="Certificate Summary"
              href="/student/certificates"
              primaryText={
                certificatesLoading
                  ? "Loading certificates…"
                  : filteredCertificates.length === 0
                    ? "No certificates earned yet."
                    : `${filteredCertificates.length} Certificate${filteredCertificates.length > 1 ? "s" : ""} Earned`
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
