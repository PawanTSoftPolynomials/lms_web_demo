"use client";

import { useEffect, useMemo, useState } from "react";

import MarketplaceCard from "@/components/students/MarketplaceCard";
import { getCourses } from "../../../services/course.service";
import { enrollCourse } from "../../../services/enrollment.service";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        const data = response.data || response;

        const formattedCourses = data.map((course) => ({
          id: course.id,
          title: course.title,
          instructor: course.creator?.name || "Unknown",
          category: course.category || "General",
          level: course.level || "Beginner",
          enrolled: false,
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Course fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, enrolled: true }
            : course
        )
      );
    } catch (error) {
      console.error("Enrollment failed:", error);

      // Duplicate enrollment handling
      if (
        error?.response?.data?.message?.includes(
          "Unique constraint"
        )
      ) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId
              ? { ...course, enrolled: true }
              : course
          )
        );
      }
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [courses, search]);

  if (loading) {
    return <div className="text-white">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          All Courses
        </h1>

        <p className="text-gray-400 mt-2">
          Explore and enroll in new courses.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full md:w-96
          px-4 py-3
          rounded-lg
          bg-slate-900
          border border-slate-700
        "
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <MarketplaceCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
            />
          ))
        ) : (
          <p className="text-gray-400">
            No courses found.
          </p>
        )}
      </div>
    </div>
  );
}