"use client";

import Link from "next/link";

import {FaBook} from "react-icons/fa";

export default function CourseHeader({course}) {
    return (<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-5">
                    <div className="h-28 w-44 overflow-hidden rounded-xl bg-slate-800">
                        {course.thumbnailUrl ? (<img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="h-full w-full object-cover"
                            />) : (<div className="flex h-full items-center justify-center">
                                <FaBook className="text-4xl text-slate-500"/>
                            </div>)}
                    </div>

                    <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-400">
                {course.category}
              </span>

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {course.level}
              </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${course.status === "PUBLISHED" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}
                            >
                {course.status}
              </span>
                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            {course.title}
                        </h1>

                        <p className="mt-3 max-w-4xl text-slate-400">
                            {course.description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/instructor/courses/edit/${course.id}`}
                        className="
              rounded-lg
              border
              border-orange-500
              px-5
              py-3
              font-medium
              text-white
              transition
              hover:bg-orange-500
            "
                    >
                        Edit Course
                    </Link>

                    <Link
                        href={`/instructor/modules/create/${course.id}`}
                        className="
              rounded-lg
              bg-orange-500
              px-5
              py-3
              font-medium
              text-white
              transition
              hover:bg-orange-600
            "
                    >
                        Add Module
                    </Link>
                </div>
            </div>
        </div>);
}