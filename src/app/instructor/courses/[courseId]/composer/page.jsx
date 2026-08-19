"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import Loader from "@/components/common/Loader";
import CourseComposer from "@/components/instructor/composer/CourseComposer";

export default function CourseComposerPage() {
  const params = useParams();
  const courseId = params.courseId;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader />
        </div>
      }
    >
      <CourseComposer courseId={courseId} />
    </Suspense>
  );
}
