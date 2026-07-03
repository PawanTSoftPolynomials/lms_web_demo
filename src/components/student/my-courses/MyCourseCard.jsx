"use client";

import Link from "next/link";
import {
    Calendar,
    BookOpen,
    ArrowRight,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function MyCourseCard({
                                         enrollment,
                                     }) {
    const {
        course,
        enrolledAt,
        progress = 0,
        completedLessons = 0,
    } = enrollment;

    return (
        <Card className="transition-all duration-300 hover:border-orange-500/40 hover:-translate-y-1">
            <div className="flex flex-col gap-6">
                {/* Course Title */}
                <div>
                    <h3 className="text-xl font-semibold text-white">
                        {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                        {course.description}
                    </p>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span>
              {new Date(
                  enrolledAt
              ).toLocaleDateString()}
            </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-orange-500" />
                        <span>
              {completedLessons} Lessons Completed
            </span>
                    </div>
                </div>

                {/* Progress */}
                <div>
                    <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">
              Progress
            </span>

                        <span className="font-medium text-orange-400">
              {progress}%
            </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-orange-500 transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Action */}
                <Link
                    href={`/student/learn/${course.id}`}
                >
                    <Button className="flex w-full items-center justify-center gap-2">
                        Continue Learning
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}