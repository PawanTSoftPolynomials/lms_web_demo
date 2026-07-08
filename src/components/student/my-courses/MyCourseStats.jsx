import Card from "@/components/ui/Card";

export default function MyCourseStats({
                                          enrollments = [],
                                      }) {
    const totalCourses = enrollments.length;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const recentlyEnrolled = enrollments.filter(
        (enrollment) => {
            if (!enrollment.enrolledAt) return false;

            const enrolledDate = new Date(
                enrollment.enrolledAt
            );

            return (
                enrolledDate.getMonth() === thisMonth &&
                enrolledDate.getFullYear() === thisYear
            );
        }
    ).length;

    const stats = [
        {
            title: "Total Courses",
            value: totalCourses,
        },
        {
            title: "Recently Enrolled",
            value: recentlyEnrolled,
        },
        {
            title: "Active Courses",
            value: totalCourses,
        },
    ];

    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
                <Card
                    key={stat.title}
                    className="p-6"
                >
                    <p className="text-sm text-slate-400">
                        {stat.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-orange-500">
                        {stat.value}
                    </h2>
                </Card>
            ))}
        </div>
    );
}