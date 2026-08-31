"use client";

import { useState } from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import CourseFilters from "@/components/student/courses/CourseFilters";
import StoreCourseGrid from "@/components/student/store/StoreCourseGrid";

import useStoreCourses from "@/hooks/queries/student/useStoreCourses";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import useAvailableCourseFilters from "@/hooks/queries/student/useAvailableCourseFilters";

export default function StudentStorePage() {
  const { data: courses = [], isLoading, isError } = useStoreCourses();
  const { data: myEnrollments = [] } = useMyCourses();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  // Store shows the full published catalog minus courses already enrolled in.
  const { categories, levels, filteredCourses } = useAvailableCourseFilters({
    courses,
    myEnrollments,
    search,
    category,
    level,
  });

  const freeCount = filteredCourses.filter((c) => !c.store || c.store.isFree).length;
  const paidCount = filteredCourses.length - freeCount;

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load the store</h2>
        <p className="mt-2 text-muted-foreground">Please try again later.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Store" subtitle="Browse every published course and enroll." />

      <div className="rounded-xl border border-transparent bg-background p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All Courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
