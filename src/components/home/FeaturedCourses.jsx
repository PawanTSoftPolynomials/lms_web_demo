"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLandingData } from "@/services/landing.service";
import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getLandingData();
        if (data && data.courses) {
          // Show up to 6 featured courses on the grid
          setCourses(data.courses.slice(0, 6));
        }
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
        <h2 className="text-3xl font-bold mb-8 text-white">Featured Courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-[450px] bg-slate-900/60 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="flex justify-between items-center mb-8 select-none">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Featured Courses
        </h2>

        <Link
          href="/login"
          className="text-orange-400 hover:text-orange-300 text-sm font-bold uppercase tracking-wider"
        >
          View All
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <FeaturedCourseCard
            key={course.id}
            course={course}
          />
        ))}
      </div>
    </section>
  );
}