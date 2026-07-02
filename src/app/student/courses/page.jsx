"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import MarketplaceCard from "@/components/students/MarketplaceCard";

import useCourses from "@/hooks/queries/students/useCourses";
import useEnrollCourse from "@/hooks/queries/students/useEnrollCourse";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useCourses();
  const enrollCourseMutation = useEnrollCourse();

  const courses = useMemo(() => {
    const items = Array.isArray(data) ? data : [];

    return items.map((course) => ({
      id: course.id,
      title: course.title,
      instructor: course.creator?.name || course.instructor || "Unknown",
      category: course.category || "General",
      level: course.level || "Beginner",
      enrolled: Boolean(course.enrolled || course.isEnrolled),
      description: course.description || "",
    }));
  }, [data]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  const handleEnroll = async (courseId) => {
    enrollCourseMutation.mutate(courseId);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Card className="text-slate-300">Unable to load courses right now.</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Courses"
        subtitle="Explore and enroll in new courses."
      />

      <div className="max-w-xl">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <MarketplaceCard key={course.id} course={course} onEnroll={handleEnroll} />
          ))
        ) : (
          <p className="text-slate-400">No courses found.</p>
        )}
      </div>
    </div>
  );
}