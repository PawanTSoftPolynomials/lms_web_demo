"use client";

import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";
import StudentDetails from "@/components/admin/students/StudentDetails";

import {useStudent} from "@/hooks/queries/admin/useStudents";

export default function StudentDetailsPage() {
    const router = useRouter();
    const {studentId} = useParams();

    const {
        data: student,
        isLoading,
        isError,
    } = useStudent(studentId);

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader/>
            </div>
        );
    }

    if (isError || !student) {
        return (
            <div className="py-24 text-center text-red-500">
                Failed to load student details.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Student Details"
                subtitle="View student information."
            />

            <StudentDetails student={student}/>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-slate-700 hover:bg-slate-600"
                >
                    Back
                </Button>

                {/* Enable when edit page is available */}
                {/*
        <Button
          onClick={() =>
            router.push(
              `/admin/students/edit/${students.id}`
            )
          }
        >
          Edit Student
        </Button>
        */}
            </div>
        </div>
    );
}