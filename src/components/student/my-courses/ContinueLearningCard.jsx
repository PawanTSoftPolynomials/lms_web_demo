import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ContinueLearningCard({
                                                 enrollment,
                                             }) {
    if (!enrollment) return null;

    const { course, enrolledAt } = enrollment;

    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                        <BookOpen className="h-6 w-6" />
                    </div>

                    <div>
                        <p className="text-sm uppercase tracking-wide text-orange-400">
                            Continue Learning
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            {course.title}
                        </h2>

                        <p className="mt-2 max-w-2xl text-slate-400">
                            {course.description}
                        </p>
                    </div>

                    <p className="text-sm text-slate-500">
                        Enrolled on{" "}
                        {new Date(enrolledAt).toLocaleDateString()}
                    </p>
                </div>

                <Link
                    href={`/student/learn/${course.id}`}
                >
                    <Button className="flex items-center gap-2">
                        Continue Learning
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}