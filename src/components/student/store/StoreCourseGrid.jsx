import StoreCourseCard from "./StoreCourseCard";

export default function StoreCourseGrid({ courses = [] }) {
  if (!courses.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
        <h3 className="text-lg font-semibold text-white">No courses found</h3>
        <p className="mt-2 text-slate-400">
          You're already enrolled in every published course, or no courses match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <StoreCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
