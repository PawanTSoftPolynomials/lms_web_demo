import StoreCourseCard from "./StoreCourseCard";

export default function StoreCourseGrid({ courses = [] }) {
  if (!courses.length) {
    return (
      <div className="rounded-xl border border-dashed border-transparent p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">No courses found</h3>
        <p className="mt-2 text-muted-foreground">
          You're already enrolled in every published course, or no courses match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {courses.map((course) => (
        <StoreCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
