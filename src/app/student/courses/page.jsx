"use client";

import {useState} from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import CourseFilters from "@/components/student/courses/CourseFilters";
import CourseGrid from "@/components/student/courses/CourseGrid";
import CourseStats from "@/components/student/courses/CourseStats";
import CourseToolbar from "@/components/student/courses/CourseToolbar";

import useCourses from "@/hooks/queries/student/useCourses";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import useAvailableCourseFilters from "@/hooks/queries/student/useAvailableCourseFilters";

export default function StudentCoursesPage() {
    const {data: courses = [], isLoading, isError} = useCourses();
    const {data: myEnrollments = []} = useMyCourses();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [level, setLevel] = useState("");

    const {categories, levels, filteredCourses} = useAvailableCourseFilters({
        courses,
        myEnrollments,
        search,
        category,
        level,
    });

    const activeFilters = [
        search,
        category,
        level,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setSearch("");
        setCategory("");
        setLevel("");
    };

    if (isLoading) {
        return <Loader/>;
    }

    if (isError) {
        return (
            <Card tone="flat" className="p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Unable to load courses
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Please try again later.
                </p>
            </Card>
        );
    }

    return (
        <div className="-m-3 sm:-m-6 -mt-4 sm:-mt-6 md:-mt-16 -mx-4 sm:-mx-6 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-8 flex flex-col flex-1 min-h-0">
            <PageHeader
                title="Browse Courses"
                subtitle="Discover courses and start learning."
            />

            <CourseStats courses={courses}/>

            <CourseToolbar
                totalCourses={filteredCourses.length}
                activeFilters={activeFilters}
                onResetFilters={handleResetFilters}
            />

            <CourseFilters
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                level={level}
                onLevelChange={setLevel}
                categories={categories}
                levels={levels}
            />

            <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
                <CourseGrid courses={filteredCourses} enrollments={myEnrollments}/>
            </div>
        </div>
    );
}