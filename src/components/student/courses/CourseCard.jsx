"use client";

import MyCourseCard from "@/components/student/my-courses/MyCourseCard";

export default function CourseCard({ course, enrollment, index = 0 }) {
  return <MyCourseCard course={course} enrollment={enrollment} index={index} />;
}
