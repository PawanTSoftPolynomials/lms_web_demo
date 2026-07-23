"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, ArrowLeft, CheckCircle2, User, BookOpen, Calendar, Edit3, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateCertificate } from "@/services/certificate.service";
import { useInstructorCertificates } from "@/hooks/queries/instructor/useCertificates";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function UpdateCertificatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedCertId, setSelectedCertId] = useState("");
  
  // Form state
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all certificates issued by instructor
  const { data: certificatesData = [], isLoading: loadingCerts } = useInstructorCertificates(user?.id);
  
  const certificates = certificatesData;

  // Fetch Instructor's Courses
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["instructorCoursesList"],
    queryFn: async () => {
      const { data } = await api.get("/courses");
      return data.data ?? data;
    },
  });
  const myCourses = courses.filter((c) => c.creatorId === user?.id && c.status === "PUBLISHED");

  // Fetch Students for selected course
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["courseStudents", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data } = await api.get(`/courses/${courseId}/students`);
      return data;
    },
    enabled: !!courseId,
  });

  // Pre-fill form when certificate is selected
  useEffect(() => {
    if (selectedCertId) {
      const cert = certificates.find((c) => c.id === selectedCertId);
      if (cert) {
        setCourseId(cert.course?.id || "");
        setStudentId(cert.student?.id || cert.user?.id || "");
        if (cert.issuedAt || cert.createdAt) {
          setIssuedAt(new Date(cert.issuedAt || cert.createdAt).toISOString().split("T")[0]);
        }
      }
    } else {
      setCourseId("");
      setStudentId("");
      setIssuedAt("");
    }
  }, [selectedCertId, certificates]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await updateCertificate(selectedCertId, data);
    },
    onSuccess: () => {
      setSuccessMsg("Certificate updated successfully!");
      setErrorMsg("");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CERTIFICATES] });
      setTimeout(() => router.push("/instructor/dashboard"), 2000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || "Failed to update certificate. The API might not be fully configured yet.");
      setSuccessMsg("");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCertId || !courseId || !studentId || !issuedAt) {
      setErrorMsg("Please fill all required fields.");
      return;
    }
    updateMutation.mutate({
      courseId,
      userId: studentId,
      issuedAt: new Date(issuedAt).toISOString(),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/instructor/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Edit3 className="text-blue-500" size={32} />
          Update Certificate
        </h1>
        <p className="text-slate-400 mt-2">Modify the details of an existing credential.</p>
      </div>

      <Card className="p-6 md:p-8 border-[#1A1F35] bg-[#0D1021]">
        {successMsg ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Success!</h2>
              <p className="text-slate-400 mt-1">{successMsg}</p>
            </div>
            <p className="text-sm text-slate-500 mt-4">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Certificate Selection */}
            <div className="space-y-2 pb-6 border-b border-[#1A1F35]">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Search size={16} className="text-blue-400" /> Select Certificate to Edit
              </label>
              {loadingCerts ? (
                <div className="h-12 flex items-center px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm">
                  Loading certificates...
                </div>
              ) : (
                <select
                  value={selectedCertId}
                  onChange={(e) => setSelectedCertId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                  required
                >
                  <option value="">-- Choose a certificate --</option>
                  {certificates.map((c) => {
                    const sName = c.student?.name || c.user?.name || "Student";
                    const cTitle = c.course?.title || "Course";
                    const certNo = c.certificateNo || c.id?.substring(0,8);
                    return (
                      <option key={c.id} value={c.id}>
                        {sName} - {cTitle} ({certNo})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {selectedCertId && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* Course Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-400" /> Update Course
                  </label>
                  {loadingCourses ? (
                    <div className="h-12 flex items-center px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm">
                      Loading courses...
                    </div>
                  ) : (
                    <select
                      value={courseId}
                      onChange={(e) => {
                        setCourseId(e.target.value);
                        setStudentId(""); // reset student when course changes
                      }}
                      className="w-full h-12 px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      required
                    >
                      <option value="">-- Choose a course --</option>
                      {myCourses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Student Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <User size={16} className="text-blue-400" /> Update Student
                  </label>
                  {!courseId ? (
                    <div className="h-12 flex items-center px-4 rounded-xl bg-slate-900/50 border border-slate-800/50 text-slate-600 text-sm italic">
                      Select a course first to load students.
                    </div>
                  ) : loadingStudents ? (
                    <div className="h-12 flex items-center px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm">
                      Loading students...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="h-12 flex items-center px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm">
                      No students found in this course.
                      {studentId && <span className="ml-2 text-blue-400">(Selected student ID: {studentId})</span>}
                    </div>
                  ) : (
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      required
                    >
                      <option value="">-- Choose a student --</option>
                      {students.map((s) => (
                        <option key={s.id || s.user?.id} value={s.id || s.user?.id}>
                          {s.name || s.user?.name || s.email || s.user?.email}
                        </option>
                      ))}
                      {/* Fallback option if pre-filled student is not in the loaded array yet */}
                      {studentId && !students.some(s => (s.id || s.user?.id) === studentId) && (
                        <option value={studentId}>Current Student (ID: {studentId})</option>
                      )}
                    </select>
                  )}
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" /> Update Issue Date
                  </label>
                  <Input
                    type="date"
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                    required
                    className="w-full focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div className="pt-4 border-t border-[#1A1F35]">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending || !courseId || !studentId}
                    className="w-full h-12 text-base font-bold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {updateMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Edit3 size={18} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </Card>
    </div>
  );
}
