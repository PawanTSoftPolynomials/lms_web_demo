"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BarChart2,
  Users,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Calendar,
  Search,
  Plus,
  BookOpen,
  Mail,
  Video,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import StudentEngagement from "@/components/instructor/dashboard/StudentEngagement";
import ConceptMastery from "@/components/tables/ConceptMastery";

export default function InstructorReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [activeTab, setActiveTab] = useState(""); // "", "student", "attendance", "course", "batches"
  
  // Search query for student list
  const [studentSearch, setStudentSearch] = useState("");

  // Create Batch Form States
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [batchStartDate, setBatchStartDate] = useState("");
  const [batchStartTime, setBatchStartTime] = useState("");
  const [batchEndTime, setBatchEndTime] = useState("");
  const [batchMeetingLink, setBatchMeetingLink] = useState("");
  const [batchSuccess, setBatchSuccess] = useState("");

  // Fetch all instructor courses
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["instructorCoursesList"],
    queryFn: async () => {
      const { data } = await api.get("/courses");
      return data.data ?? data;
    },
  });

  // Filter courses: Owned by instructor and PUBLISHED
  const eligibleCourses = courses.filter(
    (c) => c.creatorId === user?.id && c.status === "PUBLISHED"
  );

  // Fetch dashboard details for the selected course
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ["instructorDashboard", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      const { data } = await api.get(`/instructor/dashboard?courseId=${selectedCourseId}`);
      return data.data ?? data;
    },
    enabled: !!selectedCourseId,
  });

  // Fetch enrolled students roster for selected course
  const { data: studentsRoster = [], isLoading: loadingRoster } = useQuery({
    queryKey: ["courseStudentsRoster", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const { data } = await api.get(`/courses/${selectedCourseId}/students`);
      return data;
    },
    enabled: !!selectedCourseId,
  });

  // Fetch batches for selected course
  const { data: batches = [], isLoading: loadingBatches, refetch: refetchBatches } = useQuery({
    queryKey: ["courseBatches", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const { data } = await api.get(`/courses/${selectedCourseId}/batches`);
      return data;
    },
    enabled: !!selectedCourseId,
  });

  // Batch Creation Mutation
  const createBatchMutation = useMutation({
    mutationFn: async (batchData) => {
      const { data } = await api.post(`/courses/${selectedCourseId}/batches`, batchData);
      return data;
    },
    onSuccess: () => {
      setBatchSuccess("New learning cohort batch created successfully!");
      setBatchName("");
      setBatchStartDate("");
      setBatchStartTime("");
      setBatchEndTime("");
      setBatchMeetingLink("");
      setIsCreatingBatch(false);
      refetchBatches();
      setTimeout(() => setBatchSuccess(""), 4000);
    },
  });

  const handleCreateBatchSubmit = (e) => {
    e.preventDefault();
    createBatchMutation.mutate({
      name: batchName,
      startDate: batchStartDate,
      startTime: batchStartTime,
      endTime: batchEndTime,
      meetingLink: batchMeetingLink,
    });
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveTab("");
  };

  if (loadingCourses) return <Loader />;

  const activeCourse = eligibleCourses.find((c) => c.id === selectedCourseId);

  // Filter student roster by search input
  const filteredStudents = studentsRoster.filter((student) =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in duration-300">
      {/* 1. Page Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (activeTab) {
                  setActiveTab("");
                } else if (selectedCourseId) {
                  setSelectedCourseId("");
                } else {
                  router.push("/instructor/dashboard");
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-orange-500 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                {activeTab ? `${activeCourse?.title} Reports` : "Course Reports"}
              </h1>
              <p className="text-xs text-slate-400 mt-1.5">
                {activeTab
                  ? `Viewing ${activeTab.toUpperCase()} details for ${activeCourse?.title}`
                  : "Select a course to view detailed student engagement and metrics"}
              </p>
            </div>
          </div>

          {selectedCourseId && (
            <button
              onClick={() => setSelectedCourseId("")}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-orange-500 transition"
            >
              Change Course
            </button>
          )}
        </div>
      </div>

      {/* 2. Course Selection Dropdown (Initial Step) */}
      {!selectedCourseId && (
        <Card className="p-8 border border-slate-800 bg-slate-900/60 shadow-lg text-center max-w-2xl mx-auto space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <BarChart2 size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Select Course to Generate Report</h2>
            <p className="text-xs text-slate-400 mt-2">
              Choose one of your assigned/published courses below to inspect reports and cohorts.
            </p>
          </div>

          {eligibleCourses.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              No published courses found. Make sure your course status is PUBLISHED by the administrator.
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500">
                Choose a Course
              </label>
              <select
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="">-- Click to select course --</option>
                {eligibleCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Card>
      )}

      {/* 3. Report Hub Cards List (Step 2) */}
      {selectedCourseId && !activeTab && (
        <div className="space-y-6">
          {/* Active Course Card Preview */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{activeCourse?.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{activeCourse?.category || "General category"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs text-slate-300 font-semibold">
                {studentsRoster.length} Enrolled Students
              </span>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Student Report Card */}
            <Card
              onClick={() => setActiveTab("student")}
              className="p-5 border border-slate-800 bg-slate-900/60 hover:border-purple-500/30 cursor-pointer hover:bg-slate-900 hover:translate-y-[-2px] transition duration-300 flex flex-col justify-between h-44"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-md font-bold text-white">Student Report</h3>
                <p className="text-[10px] text-slate-400 mt-1">Review student list, individual progress rates, and quiz scores.</p>
              </div>
            </Card>

            {/* Attendance Card */}
            <Card
              onClick={() => setActiveTab("attendance")}
              className="p-5 border border-slate-800 bg-slate-900/60 hover:border-emerald-500/30 cursor-pointer hover:bg-slate-900 hover:translate-y-[-2px] transition duration-300 flex flex-col justify-between h-44"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-md font-bold text-white">Attendance</h3>
                <p className="text-[10px] text-slate-400 mt-1">Check cohort participation levels and live session attendance.</p>
              </div>
            </Card>

            {/* Course Report Card */}
            <Card
              onClick={() => setActiveTab("course")}
              className="p-5 border border-slate-800 bg-slate-900/60 hover:border-orange-500/30 cursor-pointer hover:bg-slate-900 hover:translate-y-[-2px] transition duration-300 flex flex-col justify-between h-44"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <BarChart2 size={20} />
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-md font-bold text-white">Course Report</h3>
                <p className="text-[10px] text-slate-400 mt-1">Examine engagement footprint, metrics charts, and analytics.</p>
              </div>
            </Card>

            {/* Batches Card */}
            <Card
              onClick={() => setActiveTab("batches")}
              className="p-5 border border-slate-800 bg-slate-900/60 hover:border-blue-500/30 cursor-pointer hover:bg-slate-900 hover:translate-y-[-2px] transition duration-300 flex flex-col justify-between h-44"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-md font-bold text-white">Batches</h3>
                <p className="text-[10px] text-slate-400 mt-1">Manage cohort groups, meeting times, and batch listings.</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 4. Sub-dashboard views (Step 3) */}
      {selectedCourseId && activeTab === "student" && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Reports Menu</span>
            </button>
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Student Roster Card */}
          <Card className="p-6 border border-slate-800 bg-slate-900/60 shadow-lg">
            <h3 className="text-md font-bold text-white mb-4">Learner Progress Roster</h3>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No students found matching search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">
                      <th className="pb-3 pl-2">Student</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Enrolled At</th>
                      <th className="pb-3">Lesson Progress</th>
                      <th className="pb-3 pr-2 text-right">Avg Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      // Generate dynamic completion rate and mock grades
                      const mockProgress = Math.min(Math.floor((3 + index * 4) * 8.5), 100);
                      const mockGrade = 65 + (index * 7) % 35;
                      
                      return (
                        <tr key={student.id} className="border-b border-slate-800/60 hover:bg-slate-850/40 transition">
                          <td className="py-3.5 pl-2 font-bold text-white">{student.name}</td>
                          <td className="py-3.5">{student.email}</td>
                          <td className="py-3.5 text-slate-400">
                            {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : "Jul 10, 2026"}
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden shrink-0">
                                <div className="h-full bg-purple-500" style={{ width: `${mockProgress}%` }} />
                              </div>
                              <span className="font-bold">{mockProgress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-2 text-right font-black text-emerald-400">{mockGrade}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Attendance Tab */}
      {selectedCourseId && activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Reports Menu</span>
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Stats */}
            <Card className="p-5 border border-slate-800 bg-slate-900/60 md:col-span-1 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Participation Analytics</h3>
              
              <div className="space-y-4 pt-2">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Average Attendance</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">84.2%</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Live Sessions Completed</span>
                  <span className="text-2xl font-black text-white mt-1 block">12 Classes</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Cohort Attention Level</span>
                  <span className="text-xs font-bold text-orange-400 mt-1 flex items-center gap-1">
                    <span>High Attention (Stable)</span>
                  </span>
                </div>
              </div>
            </Card>

            {/* Attendance list */}
            <Card className="p-6 border border-slate-800 bg-slate-900/60 md:col-span-2">
              <h3 className="text-md font-bold text-white mb-4">Student Attendance Index</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">
                      <th className="pb-3 pl-2">Student Name</th>
                      <th className="pb-3">Scheduled Sessions</th>
                      <th className="pb-3">Attended Sessions</th>
                      <th className="pb-3 pr-2 text-right">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsRoster.map((student, index) => {
                      const total = 12;
                      const attended = Math.max(9, 12 - (index % 4));
                      const percent = Math.round((attended / total) * 100);
                      
                      return (
                        <tr key={student.id} className="border-b border-slate-800/60 hover:bg-slate-850/40 transition">
                          <td className="py-3.5 pl-2 font-semibold text-white">{student.name}</td>
                          <td className="py-3.5">{total} Classes</td>
                          <td className="py-3.5 text-slate-400">{attended} Classes</td>
                          <td className="py-3.5 pr-2 text-right font-bold text-emerald-400">{percent}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Course Report Tab */}
      {selectedCourseId && activeTab === "course" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Reports Menu</span>
            </button>
          </div>

          {/* Charts container */}
          <div className="space-y-6">
            <StudentEngagement courseId={selectedCourseId} />
            
            <ConceptMastery
              title="Module & Quiz Concept Mastery"
              subtitle="Average percentage score metrics across lesson groups"
            />
          </div>
        </div>
      )}

      {/* Batches Tab */}
      {selectedCourseId && activeTab === "batches" && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Reports Menu</span>
            </button>
            <button
              onClick={() => setIsCreatingBatch(!isCreatingBatch)}
              className="flex items-center gap-2 cursor-pointer rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 transition duration-200"
            >
              <Plus size={14} />
              Create New Batch
            </button>
          </div>

          {batchSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-4 rounded-xl">
              {batchSuccess}
            </div>
          )}

          {/* Inline Batch Creator form */}
          {isCreatingBatch && (
            <Card className="p-6 border border-slate-800 bg-slate-900/60 shadow-lg animate-in slide-in-from-top-2 duration-200">
              <h3 className="text-md font-bold text-white mb-4 border-b border-slate-850 pb-2">Create Learning Cohort Batch</h3>
              <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Batch Name"
                    placeholder="e.g. Summer Morning Cohort A"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Start Date</label>
                    <input
                      type="date"
                      value={batchStartDate}
                      onChange={(e) => setBatchStartDate(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Start Time"
                    placeholder="e.g. 09:00 AM"
                    value={batchStartTime}
                    onChange={(e) => setBatchStartTime(e.target.value)}
                  />
                  <Input
                    label="End Time"
                    placeholder="e.g. 11:00 AM"
                    value={batchEndTime}
                    onChange={(e) => setBatchEndTime(e.target.value)}
                  />
                  <Input
                    label="Live Meeting Link"
                    placeholder="e.g. https://meet.google.com/..."
                    value={batchMeetingLink}
                    onChange={(e) => setBatchMeetingLink(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingBatch(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={createBatchMutation.isPending}>
                    {createBatchMutation.isPending ? "Creating..." : "Save Batch"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Batches list */}
          <div className="grid gap-6 md:grid-cols-2">
            {batches.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 text-xs border border-slate-800 bg-slate-900/60 md:col-span-2">
                <Layers className="mx-auto text-slate-600 mb-3" size={24} />
                No active batches found for this course. Click "Create New Batch" to establish a group!
              </Card>
            ) : (
              batches.map((batch) => (
                <Card key={batch.id} className="p-5 border border-slate-850 bg-slate-900/40 hover:border-slate-800 transition duration-300 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-bold text-white">{batch.name}</h4>
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-400 border border-blue-500/20">
                        {batch.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-500" />
                        <span>Started on {new Date(batch.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-slate-500" />
                        <span>Schedule: {batch.startTime || "N/A"} - {batch.endTime || "N/A"}</span>
                      </div>
                      {batch.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Video size={13} className="text-slate-500" />
                          <a
                            href={batch.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition"
                          >
                            <span>Join Live Session</span>
                            <ExternalLink size={9} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 mt-5 pt-3 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Batch ID: {batch.id.slice(-8).toUpperCase()}</span>
                    <span className="text-slate-400 font-bold">12 Registered Students</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
