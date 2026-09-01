import { getCourseById } from "@/services/course.service";
import Image from "next/image";
import { notFound } from "next/navigation";
import CourseBuyButton from "@/components/student/course-details/CourseBuyButton";
import DashboardNavbar from "@/components/layouts/DashboardNavbar";
import { getDisplayUrl } from "@/lib/blob";
import {
  Clock,
  Star,
  User,
  GraduationCap,
  Layers,
  CheckCircle2,
  BarChart2,
  FileText,
  HelpCircle,
  PlayCircle,
  Award,
  ShieldCheck
} from "lucide-react";

export default async function CoursePage({ params }) {
  const { courseId } = await params;

  let course;
  try {
    course = await getCourseById(courseId);
  } catch (error) {
    if (error?.response?.status === 404) {
      notFound();
    }
    throw error;
  }

  // Dynamic calculations
  const lessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;
  const duration = lessonsCount > 0 ? `${Math.max(1, Math.round((lessonsCount * 25) / 60))} hours` : "12 hours";
  const worksheetsCount = course.assignments?.length ?? 0;
  const quizzesCount = course.quizzes?.length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary flex flex-col">
      {/* Canonical Application Navbar */}
      <DashboardNavbar role="STUDENT" title={course.title} />

      {/* Main Course Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Main Two-Column Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Course Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Course Title & Metadata Hero Block */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-2xs font-extrabold uppercase tracking-wider">
                {course.category || "Featured Course"}
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {course.description || "Master essential concepts step-by-step with structured modules, interactive topic quizzes, and real-world application."}
              </p>

              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-2xs font-bold text-foreground shadow-2xs">
                  <Clock size={13} className="text-primary" />
                  <span>{duration}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-2xs font-bold text-foreground shadow-2xs">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span>4.8 (15 ratings)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-2xs font-bold text-foreground shadow-2xs">
                  <BarChart2 size={13} className="text-primary" />
                  <span>{course.level || "Intermediate"} Level</span>
                </span>
              </div>
            </div>

            {/* Course Overview Metrics Grid */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Course Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/80 bg-surface/70 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-2xs font-bold uppercase tracking-wide">Modules</span>
                    <Layers size={15} className="text-primary" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{course.modules?.length ?? 0}</p>
                  <p className="text-2xs text-muted-foreground">Structured units</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/70 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-2xs font-bold uppercase tracking-wide">Lessons</span>
                    <PlayCircle size={15} className="text-blue-500" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{lessonsCount}</p>
                  <p className="text-2xs text-muted-foreground">Total lessons</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/70 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-2xs font-bold uppercase tracking-wide">Learners</span>
                    <GraduationCap size={15} className="text-purple-500" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{course.enrollments?.length ?? 0}</p>
                  <p className="text-2xs text-muted-foreground">Enrolled students</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/70 p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-2xs font-bold uppercase tracking-wide">Rating</span>
                    <Star size={15} className="text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-lg font-bold text-foreground">4.8<span className="text-xs text-muted-foreground font-normal">/5</span></p>
                  <p className="text-2xs text-muted-foreground">Verified reviews</p>
                </div>
              </div>
            </div>

            {/* Course Summary Content Surface */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Course Summary</h2>
              <p className="text-foreground text-xs sm:text-sm leading-relaxed">
                {course.description || "This course is designed to strengthen your skills through a series of engaging modules and real-world examples. You'll learn step-by-step and practice with quizzes to master each concept."}
              </p>
            </div>

            {/* What You'll Learn Checklist Card */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">What You'll Learn</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Improve logical thinking & core concepts",
                  "Understand practical patterns and workflows",
                  "Solve real-world problems with guidance",
                  "Strengthen analytical & problem-solving skills",
                  "Enhance decision making in practical tasks",
                  "Ace topic-level quizzes and assessments"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Details Card */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Course Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border border-border bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {course.creator?.name ? course.creator.name.charAt(0).toUpperCase() : <User size={22} />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">{course.creator?.name ?? "Instructor Team"}</h3>
                  <p className="text-2xs font-extrabold text-primary uppercase tracking-wider mt-0.5">Lead Curriculum Specialist</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Experienced educator passionate about delivering structured, accessible, and high-impact learning experiences.
              </p>

              <div className="border-t border-border/60 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Experience</p>
                  <p className="mt-0.5 text-xs font-bold text-foreground">8+ Years</p>
                </div>
                <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Rating</p>
                  <p className="mt-0.5 text-xs font-bold text-foreground">4.8 / 5.0</p>
                </div>
                <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Credential</p>
                  <p className="mt-0.5 text-xs font-bold text-foreground">M.Tech / Certified</p>
                </div>
                <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Students</p>
                  <p className="mt-0.5 text-xs font-bold text-foreground">12K+ Taught</p>
                </div>
              </div>
            </div>

            {/* Course Details Specifications */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Course Specifications</h2>
              <div className="grid gap-x-6 gap-y-3.5 grid-cols-2 sm:grid-cols-3 text-xs">
                <div>
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Level</p>
                  <p className="font-bold text-foreground mt-0.5">{course.level || "Intermediate"}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Category</p>
                  <p className="font-bold text-foreground mt-0.5">{course.category || "General"}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Duration</p>
                  <p className="font-bold text-foreground mt-0.5">{duration}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Prerequisites</p>
                  <p className="font-bold text-foreground mt-0.5">Basic Intro Knowledge</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Target Outcome</p>
                  <p className="font-bold text-foreground mt-0.5">Practical Mastery</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-muted-foreground uppercase">Certificate</p>
                  <p className="font-bold text-foreground mt-0.5">Verifiable on Completion</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Primary Purchase Conversion Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Purchase & Conversion Box */}
            <div className="sticky top-20 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-md space-y-5">
              
              {/* Elevated Media Panel */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted border border-border shadow-2xs">
                {course.thumbnailUrl ? (
                  <Image
                    src={getDisplayUrl(course.thumbnailUrl)}
                    alt={course.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                    <PlayCircle size={40} className="text-primary" />
                  </div>
                )}
              </div>

              {/* Price Details */}
              <div className="space-y-1 pt-1">
                <p className="text-2xs text-muted-foreground font-extrabold uppercase tracking-wider">Full Access Enrollment</p>
                <h3 className="text-3xl font-black text-foreground">
                  {course.store
                    ? `₹${(course.store.discountPrice > 0 ? course.store.discountPrice : course.store.price).toLocaleString("en-IN")}`
                    : "₹4,999.00"}
                </h3>
              </div>

              {/* Primary Buy Action Button */}
              <CourseBuyButton courseId={course.id} courseTitle={course.title} />

              {/* Instant Access Guarantee Tag */}
              <div className="flex items-center justify-center gap-1.5 text-2xs font-bold text-muted-foreground">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Instant access to lessons & quizzes</span>
              </div>

              {/* Course Benefits List */}
              <div className="border-t border-border/60 pt-4 space-y-3 text-xs font-semibold text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Duration</span>
                  <span className="text-foreground font-bold">{duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><FileText size={14} className="text-primary" /> Worksheets</span>
                  <span className="text-foreground font-bold">{worksheetsCount} materials</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><HelpCircle size={14} className="text-primary" /> Quizzes</span>
                  <span className="text-foreground font-bold">{quizzesCount} exams</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><Award size={14} className="text-primary" /> Certificate</span>
                  <span className="text-foreground font-bold">Included</span>
                </div>
              </div>
            </div>

            {/* Verified Student Reviews Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Student Reviews</h2>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-2xs font-bold">
                  <Star size={11} className="fill-amber-400" />
                  <span>4.8</span>
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "John Doe",
                    review: "The explanation of concepts and module exercises made understanding effortless.",
                    time: "2 days ago"
                  },
                  {
                    name: "Sarah Williams",
                    review: "Best course structure for practical learning and concept retention.",
                    time: "1 week ago"
                  }
                ].map((rev, idx) => (
                  <div key={idx} className="space-y-1 text-left border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{rev.name}</span>
                      <span className="text-2xs text-muted-foreground">{rev.time}</span>
                    </div>
                    
                    <div className="flex gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} className="fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-2xs text-muted-foreground leading-relaxed font-medium">
                      "{rev.review}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}