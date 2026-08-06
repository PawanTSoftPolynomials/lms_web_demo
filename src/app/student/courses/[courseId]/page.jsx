"use client";

import {use} from "react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import CourseHeader from "@/components/student/course-details/CourseHeader";
import CourseOverview from "@/components/student/course-details/CourseOverview";
import ModuleAccordion from "@/components/student/course-details/ModuleAccordion";
import CourseSectionTabs from "@/components/student/course-details/CourseSectionTabs";
import CourseQuizzesSection from "@/components/student/course-details/CourseQuizzesSection";
import CourseAnnouncementsSection from "@/components/student/course-details/CourseAnnouncementsSection";

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
        <div className="space-y-4">
            <CourseSectionTabs/>

            <div id="course-overview" className="space-y-4 scroll-mt-[112px]">
                <CourseHeader course={course}/>

                <CourseOverview course={course}/>
            </div>

            <div id="course-modules" className="scroll-mt-[112px]">
                <ModuleAccordion
                    modules={course.modules}
                />
            </div>

            {/* New Quizzes/Announcements sections are part of the mobile/tablet
                tab set (see CourseSectionTabs); desktop keeps its existing
                Overview + Modules layout unchanged. */}
            <div id="course-quizzes" className="scroll-mt-[112px] lg:hidden">
                <CourseQuizzesSection courseId={courseId}/>
            </div>

            <div id="course-announcements" className="scroll-mt-[112px] lg:hidden">
                <CourseAnnouncementsSection/>
            </div>
        </div>
    );
}