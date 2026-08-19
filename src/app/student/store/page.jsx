"use client";

import { useMemo, useState } from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import CourseFilters from "@/components/student/courses/CourseFilters";
import StoreCourseGrid from "@/components/student/store/StoreCourseGrid";

import useStoreCourses from "@/hooks/queries/student/useStoreCourses";
import useMyCourses from "@/hooks/queries/student/useMyCourses";

export default function StudentStorePage() {
  const { data: courses = [], isLoading, isError } = useStoreCourses();
  const { data: myEnrollments = [] } = useMyCourses();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  const enrolledCourseIds = useMemo(() => {
    return new Set((myEnrollments || []).map((e) => e.courseId || e.course?.id).filter(Boolean));
  }, [myEnrollments]);

  // Store shows the full published catalog minus courses already enrolled in.
  const availableCourses = useMemo(() => {
    return courses.filter((course) => !enrolledCourseIds.has(course.id));
  }, [courses, enrolledCourseIds]);

  const categories = useMemo(() => {
    return [...new Set(availableCourses.map((course) => course.category).filter(Boolean))];
  }, [availableCourses]);

  const levels = useMemo(() => {
    return [...new Set(availableCourses.map((course) => course.level).filter(Boolean))];
  }, [availableCourses]);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        (course.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || course.category === category;
      const matchesLevel = !level || course.level === level;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [availableCourses, search, category, level]);

  const freeCount = filteredCourses.filter((c) => !c.store || c.store.isFree).length;
  const paidCount = filteredCourses.length - freeCount;

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Unable to load the store</h2>
        <p className="mt-2 text-slate-400">Please try again later.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Store" subtitle="Browse every published course and enroll." />

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">All Courses</h2>
          <p className="mt-1 text-sm text-slate-400">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} available
            {paidCount > 0 && ` • ${paidCount} paid`}
            {freeCount > 0 && ` • ${freeCount} free`}
          </p>
        </div>
      </div>

      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        level={level}
        onLevelChange={setLevel}
        categories={categories}
        levels={levels}
      />

      <StoreCourseGrid courses={filteredCourses} />
    </div>
  );
}
