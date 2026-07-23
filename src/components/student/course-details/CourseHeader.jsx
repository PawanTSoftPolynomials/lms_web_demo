"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import useEnrollCourse from "@/hooks/queries/student/useEnrollCourse";

export default function CourseHeader({
                                         course,
                                     }) {
    const router = useRouter();
    const { data: myEnrollments = [] } = useMyCourses();
    const enrollMutation = useEnrollCourse();

    if (!course) return null;

    const isEnrolled = Array.isArray(myEnrollments) && myEnrollments.some(
        (e) => e.courseId === course.id || e.course?.id === course.id
    );

    const handleEnroll = async () => {
        try {
            await enrollMutation.mutateAsync(course.id);
            router.push(`/student/learn/${course.id}`);
        } catch (err) {
            console.error("Enrollment failed:", err);
        }
    };

    const totalModules =
        course.modules?.length || 0;

    const totalLessons =
        course.modules?.reduce(
            (total, module) =>
                total + (module.lessons?.length || 0),
            0
        ) || 0;

    const totalQuizzes =
        course.quizzes?.length || 0;

    return (
        <Card className="overflow-hidden p-0">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="relative h-72 lg:h-full">
                    <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>

                <div className="space-y-6 p-6 lg:col-span-2">
                    <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
              {course.level}
            </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              {course.category}
            </span>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                course.status === "PUBLISHED"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-yellow-500/10 text-yellow-400"
                            }`}
                        >
              {course.status}
            </span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {course.title}
                        </h1>

                        <p className="mt-4 text-slate-400 leading-7">
                            {course.description}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem
                            label="Instructor"
                            value={course.creator?.name}
                        />

                        <InfoItem
                            label="Experience"
                            value={`${course.creator?.teacherProfile?.experience ?? 0} Years`}
                        />

                        <InfoItem
                            label="Modules"
                            value={totalModules}
                        />

                        <InfoItem
                            label="Lessons"
                            value={totalLessons}
                        />

                        <InfoItem
                            label="Quizzes"
                            value={totalQuizzes}
                        />

                        <InfoItem
                            label="Level"
                            value={course.level}
                        />
                    </div>

                    <div className="pt-2">
                        {isEnrolled ? (
                            <Button
                                onClick={() => router.push(`/student/learn/${course.id}`)}
                                className="w-full sm:w-auto px-6 py-3 font-semibold text-base text-white"
                            >
                                Continue Learning
                            </Button>
                        ) : (
                            <Button
                                onClick={handleEnroll}
                                loading={enrollMutation.isPending}
                                disabled={enrollMutation.isPending}
                                className="w-full sm:w-auto px-6 py-3 font-semibold text-base text-white"
                            >
                                Enroll Now
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function InfoItem({
                      label,
                      value,
                  }) {
    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-lg font-semibold text-white">
                {value}
            </p>
        </div>
    );
}