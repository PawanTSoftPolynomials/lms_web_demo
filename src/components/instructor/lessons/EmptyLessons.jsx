"use client";

import Link from "next/link";

import {FaBookOpen} from "react-icons/fa";

export default function EmptyLessons({
                                         moduleId,
                                     }) {
    return (
        <div
            className="
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-700
        bg-slate-900
        py-20
        px-8
        text-center
      "
        >
            <div
                className="
          mb-6
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          bg-orange-500/10
          text-orange-400
        "
            >
                <FaBookOpen size={34}/>
            </div>

            <h2 className="text-3xl font-bold text-white">
                No Lessons Found
            </h2>

            <p className="mt-3 max-w-md text-slate-400">
                This module does not have any lessons yet.
                Create your first lesson to start adding
                learning content.
            </p>

            {moduleId && (
                <Link
                    href={`/instructor/lessons/create/${moduleId}`}
                    className="
            mt-8
            inline-flex
            items-center
            rounded-xl
            bg-orange-600
            px-6
            py-3
            font-medium
            text-white
            transition
            hover:bg-orange-700
          "
                >
                    Create First Lesson
                </Link>
            )}
        </div>
    );
}