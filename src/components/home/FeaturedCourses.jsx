"use client";

import { useEffect } from "react";
import { useState } from "react";

import {
  getCourses,
} from "@/services/course.service";

import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";

export default function FeaturedCourses() {
  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchCourses =
      async () => {
        try {
          const data =
            await getCourses();

          setCourses(
            data.slice(0, 6)
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <h2 className="text-3xl font-bold mb-8">
          Featured Courses
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(6)].map(
            (_, index) => (
              <div
                key={index}
                className="h-80 bg-slate-900 rounded-xl animate-pulse"
              />
            )
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          Featured Courses
        </h2>

        <a
          href="/courses"
          className="text-orange-400 hover:text-orange-300"
        >
          View All
        </a>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(
          (course) => (
            <FeaturedCourseCard
              key={course.id}
              course={course}
            />
          )
        )}
      </div>
    </section>
  );
}