"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCourseById } from "@/services/course.service";
import { enrollCourse } from "@/services/enrollment.service";

import CourseModal from "@/components/student/CourseModal";

export default function CourseDetails() {
  const { courseId } = useParams();

  const router = useRouter();

  const [course, setCourse] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      const data =
        await getCourseById(courseId);

      setCourse(data);
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      await enrollCourse(courseId);

      alert("Course enrolled successfully");

      router.back();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CourseModal
      course={course}
      isOpen={true}
      onClose={() => router.back()}
      onEnroll={handleEnroll}
    />
  );
}