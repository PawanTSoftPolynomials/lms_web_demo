"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  getCourseById,
  updateCourseStatus,
} from "@/services/course.service";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";

import StatusBadge from "@/components/courses/StatusBadge";
import CourseStatusSelector from "@/components/courses/CourseStatusSelector";

export default function CourseDetails() {
  const { courseId } =
    useParams();

  const [course, setCourse] =
    useState(null);

  const [status, setStatus] =
    useState("");

  useEffect(() => {
    const loadCourse =
      async () => {
        try {
          const response =
            await getCourseById(
              courseId
            );

          setCourse(response);

          setStatus(
            response.status
          );
        } catch (error) {
          console.error(error);
        }
      };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleStatusUpdate =
    async () => {
      try {
        await updateCourseStatus(
          courseId,
          status
        );

        setCourse({
          ...course,
          status,
        });

        alert(
          "Course status updated successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to update status"
        );
      }
    };

  if (!course) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        subtitle="Course Details"
      />

      <Card>
        <p className="text-slate-300">
          {course.description}
        </p>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <p className="text-slate-400 text-sm mb-2">
            Category
          </p>

          <p className="font-semibold">
            {course.category ||
              "N/A"}
          </p>
        </Card>

        <Card>
          <p className="text-slate-400 text-sm mb-2">
            Level
          </p>

          <p className="font-semibold">
            {course.level ||
              "N/A"}
          </p>
        </Card>

        <Card>
          <p className="text-slate-400 text-sm mb-2">
            Status
          </p>

          <StatusBadge
            status={
              course.status
            }
          />
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">
          Update Course Status
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <CourseStatusSelector
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          />

          <Button
            onClick={
              handleStatusUpdate
            }
          >
            Update Status
          </Button>
        </div>
      </Card>
    </div>
  );
}