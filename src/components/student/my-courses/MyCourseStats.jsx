import { BookOpen, Sparkles, Clock } from "lucide-react";

export default function MyCourseStats({ enrollments = [] }) {
    const totalCourses = enrollments.length;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const recentlyEnrolled = enrollments.filter((enrollment) => {
        if (!enrollment.enrolledAt) return false;
        const enrolledDate = new Date(enrollment.enrolledAt);
        return (
            enrolledDate.getMonth() === thisMonth &&
            enrolledDate.getFullYear() === thisYear
        );
    }).length;

    const activeCourses = enrollments.filter(e => e.progress < 100).length;

    const stats = [
        {
            title: "Total Enrolled",
            value: totalCourses,
            icon: BookOpen,
            color: "text-orange-400",
            bg: "bg-orange-500/10 border-orange-500/20"
        },
        {
            title: "Recently Enrolled",
            value: recentlyEnrolled,
            icon: Sparkles,
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20"
        },
        {
            title: "Active Learning",
            value: activeCourses,
            icon: Clock,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20"
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.title}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex items-center justify-between"
                    >
                        <div>
                            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                                {stat.title}
                            </p>
                            <h2 className="mt-1 text-2xl font-black text-white leading-none">
                                {stat.value}
                            </h2>
                        </div>
                        <div className={`rounded-xl ${stat.bg} p-2.5 ${stat.color} border shadow-sm`}>
                            <Icon size={16} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}