import { getCourseById } from "@/services/course.service";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Star,
  User,
  GraduationCap,
  Layers,
  Award,
  CheckCircle2,
  BarChart2,
  FileText,
  HelpCircle,
  ShieldCheck,
  BookOpen,
  PlayCircle
} from "lucide-react";

export default async function CoursePage({ params }) {
  const { courseId } = await params;

  const course = await getCourseById(courseId);

  // Dynamic calculations
  const lessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;
  const duration = lessonsCount > 0 ? `${Math.max(1, Math.round((lessonsCount * 25) / 60))} hours` : "12 hours";
  const worksheetsCount = course.assignments?.length ?? 0;
  const quizzesCount = course.quizzes?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-orange-500/30 selection:text-orange-400">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* 1. Breadcrumbs Nav */}
        <nav className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <ChevronRight size={10} className="text-slate-600" />
          <Link href="/student/courses" className="hover:text-white transition">Courses</Link>
          <ChevronRight size={10} className="text-slate-600" />
          <span className="text-orange-500">{course.title}</span>
        </nav>

        {/* 2. Two-Column Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          
          {/* Left Column: Course Main Content */}
          <div className="space-y-8">
            
            {/* Course Title & Badges block */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-400 text-sm font-semibold">
                {course.category}
              </p>

              {/* Horizontal pills stats */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  <Clock size={12} className="text-orange-500" />
                  <span>{duration}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span>4.8 (15 student ratings)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  <BarChart2 size={12} className="text-purple-400" />
                  <span>{course.level || "Intermediate"} Difficulty</span>
                </span>
              </div>
            </div>

            {/* Course Description Section (Dark full-width card) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Course Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {course.description || "This course is designed to strengthen your skills through a series of engaging modules and real-world examples. You'll learn step-by-step and practice with quizzes to master each concept."}
              </p>
            </div>

            {/* Instructor Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-700 bg-slate-850 flex items-center justify-center text-slate-400 shrink-0">
                  <User size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{course.creator?.name ?? "John Doe"}</h4>
                  <p className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest mt-0.5">Lead Syllabus Instructor</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Experienced educator with years of teaching and industry experience. Passionate about helping students understand complex concepts in a simple way.
              </p>

              <div className="border-t border-slate-800/80 my-4" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Experience</p>
                  <p className="mt-1 text-xs font-bold text-white">8+ years</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Rating</p>
                  <p className="mt-1 text-xs font-bold text-white">4.8/5</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Education</p>
                  <p className="mt-1 text-xs font-bold text-white">M.Tech</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Students</p>
                  <p className="mt-1 text-xs font-bold text-white">12K+</p>
                </div>
              </div>
            </div>

            {/* Course Overview Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Course Overview</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide">Modules</span>
                    <Layers size={14} className="text-orange-400" />
                  </div>
                  <p className="text-xl font-bold text-white mt-1">{course.modules?.length ?? 0}</p>
                  <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Total modules</p>
                </div>

                <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide">Lessons</span>
                    <PlayCircle size={14} className="text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-white mt-1">{lessonsCount}</p>
                  <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Total lessons</p>
                </div>

                <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide">Students</span>
                    <GraduationCap size={14} className="text-purple-400" />
                  </div>
                  <p className="text-xl font-bold text-white mt-1">{course.enrollments?.length ?? 0}</p>
                  <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Completed</p>
                </div>

                <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide">Avg. Rating</span>
                    <Star size={14} className="text-amber-400" />
                  </div>
                  <p className="text-xl font-bold text-white mt-1">4.8<span className="text-xs text-slate-500 font-medium">/5</span></p>
                  <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">(15 ratings)</p>
                </div>
              </div>
            </div>

            {/* Course Details Grid Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Course Details</h3>
              <div className="grid gap-x-6 gap-y-4 grid-cols-2 sm:grid-cols-3">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Level</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">{course.level || "Intermediate"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Category</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">{course.category}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Duration</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">{duration}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Pre-requisite</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">Basic Math/CS Intro</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Aim at the end</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">Problem solving skills</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Certificate</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">Yes, on completion</p>
                </div>
              </div>
            </div>

            {/* What You'll Learn Checklist Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">What You'll Learn</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Improve logical thinking",
                  "Understand patterns and sequences",
                  "Solve real-life problems",
                  "Strengthen analytical skills",
                  "Enhance decision making",
                  "Ace reasoning-based assessments"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-350">
                    <CheckCircle2 size={14} className="text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Pricing & Cohort Reviews */}
          <div className="space-y-6">
            
            {/* Purchase & Overview Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-5">
              
              {/* Media Thumbnail */}
              <div className="h-44 w-full overflow-hidden rounded-xl bg-slate-800 border border-slate-800/80 relative flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlayCircle size={48} className="text-slate-500" />
                )}
              </div>

              {/* Price Details */}
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white">₹4,999.00</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Full Access Price</p>
              </div>

              <Link
                href={`/login?redirect=/courses/${course.id}`}
                className="block text-center w-full rounded-xl bg-orange-500 hover:bg-orange-655 text-slate-950 font-black uppercase tracking-widest text-xs py-4 transition"
              >
                Buy Course
              </Link>
              
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                Instant access to lessons, quizzes, and live feeds
              </p>

              <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs font-semibold text-slate-400">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><Clock size={13} className="text-slate-500" /> Standard duration</span>
                  <span className="text-white">{duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><FileText size={13} className="text-slate-500" /> Assigned Worksheets</span>
                  <span className="text-white">{worksheetsCount} worksheets</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><HelpCircle size={13} className="text-slate-500" /> Interactive quizzes</span>
                  <span className="text-white">{quizzesCount} exams</span>
                </div>
              </div>
            </div>

            {/* Student Reviews Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Student Reviews</h3>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[10px] font-black">
                  <Star size={10} className="fill-amber-400" />
                  <span>4.8</span>
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "John Doe",
                    review: "Dan's explanation of dynamic configurations finally demystified Next.js caching",
                    time: "2 days ago"
                  },
                  {
                    name: "Sarah Williams",
                    review: "Best course for enterprise level Next.js applications.",
                    time: "1 week ago"
                  },
                  {
                    name: "Michael Brown",
                    review: "Very practical and easy to follow.",
                    time: "2 weeks ago"
                  }
                ].map((rev, idx) => (
                  <div key={idx} className="space-y-1.5 text-left border-b border-slate-800/40 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{rev.name}</span>
                      <span className="text-[8px] text-slate-500 font-semibold">{rev.time}</span>
                    </div>
                    
                    {/* 5-star rating */}
                    <div className="flex gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className="fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      "{rev.review}"
                    </p>
                  </div>
                ))}
              </div>

              <button className="w-full text-center py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-300 transition">
                View All Reviews
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}