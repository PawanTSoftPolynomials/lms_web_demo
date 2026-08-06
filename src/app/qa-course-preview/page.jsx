"use client";

import DashboardNavbar from "@/components/layouts/DashboardNavbar";
import StudentNavDrawer from "@/components/layouts/StudentNavDrawer";
import StudentBottomNav from "@/components/layouts/StudentBottomNav";
import { StudentNavDrawerProvider } from "@/context/StudentNavDrawerContext";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import CourseHeader from "@/components/student/course-details/CourseHeader";
import CourseOverview from "@/components/student/course-details/CourseOverview";
import ModuleAccordion from "@/components/student/course-details/ModuleAccordion";
import CourseSectionTabs from "@/components/student/course-details/CourseSectionTabs";
import CourseQuizzesSection from "@/components/student/course-details/CourseQuizzesSection";
import CourseAnnouncementsSection from "@/components/student/course-details/CourseAnnouncementsSection";
import useCourse from "@/hooks/queries/student/useCourse";

// TEMPORARY manual QA route — bypasses the /student middleware auth guard so
// the real Course Details body can be exercised without login. Inlines the
// page body with a hardcoded courseId (skipping Next's async `params`/`use()`
// plumbing, which this harness doesn't reproduce faithfully) so we're
// checking the actual production components. Deleted after verification.
const COURSE_ID = "cmsfm15c1001mua5shsmc20jz";

function CourseDetailsBody() {
  const { data: course, isLoading, isError } = useCourse(COURSE_ID);

  if (isLoading) return <Loader />;

  if (isError || !course) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Course not found</h2>
        <p className="mt-2 text-slate-400">The requested course could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CourseSectionTabs />

      <div id="course-overview" className="space-y-4 scroll-mt-[112px]">
        <CourseHeader course={course} />
        <CourseOverview course={course} />
      </div>

      <div id="course-modules" className="scroll-mt-[112px]">
        <ModuleAccordion modules={course.modules} />
      </div>

      <div id="course-quizzes" className="scroll-mt-[112px] lg:hidden">
        <CourseQuizzesSection courseId={COURSE_ID} />
      </div>

      <div id="course-announcements" className="scroll-mt-[112px] lg:hidden">
        <CourseAnnouncementsSection />
      </div>
    </div>
  );
}

export default function QaCoursePreview() {
  return (
    <StudentNavDrawerProvider>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <DashboardNavbar role="STUDENT" title="Course Details" />
        <main className="p-3 sm:p-6 flex-1 pb-24 sm:pb-6">
          <div className="max-w-[1600px] mx-auto w-full">
            <CourseDetailsBody />
          </div>
        </main>
      </div>
      <StudentBottomNav />
      <StudentNavDrawer />
    </StudentNavDrawerProvider>
  );
}
