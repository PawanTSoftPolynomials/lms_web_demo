"use client";

import {useMemo, useState} from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import MyCourseStats from "@/components/student/my-courses/MyCourseStats";
import MyCourseToolbar from "@/components/student/my-courses/MyCourseToolbar";
import ContinueLearningCard from "@/components/student/my-courses/ContinueLearningCard";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import MyCourseCard from "@/components/student/my-courses/MyCourseCard";

export default function MyCoursesPage() {
    const {
        data: enrollments = [],
        isLoading,
        isError,
    } = useMyCourses();

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] =
        useState("latest");

    const filteredEnrollments = useMemo(() => {
        const filtered = enrollments.filter(
            (enrollment) =>
                enrollment.course?.title
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
        );

        switch (sortBy) {
            case "oldest":
                filtered.sort(
                    (a, b) =>
                        new Date(a.enrolledAt) -
                        new Date(b.enrolledAt)
                );
                break;

            case "name-asc":
                filtered.sort((a, b) =>
                    a.course.title.localeCompare(
                        b.course.title
                    )
                );
                break;

            case "name-desc":
                filtered.sort((a, b) =>
                    b.course.title.localeCompare(
                        a.course.title
                    )
                );
                break;

            case "latest":
            default:
                filtered.sort(
                    (a, b) =>
                        new Date(b.enrolledAt) -
                        new Date(a.enrolledAt)
                );
        }

        return filtered;
    }, [enrollments, search, sortBy]);

    if (isLoading) {
        return <Loader/>;
    }

    if (isError) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                    Unable to load your courses
                </h2>

                <p className="mt-2 text-slate-400">
                    Please try again later.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="My Courses"
                subtitle="Manage and continue your enrolled courses."
            />

            <MyCourseStats
                enrollments={enrollments}
            />

            <MyCourseToolbar
                search={search}
                setSearch={setSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {filteredEnrollments.length > 0 && (
                <ContinueLearningCard
                    enrollment={filteredEnrollments[0]}
                />
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEnrollments.map((enrollment) => (
                    <MyCourseCard
                        key={enrollment.id}
                        enrollment={enrollment}
                    />
                ))}
            </div>
        </div>
    );
}