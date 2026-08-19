export const QUERY_KEYS = {
    // ==========================
    // Auth
    // ==========================
    AUTH_SESSION: "auth-session",

    // ==========================
    // Student
    // ==========================
    COURSES: "courses",
    COURSE: "course",
    MY_COURSES: "my-courses",
    STORE_COURSES: "store-courses",
    STUDENT_DASHBOARD: "student-dashboard",
    PAYMENTS: "payments",
    PAYMENT_ORDERS: "payment-orders",
    UPCOMING_TASKS: "upcoming-tasks",
    STUDENT_PROFILE: "student-profile",
    STUDENT_PROGRESS: "student-progress",
    STUDENT_CERTIFICATES: "student-certificates",
    STUDENT_STATE: "student-state",
    STUDENT_QUIZZES: "student-quizzes",
    STUDENT_QUESTIONS: "student-questions",
    STUDENT_ASSIGNMENTS: "student-assignments",
    STUDENT_ASSIGNMENT: "student-assignment",
    STICKY_NOTES: "sticky-notes",
    TRANSCRIPT: "transcript",
    NOTES: "notes",
    BOOKMARKS: "bookmarks",
    LIVE_CLASSES: "live-classes",
    ACHIEVEMENTS: "achievements",
    MY_ACHIEVEMENTS: "my-achievements",
    DASHBOARD: "dashboard",
    PROGRESS: "progress",
    ENTRY_ASSESSMENT: "entry-assessment",
    COURSE_STATE: "course-state",
    LEARNING_PATH: "learning-path",

    // ==========================
    // Admin
    // ==========================
    ADMIN_DASHBOARD: "admin-dashboard",

    ADMIN_USERS: "admin-users",
    ADMIN_USER: "admin-user",

    ADMIN_STUDENTS: "admin-students",
    ADMIN_STUDENT: "admin-student",

    ADMIN_INSTRUCTORS: "admin-instructors",
    ADMIN_INSTRUCTOR: "admin-instructor",

    ADMIN_COURSES: "admin-courses",
    ADMIN_COURSE: "admin-course",

    ADMIN_ENROLLMENTS: "admin-enrollments",
    ADMIN_ENROLLMENT: "admin-enrollment",

    ADMIN_CERTIFICATES: "admin-certificates",

    ADMIN_CALENDAR_EVENTS: "admin-calendar-events",

    // Identity-check cache only (AuthContext's own session query) -- page-level
    // profile reads must use their own role-scoped key below, never this one:
    // AuthContext's getProfile (auth.service, GET /auth/profile) returns the
    // raw {success,message,data} wrapper, not the unwrapped user object that
    // profile.service's getProfile (GET /users/profile/me) returns. Sharing
    // this key with a page-level read means whichever query populates the
    // cache first "wins" for up to staleTime (5 min, refetchOnMount:false),
    // silently serving the wrong shape to the other.
    PROFILE: "profile",
    ADMIN_PROFILE: "admin-profile",
    INSTRUCTOR_PROFILE: "instructor-profile",

    // ==========================
    // Instructor
    // ==========================
    INSTRUCTOR_DASHBOARD: "instructor-dashboard",
    TEACHER_INSIGHTS: "teacher-insights",

    INSTRUCTOR_COURSES: "instructor-courses",
    INSTRUCTOR_COURSES_TABLE: "instructor-courses-table",
    INSTRUCTOR_COURSE: "instructor-course",

    MODULES: "modules",
    MODULE: "module",

    LESSONS: "lessons",
    LESSON: "lesson",

    TOPICS: "topics",
    TOPIC: "topic",

    CONTENTS: "contents",
    CONTENT: "content",

    QUIZZES: "quizzes",
    QUIZ: "quiz",

    QUESTIONS: "questions",
    QUESTION: "question",
    QUIZ_RESULT: "quiz-result",

    LESSON_NOTES: "lesson-notes",
    LESSON_QUERIES: "lesson-queries",
    MY_LESSON_QUERIES: "my-lesson-queries",
    DISCUSSIONS: "discussions",

    BATCHES: "batches",
    MY_BATCHES: "my-batches",
    BATCH_DETAIL: "batch-detail",
    BATCH_ENROLLABLE_STUDENTS: "batch-enrollable-students",
    BATCH_PERFORMANCE_OVERVIEW: "batch-performance-overview",
    BATCH_DASHBOARD: "batch-dashboard",
    BATCH_ANNOUNCEMENTS: "batch-announcements",
    BATCH_QUIZZES: "batch-quizzes",
    EXAMS: "exams",
    EXAM: "exam",
    MY_REVIEWS: "my-reviews",
    RESULTS: "results",
    ASSESSMENTS: "assessments",

    // ==========================
    // Mentor AI
    // ==========================
    MENTOR_CONVERSATIONS: "mentor-conversations",
    MENTOR_MESSAGES: "mentor-messages",
};