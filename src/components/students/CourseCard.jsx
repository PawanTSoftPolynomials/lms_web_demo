import Link from "next/link";
import ProgressBar from "./ProgressBar";

export default function CourseCard({ course }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">
          {course.title}
        </h2>

        <p className="text-gray-400">
          Instructor: {course.instructor}
        </p>

        <p className="text-sm text-orange-400">
          Category: {course.category}
        </p>

        <ProgressBar value={course.progress} />

        <p className="text-sm text-gray-300">
          {course.completedLessons}/{course.lessons} lessons completed
        </p>

        <Link
          href={`/student/learn/${course.id}`}
          className="inline-block mt-3 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg"
        >
          Continue Learning
        </Link>
      </div>
    </div>
  );
}