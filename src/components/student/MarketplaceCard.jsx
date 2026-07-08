"use client";

export default function MarketplaceCard({
  course,
  onEnroll,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-xl font-bold text-white">
        {course.title}
      </h2>

      <p className="text-gray-400 mt-2">
        Instructor: {course.instructor || "N/A"}
      </p>

      <p className="text-orange-400 mt-1">
        {course.category || "General"}
      </p>

      <p className="text-gray-500 mt-2 text-sm">
        Level: {course.level}
      </p>

      <div className="flex justify-end items-center mt-4">
        <button
          onClick={() => onEnroll(course.id)}
          disabled={course.enrolled}
          className={`px-4 py-2 rounded-lg ${
            course.enrolled
              ? "bg-green-600 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {course.enrolled ? "Enrolled" : "Enroll"}
        </button>
      </div>
    </div>
  );
}