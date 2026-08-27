"use client";

import { useMemo } from "react";

// Shared "browse courses not already enrolled in" filtering — used by both
// the Browse Courses page and the Store page, which otherwise had two
// separately-maintained copies of the same enrolled-exclusion + category/
// level faceting + search logic.
export default function useAvailableCourseFilters({ courses, myEnrollments, search, category, level }) {
  const enrolledCourseIds = useMemo(
    () => new Set((myEnrollments || []).map((e) => e.courseId || e.course?.id).filter(Boolean)),
    [myEnrollments]
  );

  const availableCourses = useMemo(
    () => courses.filter((course) => !enrolledCourseIds.has(course.id)),
    [courses, enrolledCourseIds]
  );

  const categories = useMemo(
    () => [...new Set(availableCourses.map((course) => course.category).filter(Boolean))],
    [availableCourses]
  );

  const levels = useMemo(
    () => [...new Set(availableCourses.map((course) => course.level).filter(Boolean))],
    [availableCourses]
  );

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

  return { availableCourses, categories, levels, filteredCourses };
}
