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
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8">

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
            bg-orange-500/15
            text-orange-500
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
                text-slate-400
                transition
                hover:text-white
              "
            >
              <FaArrowLeft />
              Back to Courses
            </button>

            <h1 className="text-4xl font-bold text-white">
              {course.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                <FaLayerGroup className="text-orange-500" />
                {course.category || "General"}
              </div>

              <div className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                <FaSignal className="text-orange-500" />
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