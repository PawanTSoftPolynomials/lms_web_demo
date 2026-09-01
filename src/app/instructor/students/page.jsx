'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  AlertTriangle, ArrowLeft, Loader2, Info
} from 'lucide-react';

import { useStudents } from '@/hooks/queries/instructor/useStudents';
import { useInstructorCourses } from '@/hooks/queries/instructor/useInstructorCourses';
import { useCourseBatches } from '@/hooks/queries/instructor/useBatches';

function StudentsDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: students = [], isLoading, isError } = useStudents();
  const { data: courses = [] } = useInstructorCourses();

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Progress'); // Progress | Assignments | Certificates

  const selectedCourse = courseFilter === 'All' ? null : courses.find((c) => c.id === courseFilter);

  // Batches for the selected course only — the API doesn't (yet) link a
  // student record to a batch, so this list is informational/for future use
  // rather than something we can filter the table by.
  const { data: courseBatches = [], isLoading: loadingBatches } = useCourseBatches(
    courseFilter !== 'All' ? courseFilter : undefined
  );

  const handleCourseFilterChange = (value) => {
    setCourseFilter(value);
    setBatchFilter('All');
  };

  // Parse studentId parameter from URL (drilldown from dashboard)
  useEffect(() => {
    const studentIdParam = searchParams.get('studentId');
    if (studentIdParam) {
      setSelectedStudentId(studentIdParam);
    }
  }, [searchParams]);

  // Filter students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const isStudentRole = !student.role || student.role === 'STUDENT';
      const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (student.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (student.course || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      const matchesCourse = courseFilter === 'All' || student.course === selectedCourse?.title;
      // Batch isn't matched here — student records don't carry batch membership yet.

      return isStudentRole && matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, searchQuery, statusFilter, courseFilter, selectedCourse]);

  // Selected student details object
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    // Update query params without reloading
    const params = new URLSearchParams(window.location.search);
    params.set('studentId', id);
    router.replace(`/instructor/students?${params.toString()}`);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
    router.replace('/instructor/students');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="text-xs font-black text-slate-450 uppercase tracking-widest font-mono">Loading Students...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertTriangle className="text-red-500" size={24} />
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest font-mono">Failed to load students</span>
          <p className="text-[10px] text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col gap-6 bg-background pb-10">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {selectedStudentId && (
            <button
              onClick={handleBackToList}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-slate-150 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <div>
            <h1 className="sr-only">
              {selectedStudentId ? 'Student Profile' : 'Student Directory'}
            </h1>
            <p className="sr-only">
              {selectedStudentId ? `Viewing ${selectedStudent?.name}` : `${filteredStudents.length} Students Active`}
            </p>
          </div>
        </div>
        <Link href="/instructor/dashboard" className="text-[10px] font-black text-muted-foreground hover:text-foreground flex items-center gap-1">
          &larr; Back to Dashboard
        </Link>
      </div>

      {selectedStudent ? (
        /* DETAIL VIEW: Filtered Student List -> Student Details -> Progress -> Assignments -> Certificates */
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          
          {/* Profile Sidebar Info */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex flex-col items-center text-center pb-4 border-b border-border">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 text-orange-450 flex items-center justify-center text-xl font-black mb-3">
                {selectedStudent.name[0]}
              </div>
              <h2 className="text-sm font-black text-foreground">{selectedStudent.name}</h2>
              <p className="text-[9px] font-extrabold text-primary uppercase tracking-wider mt-1">{selectedStudent.status}</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Email Address</p>
                <p className="text-foreground font-semibold mt-0.5 truncate">{selectedStudent.email}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Enrolled Course</p>
                <p className="text-foreground font-semibold mt-0.5">{selectedStudent.course}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Member Since</p>
                <p className="text-muted-foreground font-semibold mt-0.5">{selectedStudent.joinedDate}</p>
              </div>
            </div>

            <button 
              onClick={handleBackToList}
              className="w-full text-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10.5px] font-black transition cursor-pointer"
            >
              Back to Directory
            </button>
          </div>

          {/* Details & Tab contents */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-5">
            
            {/* Tabs Selector */}
            <div className="flex gap-4 border-b border-border pb-1">
              {['Progress', 'Assignments', 'Certificates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 px-1 text-xs font-black transition relative cursor-pointer ${
                    activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-slate-350'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === 'Progress' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white/[0.01] border border-border rounded-xl text-center">
                      <p className="text-[9px] text-muted-foreground font-black uppercase">Overall Progress</p>
                      <p className="text-lg font-black text-foreground mt-1">{selectedStudent.progress}%</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-border rounded-xl text-center">
                      <p className="text-[9px] text-muted-foreground font-black uppercase">Assignments Done</p>
                      <p className="text-lg font-black text-foreground mt-1">{selectedStudent.assignmentRate}%</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-border rounded-xl text-center">
                      <p className="text-[9px] text-muted-foreground font-black uppercase">Attendance Rate</p>
                      <p className="text-lg font-black text-foreground mt-1">
                        {selectedStudent.attendanceRate != null ? `${selectedStudent.attendanceRate}%` : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Modules detail */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest font-mono">Module Completion</h3>
                    <div className="space-y-3">
                      {selectedStudent.modules.map((mod, idx) => (
                        <div key={idx} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-250 truncate max-w-[350px]">{mod.name}</span>
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded ${
                              mod.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-450' : 'bg-amber-500/10 text-amber-450'
                            }`}>{mod.status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${mod.progress}%` }} />
                            </div>
                            <span className="text-[9.5px] font-bold text-muted-foreground">{mod.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Assignments' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest font-mono mb-2">Assignment Grades</h3>
                  <div className="space-y-2.5">
                    {selectedStudent.assignments.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">No assignments assigned yet</p>
                    ) : (
                      selectedStudent.assignments.map((as) => (
                        <div key={as.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-extrabold text-slate-250 leading-tight">{as.title}</p>
                            <p className="text-[9px] text-muted-foreground mt-1 font-semibold">Due/Submitted: {as.date}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded inline-block ${
                              as.status === 'Graded' 
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                                : as.status === 'Overdue' 
                                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                                : 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                            }`}>
                              {as.status}
                            </span>
                            {as.score !== null && (
                              <p className="text-[11.5px] font-black text-slate-250 mt-1.5">{as.score} / {as.maxScore}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Certificates' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest font-mono mb-2">Issued Certificates</h3>
                  <div className="space-y-3">
                    {selectedStudent.certificates.length === 0 ? (
                      <div className="py-12 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center">
                        <span className="text-2xl mb-1.5">📜</span>
                        <p className="text-xs font-black text-muted-foreground">No Certificates Issued Yet</p>
                        <p className="text-[9.5px] text-muted-foreground max-w-[200px] mt-1 leading-normal">
                          Student has not yet completed the full course path requirements to generate a certificate.
                        </p>
                      </div>
                    ) : (
                      selectedStudent.certificates.map((cert) => (
                        <div key={cert.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-extrabold text-slate-250">{cert.title}</p>
                            <p className="text-[9px] text-slate-550 mt-1 font-semibold">Credential ID: {cert.code}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-[8.5px] font-black px-2 py-0.5 rounded bg-primary/10 text-orange-450 border border-primary/20">
                              Issued
                            </span>
                            <p className="text-[9.5px] text-muted-foreground mt-1 font-bold">{cert.date}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* DIRECTORY LIST VIEW */
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          
          {/* Controls: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-550">
                <Search size={13} />
              </span>
              <input
                type="text"
                placeholder="Search students, email, course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-border text-xs pl-8 pr-3.5 py-2 rounded-xl outline-none text-foreground placeholder-slate-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {['All', 'Not Started', 'Behind Average', 'Struggling', 'Attendance Alert', 'Top Performer'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition whitespace-nowrap cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-primary/10 border border-primary/20 text-orange-450'
                      : 'bg-white/[0.02] border border-border text-muted-foreground hover:text-slate-350'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Controls: Course & Batch Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => handleCourseFilterChange(e.target.value)}
                className="w-full bg-white/[0.02] border border-border text-xs px-3.5 py-2 rounded-xl outline-none text-foreground focus:border-transparent transition cursor-pointer"
              >
                <option value="All">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                disabled={courseFilter === 'All' || loadingBatches}
                className="w-full bg-white/[0.02] border border-border text-xs px-3.5 py-2 rounded-xl outline-none text-foreground focus:border-transparent transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="All">{courseFilter === 'All' ? 'Select a course first' : 'All Batches'}</option>
                {courseBatches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {batchFilter !== 'All' && (
                <p className="flex items-center gap-1 text-[9px] text-muted-foreground mt-1.5">
                  <Info size={10} className="shrink-0" />
                  Batch rosters aren&apos;t linked to students yet — this doesn&apos;t narrow the list below.
                </p>
              )}
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto my-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[9.5px] font-black text-muted-foreground uppercase tracking-widest">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-center">Course Progress</th>
                  <th className="pb-3 text-center">Attendance</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1F35]/50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-muted-foreground">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-white/[0.01] transition">
                      <td className="py-4 pl-2">
                        <div className="font-extrabold text-slate-250">{student.name}</div>
                        <div className="text-[9.5px] text-muted-foreground font-semibold mt-0.5">{student.email}</div>
                      </td>
                      <td className="py-4 text-slate-350 font-semibold">{student.course}</td>
                      <td className="py-4 text-center">
                        <span className={`text-[7.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                          student.status === 'Top Performer' 
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                            : student.status === 'Not Started'
                            ? 'bg-muted text-muted-foreground border border-transparent/50'
                            : student.status === 'Struggling' || student.status === 'Behind Average'
                            ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span className="font-bold text-foreground">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-center font-bold text-foreground">
                        {student.attendanceRate != null ? `${student.attendanceRate}%` : "N/A"}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => handleSelectStudent(student.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-orange-550/20 text-orange-450 text-[10px] font-black transition cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-foreground flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="text-xs font-black text-slate-450 uppercase tracking-widest font-mono">Loading Directory...</span>
        </div>
      </div>
    }>
      <StudentsDirectoryContent />
    </Suspense>
  );
}
