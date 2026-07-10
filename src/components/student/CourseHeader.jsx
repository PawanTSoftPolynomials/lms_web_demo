export default function CourseHeader({
  course,
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl">
      <h1 className="text-4xl font-bold">
        {course.title}
      </h1>

      <p className="text-slate-400 mt-3">
        {course.description}
      </p>
    </div>
  );
}