import CourseCard from "./CourseCard";

export default function CourseGrid({
                                       courses = [],
                                   }) {
    if (!courses.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
                <h3 className="text-lg font-semibold text-white">
                    No courses found
                </h3>

                <p className="mt-2 text-slate-400">
                    Try adjusting your filters or check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                />
            ))}
        </div>
    );
}