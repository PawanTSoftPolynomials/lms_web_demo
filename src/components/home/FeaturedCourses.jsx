"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLandingData } from "@/services/landing.service";
import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";
import Eyebrow from "@/components/ui/Eyebrow";

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
        <h2 className="text-3xl font-bold mb-8 text-foreground">Featured Courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-[450px] bg-background/60 border border-border rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="flex justify-between items-end mb-8 select-none">
        <div>
          <Eyebrow>Our Courses</Eyebrow>
          <h2 className="text-3xl font-bold text-foreground tracking-tight mt-4">
            Featured Courses
          </h2>
        </div>

        <Link
          href="/login"
          className="text-primary hover:brightness-125 text-sm font-bold uppercase tracking-wider"
        >
          View All
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <FeaturedCourseCard
            key={course.id}
            course={course}
            highlighted={index === 1}
          />
        ))}
      </div>
    </section>
  );
}