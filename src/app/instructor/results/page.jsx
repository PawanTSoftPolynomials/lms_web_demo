"use client";

import { useState } from "react";
import { Download, FileDown, TrendingUp, AlertTriangle } from "lucide-react";

import DataTable from "@/components/ui/DataTable";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useCourseBatches } from "@/hooks/queries/instructor/useBatches";
import { useQuizzes } from "@/hooks/queries/instructor/useQuizzes";
import { useInstructorAssignments } from "@/hooks/queries/instructor/useAssignments";
import { useExams } from "@/hooks/queries/instructor/useExams";
import { useCourseStudents } from "@/hooks/queries/instructor/useCourseStudents";
import { useResults } from "@/hooks/queries/instructor/useResults";
import { exportResultsCsv, exportResultsPdf } from "@/lib/exportResults";

const selectClass =
  "w-full bg-white/[0.02] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition disabled:opacity-40";
const labelClass = "text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
      <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1.5 tabular-nums">{value}</p>
    </div>
  );
}

const INITIAL_FILTERS = { courseId: "", batchId: "", quizId: "", assignmentId: "", examId: "", studentId: "", startDate: "", endDate: "" };

export default function ResultsPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const { data: courses = [] } = useInstructorCourses();
  const { data: batches = [] } = useCourseBatches(filters.courseId);
  const { data: quizzes = [] } = useQuizzes(filters.courseId);
  const { data: assignments = [] } = useInstructorAssignments(filters.courseId);
  const { data: exams = [] } = useExams(filters.courseId);
  const { data: students = [] } = useCourseStudents(filters.courseId);

  const { data, isLoading } = useResults(filters);
  const summary = data?.summary || { avgScore: 0, highestScore: 0, lowestScore: 0, passPercentage: 0, completionRate: 0, pendingEvaluations: 0 };
  const studentResults = data?.studentResults || [];
  const questionWise = data?.questionWise || [];
  const topicWise = data?.topicWise || [];

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value, ...(key === "courseId" ? { batchId: "", quizId: "", assignmentId: "", examId: "", studentId: "" } : {}) }));

  const studentColumns = [
    { key: "studentName", header: "Student" },
    { key: "title", header: "Quiz" },
    { key: "score", header: "Score", align: "center", render: (r) => `${r.score}/${r.totalMarks}` },
    { key: "percentage", header: "%", align: "center", render: (r) => `${r.percentage}%` },
    {
      key: "passed",
      header: "Result",
      align: "center",
      render: (r) => (
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${r.passed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
          {r.passed ? "Pass" : "Fail"}
        </span>
      ),
    },
    { key: "submittedAt", header: "Submitted", render: (r) => (r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—") },
  ];

  const analysisColumns = (labelKey) => [
    { key: labelKey, header: labelKey === "question" ? "Question" : "Topic" },
    { key: "attempts", header: "Attempts", align: "center" },
    { key: "correct", header: "Correct", align: "center" },
    { key: "accuracy", header: "Accuracy", align: "center", render: (r) => `${r.accuracy}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Results</h1>
          <p className="text-xs text-slate-400 mt-1">Student performance across quizzes and assessments.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportResultsCsv(studentResults)}
            disabled={studentResults.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 transition disabled:opacity-40"
          >
            <Download size={12} /> Export CSV
          </button>
          <button
            onClick={() => exportResultsPdf(summary, studentResults)}
            disabled={studentResults.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 transition disabled:opacity-40"
          >
            <FileDown size={12} /> Export PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <div>
            <label className={labelClass}>Course</label>
            <select className={selectClass} value={filters.courseId} onChange={set("courseId")}>
              <option value="">All Courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Batch</label>
            <select className={selectClass} value={filters.batchId} onChange={set("batchId")} disabled={!filters.courseId}>
              <option value="">All Batches</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Quiz</label>
            <select className={selectClass} value={filters.quizId} onChange={set("quizId")} disabled={!filters.courseId}>
              <option value="">All Quizzes</option>
              {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Assessment</label>
            <select className={selectClass} value={filters.assignmentId} onChange={set("assignmentId")} disabled={!filters.courseId}>
              <option value="">All Assessments</option>
              {assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Test</label>
            <select className={selectClass} value={filters.examId} onChange={set("examId")} disabled={!filters.courseId}>
              <option value="">All Tests</option>
              {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Student</label>
            <select className={selectClass} value={filters.studentId} onChange={set("studentId")} disabled={!filters.courseId}>
              <option value="">All Students</option>
              {students.map((s) => <option key={s.id} value={s.studentProfileId}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date Range</label>
            <div className="flex items-center gap-1.5">
              <input type="date" className={selectClass} value={filters.startDate} onChange={set("startDate")} />
              <input type="date" className={selectClass} value={filters.endDate} onChange={set("endDate")} />
            </div>
          </div>
        </div>
      </div>

      {filters.examId && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 flex items-center gap-2 text-amber-400 text-[11px] font-semibold">
          <AlertTriangle size={13} />
          Test results aren't tracked yet — there's no submission model for Tests, so this filter narrows nothing below.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Avg Score" value={`${summary.avgScore}%`} />
        <StatCard label="Highest" value={`${summary.highestScore}%`} />
        <StatCard label="Lowest" value={`${summary.lowestScore}%`} />
        <StatCard label="Pass Rate" value={`${summary.passPercentage}%`} />
        <StatCard label="Completion" value={`${summary.completionRate}%`} />
        <StatCard label="Pending Evals" value={summary.pendingEvaluations} />
      </div>

      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-orange-450" />
          <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">Student Results</h3>
        </div>
        <DataTable columns={studentColumns} rows={studentResults} isLoading={isLoading} rowKey="submissionId" emptyLabel="No quiz submissions found for the selected filters." />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
          <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350 mb-4">Question-wise Analysis</h3>
          <DataTable columns={analysisColumns("question")} rows={questionWise} isLoading={isLoading} rowKey="questionId" emptyLabel="No question-level data yet." />
        </div>
        <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
          <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350 mb-4">Topic-wise Analysis</h3>
          <DataTable columns={analysisColumns("topic")} rows={topicWise} isLoading={isLoading} rowKey="topic" emptyLabel="No topic-level data yet." />
        </div>
      </div>
    </div>
  );
}
