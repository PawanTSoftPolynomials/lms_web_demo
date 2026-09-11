"use client";

// TEMPORARY verification harness -- deleted immediately after screenshotting.
import SnapCardSlider from "@/components/ui/SnapCardSlider";
import StoreCourseCard from "@/components/student/store/StoreCourseCard";
import MyCourseCard from "@/components/student/my-courses/MyCourseCard";

const COURSES = Array.from({ length: 8 }).map((_, i) => ({
  id: `c${i}`,
  title: i === 0 ? "C Programming - Part 2 (Module 3)" : `Sample Course Number ${i}`,
  description: "Continue C programming mastery: arrays and their relationship with pointers.",
  category: "Computer Science",
  level: i % 2 ? "Beginner" : "Intermediate",
  thumbnailUrl: null,
  creator: { name: "Vedika Mangalvedhekar" },
  _count: { modules: 1, lessons: 4, reviews: i },
  stats: { avgRating: i ? 4.3 : 0, lessonsCount: 4 },
  store: i % 3 === 0 ? { isFree: true } : { isFree: false, price: 4999, discountPrice: 1999, currency: "INR" },
}));

const ENROLLMENTS = COURSES.slice(0, 5).map((c, i) => ({
  id: `e${i}`,
  progress: i * 25,
  enrolledAt: "2026-01-01",
  course: { ...c, modules: [{ lessons: [1, 2] }] },
}));

export default function SliderCheck() {
  return (
    <div className="p-4 space-y-10">
      {/* --- EXPLORE page shell, classes copied from app/student/courses/page.jsx --- */}
      <div id="explore" className="-m-2 sm:-m-6 md:-m-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-8 flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0 min-w-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
          <SnapCardSlider
            items={COURSES}
            getKey={(course) => course.id}
            renderItem={(course) => <StoreCourseCard course={course} />}
            gridClassName="md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            dotsLabel="Course slides"
            getDotLabel={(course, i) => `Go to ${course.title || `course slide ${i + 1}`}`}
            emptyState={<div>empty</div>}
          />
        </div>
      </div>

      {/* --- MY COURSES shell, classes copied from app/student/my-courses/page.jsx --- */}
      <div id="mycourses" className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1 md:-mr-1">
          <SnapCardSlider
            items={ENROLLMENTS}
            getKey={(e) => e.id || e.courseId}
            renderItem={(e) => <MyCourseCard enrollment={e} />}
            gridClassName="md:justify-items-center md:grid-cols-[repeat(auto-fill,minmax(272px,288px))]"
            itemClassName="md:max-w-72"
            emptyState={<div>empty</div>}
            dotsLabel="Course slides"
            getDotLabel={(_, i) => `Go to course slide ${i + 1}`}
          />
        </div>
      </div>

      {/* --- ORIGINAL inline My Courses markup, verbatim from git HEAD --- */}
      <div id="mycourses-original" className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1 md:-mr-1">
          <div
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none pb-1 md:gap-4 md:pb-0 md:grid md:justify-items-center md:grid-cols-[repeat(auto-fill,minmax(272px,288px))] md:overflow-visible md:snap-none"
          >
            {ENROLLMENTS.map((enrollment) => (
              <div
                key={enrollment.id || enrollment.courseId}
                className="w-full shrink-0 snap-center px-[6%] md:px-0 md:w-full md:max-w-72 md:shrink"
              >
                <MyCourseCard enrollment={enrollment} />
              </div>
            ))}
          </div>

          <div className="flex md:hidden items-center justify-center gap-1.5 pt-3" role="tablist" aria-label="Course slides">
            {ENROLLMENTS.map((enrollment, i) => (
              <button
                key={enrollment.id || i}
                role="tab"
                aria-selected={i === 0}
                aria-label={`Go to course slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === 0 ? "w-2 h-2 bg-primary" : "w-1.5 h-1.5 bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
