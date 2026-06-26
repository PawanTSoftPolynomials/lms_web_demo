"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import StatusBadge from "@/components/courses/StatusBadge";

import { getCourses } from "@/services/course.service";

export default function InstructorCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses();

        setCourses(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!courses.length) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">No Courses Found</h2>

          <p className="text-slate-400 mt-2">Create your first course.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">My Courses</h1>

        <p className="text-slate-400 mt-2">Manage your courses and content.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="
        flex
        flex-col
        hover:border-orange-500
        transition
      "
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{course.title}</h2>

                  <p className="text-slate-400 mt-2 line-clamp-4">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">Category:</span>{" "}
                    {course.category}
                  </div>

                  <div>
                    <span className="text-slate-400">Level:</span>{" "}
                    {course.level}
                  </div>
                </div>

                <StatusBadge status={course.status} />
              </div>

              <button
                onClick={() => router.push(`/instructor/courses/${course.id}`)}
                className="
            w-full
            mt-6
            bg-orange-500
            hover:bg-orange-600
            rounded-lg
            py-3
            font-medium
            transition
          "
              >
                Manage Course
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
