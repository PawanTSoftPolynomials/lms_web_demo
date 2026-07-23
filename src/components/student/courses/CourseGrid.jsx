import CourseCard from "./CourseCard";

export default function CourseGrid({
                                       courses = [],
                                       enrollments = [],
                                   }) {
    const isShowingEnrollmentsOnly = courses.length === 0 && enrollments.length > 0;
    const items = isShowingEnrollmentsOnly ? enrollments : courses;

    if (!items.length) {
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
            {items.map((item) => {
                const courseObj = isShowingEnrollmentsOnly ? undefined : item;
                const enrollmentObj = isShowingEnrollmentsOnly
                    ? item
                    : enrollments.find((e) => e.courseId === item.id || e.course?.id === item.id);

                return (
                    <CourseCard
                        key={item.id}
                        course={courseObj}
                        enrollment={enrollmentObj}
                    />
                );
            })}
        </div>
    );
}