"use client";

import {use} from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import CourseHeader from "@/components/student/course-details/CourseHeader";
import CourseOverview from "@/components/student/course-details/CourseOverview";
import ModuleAccordion from "@/components/student/course-details/ModuleAccordion";

import useCourse from "@/hooks/queries/student/useCourse";

export default function CourseDetailsPage({
                                              params,
                                          }) {
    const {courseId} = use(params);

    const {
        data: course,
        isLoading,
        isError,
    } = useCourse(courseId);

    if (isLoading) {
        return <Loader/>;
    }

    if (isError || !course) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                    Course not found
                </h2>

                <p className="mt-2 text-slate-400">
                    The requested course could not be loaded.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Course Details"
                subtitle="Explore the course curriculum before you start learning."
            />

            <CourseHeader course={course}/>

            <CourseOverview course={course}/>

            <ModuleAccordion
                modules={course.modules}
            />
        </div>
    );
}