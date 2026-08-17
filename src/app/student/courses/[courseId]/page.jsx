"use client";

import {use} from "react";

import { BookOpen } from "lucide-react";

import Loader from "@/components/common/Loader";
import EmptyState from "@/components/ui/EmptyState";

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
            <EmptyState
                icon={BookOpen}
                title="Course not found"
                description="The requested course could not be loaded."
            />
        );
    }

    return (
        <div className="space-y-4">
            <CourseSectionTabs/>

            <div id="course-overview" className="space-y-4 scroll-mt-[121px]">
                <CourseHeader course={course}/>

                <CourseOverview course={course}/>
            </div>

            <div id="course-modules" className="scroll-mt-[121px]">
                <ModuleAccordion
                    modules={course.modules}
                />
            </div>

            {/* New Quizzes/Announcements sections are part of the mobile/tablet
                tab set (see CourseSectionTabs); desktop keeps its existing
                Overview + Modules layout unchanged. */}
            <div id="course-quizzes" className="scroll-mt-[121px] lg:hidden">
                <CourseQuizzesSection courseId={courseId}/>
            </div>

            <div id="course-announcements" className="scroll-mt-[121px] lg:hidden">
                <CourseAnnouncementsSection/>
            </div>
        </div>
    );
}