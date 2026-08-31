"use client";

import { FaArrowLeft, FaLayerGroup, FaSignal } from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";

import Button from "@/components/ui/Button";
import StatusBadge from "@/components/courses/StatusBadge";

export default function CourseHero({
  course,
  onPublish,
  onArchive,
  onBack,
}) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex gap-5">

          <div className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-2xl
            bg-primary/15
            text-primary
          ">
            <MdOutlineSchool className="text-4xl" />
          </div>

          <div>

            <button
              onClick={onBack}
              className="
                mb-4
                flex
                items-center
                gap-2
                text-sm
                text-muted-foreground
                transition
                hover:text-foreground
              "
            >
              <FaArrowLeft />
              Back to Courses
            </button>

            <h1 className="text-4xl font-bold text-foreground">
              {course.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-foreground">
                <FaLayerGroup className="text-primary" />
                {course.category || "General"}
              </div>

              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-foreground">
                <FaSignal className="text-primary" />
                {course.level || "Beginner"}
              </div>

              <StatusBadge
                status={course.status}
              />

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-wrap gap-3">

          {course.status !== "PUBLISHED" && (
            <Button
              variant="success"
              onClick={onPublish}
            >
              Publish Course
            </Button>
          )}

          {course.status !== "ARCHIVED" && (
            <Button
              variant="secondary"
              onClick={onArchive}
            >
              Archive
            </Button>
          )}

        </div>

      </div>

    </div>
  );
}