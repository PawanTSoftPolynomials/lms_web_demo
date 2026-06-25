"use client";

import { useEffect, useState } from "react";

import { getMyEnrollments } from "@/services/enrollment.service";

import Loader from "@/components/common/Loader";
import MyCourseCard from "@/components/student/MyCourseCard";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const response = await getMyEnrollments(user.id);

        setCourses(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">My Courses</h1>

        <p className="text-slate-400 mt-2">Continue your enrolled courses.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl text-center">
          No enrolled courses found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((enrollment) => (
            <MyCourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
