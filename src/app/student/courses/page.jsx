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
            <Card className="p-8 text-center">
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
        <div className="space-y-8">
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

            <CourseGrid courses={filteredCourses} enrollments={myEnrollments}/>
        </div>
    );
}