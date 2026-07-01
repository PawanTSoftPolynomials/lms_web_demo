"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import CourseStats from "@/components/admin/courses/CourseStats";
import CourseToolbar from "@/components/admin/courses/CourseToolbar";
import CourseTable from "@/components/admin/courses/CourseTable";

import {
    useCourses, useDeleteCourse,
} from "@/hooks/queries/admin/useCourses";
import Button from "@/components/ui/Button";

export default function AdminCoursesPage() {
    const router = useRouter();

    const {
        data: courses = [], isLoading, isError, refetch,
    } = useCourses();

    const deleteCourseMutation = useDeleteCourse();

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("");

    const [level, setLevel] = useState("");

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesSearch = course.title
                .toLowerCase()
                .includes(search.toLowerCase()) || course.category
                .toLowerCase()
                .includes(search.toLowerCase()) || course.creator?.name
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus = !status || course.status === status;

            const matchesLevel = !level || course.level === level;

            return (matchesSearch && matchesStatus && matchesLevel);
        });
    }, [courses, search, status, level,]);

    const handleDelete = async (course) => {
        const confirmed = window.confirm(`Delete "${course.title}"?`);

        if (!confirmed) return;

        try {
            await deleteCourseMutation.mutateAsync(course.id);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (<div className="flex justify-center py-24">
                <Loader/>
            </div>);
    }

    if (isError) {
        return (<div className="py-24 text-center text-red-500">
                Failed to load courses.
            </div>);
    }

    return (<div className="space-y-8">
            <PageHeader
                title="Courses"
                subtitle="Manage all courses."
            >
                <Button
                    onClick={() => router.push("/admin/courses/create")}
                >
                    Create Course
                </Button>
            </PageHeader>

            <CourseStats
                courses={courses}
            />

            <Card>
                <CourseToolbar
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    level={level}
                    onLevelChange={setLevel}
                    onRefresh={refetch}
                />

                <CourseTable
                    courses={filteredCourses}
                    onView={(course) => router.push(`/admin/courses/${course.id}`)}
                    onEdit={(course) => router.push(`/admin/courses/edit/${course.id}`)}
                    onDelete={handleDelete}
                />
            </Card>
        </div>);
}