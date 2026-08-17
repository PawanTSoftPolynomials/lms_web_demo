"use client";

import MyCourseCard from "@/components/student/my-courses/MyCourseCard";

export default function CourseCard({ course, enrollment, index = 0 }) {
  return <MyCourseCard course={course} enrollment={enrollment} index={index} />;
}
              value={isEnrolled ? `${completedLessons}/${lessonsTotal}` : lessonsTotal}
              label="Lessons"
            />
            <StatCell
              icon={ClipboardCheck}
              value={isEnrolled ? `${completedQuizzes}/${quizzesTotal}` : quizzesTotal}
              label="Quizzes"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-card-border bg-white/[0.02] px-3 text-[11px] font-bold text-slate-300">
            <Clock size={12} className="text-slate-500" />
            {durationLabel}
          </div>
        </div>

        {isEnrolled && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-slate-400">Progress</span>
              <span className="text-orange-400">{progress}% Complete</span>
            </div>
            <ProgressBar value={progress} size="sm" />
          </div>
        )}

        <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <User size={12} className="shrink-0" /> <span className="truncate">{instructorName}</span>
          </span>
          {isEnrolled ? (
            <span className="flex items-center gap-1.5 shrink-0">
              <History size={12} /> {lastAccessedLabel}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 shrink-0">
              <GraduationCap size={12} /> {courseData.level || "All levels"}
            </span>
          )}
        </div>

        <div className={`mt-auto grid gap-2 pt-1 ${isEnrolled ? "grid-cols-2" : "grid-cols-1"}`}>
          {isEnrolled && (
            <Link
              href={`/student/courses/${id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-card-border bg-white/[0.03] py-2.5 text-xs font-bold text-slate-300 hover:border-slate-600 hover:text-white transition-all duration-200"
            >
              Course Details
            </Link>
          )}
          <Link
            href={primaryHref}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-orange-600 transition-all duration-200"
          >
            {isEnrolled && <Play size={13} className="fill-slate-950" />}
            {primaryLabel}
            {!isEnrolled && <ArrowUpRight size={13} />}
          </Link>
        </div>
      </div>
    </div>
  );
}
