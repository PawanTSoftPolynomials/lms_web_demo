import Link from "next/link";

export default function CourseCard({
  course,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-orange-500 transition">
      <div className="h-48 bg-slate-800">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Image
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="text-xs text-orange-400">
          {course.category}
        </span>

        <h3 className="text-lg font-semibold mt-2">
          {course.title}
        </h3>

        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
          {course.description}
        </p>

        <div className="flex justify-between mt-4 text-sm text-slate-400">
          <span>{course.level}</span>

         <span>
  {course.modules?.length || 0} Modules
</span>
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
  <span>
    {course.quizzes?.length || 0} Quizzes
  </span>

  <span>
    {course.level}
  </span>
</div>

        <Link
          href={`/courses/${course.id}`}
          className="mt-4 block text-center bg-orange-500 hover:bg-orange-600 py-2 rounded-lg font-medium"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}