import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import ProgressBar from "./ProgressBar";

export default function CourseCard({
                                       course,
                                       enrollment,
                                   }) {
    const isEnrolled = Boolean(enrollment);

    const courseData = isEnrolled
        ? enrollment.course
        : course;

    if (!courseData) return null;

    const {
        id,
        title,
        description,
        thumbnailUrl,
        category,
        level,
        lessons,
        instructor,
        creator,
    } = courseData;

    const instructorName =
        instructor ?? creator?.name ?? "Unknown";

    const progress =
        enrollment?.progress ?? 0;

    const completedLessons =
        enrollment?.completedLessons ?? 0;

    return (
        <Card
            className="overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40">
            <div className="relative h-48 w-full">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover"
                />
            </div>

            <div className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-xl font-semibold text-white">
                        {title}
                    </h3>

                    {level && (
                        <span
                            className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
              {level}
            </span>
                    )}
                </div>

                <p className="line-clamp-3 text-sm text-slate-400">
                    {description}
                </p>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
            <span className="text-slate-400">
              Instructor
            </span>

                        <span className="font-medium text-white">
              {instructorName}
            </span>
                    </div>

                    {category && (
                        <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Category
              </span>

                            <span className="font-medium text-white">
                {category}
              </span>
                        </div>
                    )}

                    {isEnrolled &&
                        lessons !== undefined && (
                            <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Lessons
                </span>

                                <span className="font-medium text-white">
                  {completedLessons} / {lessons}
                </span>
                            </div>
                        )}
                </div>

                {isEnrolled && (
                    <ProgressBar value={progress}/>
                )}

                <Link
                    href={
                        isEnrolled
                            ? `/student/learn/${id}`
                            : `/student/courses/${id}`
                    }
                >
                    <Button className="w-full">
                        {isEnrolled
                            ? "Continue Learning"
                            : "View Course"}
                    </Button>
                </Link>
            </div>
        </Card>
    );
}