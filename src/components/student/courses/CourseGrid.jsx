import MyCourseCard from "@/components/student/my-courses/MyCourseCard";

export default function CourseGrid({
    courses = [],
    enrollments = [],
}) {
    const isShowingEnrollmentsOnly = courses.length === 0 && enrollments.length > 0;
    const items = isShowingEnrollmentsOnly ? enrollments : courses;

    if (!items.length) {
        return (
            <div className="rounded-xl border border-dashed border-transparent p-12 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                    No courses found
                </h3>

                <p className="mt-2 text-muted-foreground">
                    You have enrolled in all available courses or no courses match your filter criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
                const courseObj = isShowingEnrollmentsOnly ? undefined : item;
                const enrollmentObj = isShowingEnrollmentsOnly
                    ? item
                    : enrollments.find((e) => e.courseId === item.id || e.course?.id === item.id);

                return (
                    <MyCourseCard
                        key={item.id || idx}
                        course={courseObj}
                        enrollment={enrollmentObj}
                    />
                );
            })}
        </div>
    );
}