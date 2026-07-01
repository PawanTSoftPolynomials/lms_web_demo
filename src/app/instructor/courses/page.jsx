"use client";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import CourseCard from "@/components/home/CourseCard";
import Link from "next/link";
import {useInstructorCourses} from "@/hooks/queries/instructor/useInstructorCourses";

export default function InstructorCoursesPage() {
    const {
        data: courses = [], isLoading, isError,
    } = useInstructorCourses();

    if (isLoading) {
        return (<div className="flex justify-center py-20">
                <Loader/>
            </div>);
    }

    if (isError) {
        return (<Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Failed to Load Courses
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Please try again later.
                    </p>
                </div>
            </Card>);
    }

    if (!courses.length) {
        return (<Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        No Courses Found
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Create your first course.
                    </p>
                </div>
            </Card>);
    }

    return (<div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white">
                        My Courses
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Manage your courses and content.
                    </p>
                </div>

                <Link
                    href="/instructor/courses/create"
                    className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-orange-500
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-orange-600
        "
                >
                    Create Course
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (<CourseCard
                        key={course.id}
                        course={course}
                        action={{
                            label: "Manage Course", href: `/instructor/courses/${course.id}`,
                        }}
                    />))}
            </div>
        </div>);
}