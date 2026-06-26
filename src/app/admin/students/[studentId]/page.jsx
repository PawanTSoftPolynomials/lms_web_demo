"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSchool,
  FaUserShield,
  FaCertificate,
  FaBookOpen,
} from "react-icons/fa";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/common/Loader";

import { getStudentById } from "@/services/student.service";

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      const response = await getStudentById(studentId);

      console.log("API Response:", response);

      setStudent(response.data);
    } catch (error) {
      console.error("Student Error:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log("Student State:", student);
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  if (!student) {
    return <div className="py-24 text-center">Student not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => router.back()}>
        <FaArrowLeft className="mr-2" />
        Back
      </Button>

      {/* Hero */}

      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div
              className="
                flex
                h-24
                w-24
                items-center
                justify-center
                rounded-full
                bg-orange-500/10
                text-4xl
                font-bold
                text-orange-400
              "
            >
              {student.user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-4xl font-bold">{student.user.name}</h1>

              <p className="mt-2 text-slate-400">Student Profile</p>

              <div className="mt-4 flex gap-3">
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  {student.user.status}
                </span>

                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-400">
                  {student.user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-4">
            <FaBookOpen className="text-3xl text-orange-400" />

            <div>
              <p className="text-slate-400">Courses</p>

              <h2 className="text-3xl font-bold">
                {student.enrollments.length}
              </h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <FaCertificate className="text-3xl text-green-400" />

            <div>
              <p className="text-slate-400">Certificates</p>

              <h2 className="text-3xl font-bold">
                {student.certificates.length}
              </h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <FaUserGraduate className="text-3xl text-blue-400" />

            <div>
              <p className="text-slate-400">Verified</p>

              <h2 className="text-3xl font-bold">
                {student.user.isVerified ? "Yes" : "No"}
              </h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile */}

      <Card>
        <h2 className="mb-6 text-2xl font-bold">Student Information</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Info
            icon={<FaEnvelope />}
            title="Email"
            value={student.user.email}
          />

          <Info icon={<FaPhone />} title="Phone" value={student.phone} />

          <Info
            icon={<FaMapMarkerAlt />}
            title="Address"
            value={student.user.address}
          />

          <Info
            icon={<FaSchool />}
            title="Education"
            value={student.education || "Not Provided"}
          />

          <Info
            icon={<FaUserShield />}
            title="Guardian"
            value={student.guardianName || "Not Provided"}
          />
        </div>
      </Card>

      {/* Enrollments */}

      <Card>
        <h2 className="mb-6 text-2xl font-bold">Enrolled Courses</h2>

        {student.enrollments.length === 0 ? (
          <p className="text-slate-400">No enrolled courses.</p>
        ) : (
          student.enrollments.map((course) => (
            <div key={course.id}>
              <div
                className="
    flex
    items-center
    justify-between
    rounded-xl
    border
    border-slate-800
    bg-slate-900
    p-4
  "
              >
                <div>
                  <h3 className="font-semibold">{course.course.title}</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {course.course.category} • {course.course.level}
                  </p>
                </div>

                <span
                  className="
      rounded-full
      bg-green-500/10
      px-3
      py-1
      text-sm
      text-green-400
    "
                >
                  {course.course.status}
                </span>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Certificates */}

      <Card>
        <h2 className="mb-6 text-2xl font-bold">Certificates</h2>

        {student.certificates.length === 0 ? (
          <p className="text-slate-400">No certificates.</p>
        ) : (
          student.certificates.map((certificate) => (
            <div key={certificate.id}>
              <div
                className="
    flex
    items-center
    justify-between
    rounded-xl
    border
    border-slate-800
    bg-slate-900
    p-4
  "
              >
                <div>
                  <h3 className="font-semibold">{certificate.course.title}</h3>

                  <p className="text-sm text-slate-400">Certificate Issued</p>
                </div>

                <span className="text-green-400">✓</span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function Info({ icon, title, value }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 text-orange-400">{icon}</div>

      <div>
        <p className="text-sm text-slate-400">{title}</p>

        <p className="mt-1 font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}
