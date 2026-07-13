"use client";

export default function CourseModal({
  course,
  onClose,
  onEnroll,
}) {
  if (!course) return null;

  return (
    <div className="
      fixed inset-0
      bg-black/70
      flex items-center
      justify-center
      z-50
    ">
      <div className="
        bg-slate-900
        rounded-2xl
        p-8
        w-full
        max-w-2xl
        relative
      ">
        <button
          onClick={onClose}
          className="absolute top-5 right-5"
        >
          ✕
        </button>

        <h1 className="text-4xl font-bold mb-4">
          {course.title}
        </h1>

        <p className="text-slate-400 mb-6">
          {course.description}
        </p>

        <div className="space-y-2 mb-8">
          <p>
            Category: {course.category}
          </p>

          <p>
            Level: {course.level}
          </p>
        </div>

        <button
          onClick={() =>
            onEnroll(course.id)
          }
          className="
            bg-orange-600
            px-6
            py-3
            rounded-lg
          "
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}