import api from "@/lib/axios";

// Helper to generate dates relative to today
const relativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

// Default seed events representing realistic course activities
const seedEvents = [
  {
    id: "seed-1",
    title: "Next.js Advanced Routing & SSR Live Masterclass",
    type: "class",
    courseId: "course-react-next",
    courseName: "Fullstack Web Development with Next.js",
    date: relativeDate(0), // Today
    startTime: "10:00",
    endTime: "11:30",
    description: "Deep dive into dynamic routing, layouts, and server-side rendering in Next.js 15+.",
    instructorId: "inst-1",
    instructorName: "Dr. Sarah Connor",
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "seed-2",
    title: "Live Q&A: Global State Management (Redux vs Context)",
    type: "class",
    courseId: "course-react-next",
    courseName: "Fullstack Web Development with Next.js",
    date: relativeDate(0), // Today
    startTime: "15:00",
    endTime: "16:00",
    description: "Interactive Q&A answering common pitfalls when selecting state management architectures.",
    instructorId: "inst-2",
    instructorName: "Prof. Alan Turing",
    link: "https://meet.google.com/xyz-mno-pqr",
  },
  {
    id: "seed-3",
    title: "Weekly Mini Quiz: NextJS App Router Basics",
    type: "quiz",
    courseId: "course-react-next",
    courseName: "Fullstack Web Development with Next.js",
    date: relativeDate(1), // Tomorrow
    startTime: "09:00",
    endTime: "10:00",
    description: "Test your understanding of next.js layout structures, server components vs client components.",
    instructorId: "inst-1",
    instructorName: "Dr. Sarah Connor",
    maxMarks: 20,
    link: "/student/quizzes",
  },
  {
    id: "seed-4",
    title: "Assignment 1: Portfolio Building using Tailwind CSS 4",
    type: "assignment",
    courseId: "course-react-next",
    courseName: "Fullstack Web Development with Next.js",
    date: relativeDate(3), // In 3 days
    startTime: "23:59",
    endTime: "23:59",
    description: "Build a highly responsive developer portfolio matching modern grid styles and HSL themes.",
    instructorId: "inst-2",
    instructorName: "Prof. Alan Turing",
    maxMarks: 100,
    link: "/student/my-courses",
  },
  {
    id: "seed-5",
    title: "Live Lecture: Database Schema Design & API Design Principles",
    type: "class",
    courseId: "course-node-express",
    courseName: "Backend Mastery with Node.js & Express",
    date: relativeDate(2), // In 2 days
    startTime: "11:00",
    endTime: "12:30",
    description: "Designing RESTful APIs and normalizing schemas in PostgreSQL.",
    instructorId: "inst-2",
    instructorName: "Prof. Alan Turing",
    link: "https://meet.google.com/uvw-xyz-abc",
  },
  {
    id: "seed-6",
    title: "Midterm Assessment Quiz: Node JS Modules",
    type: "quiz",
    courseId: "course-node-express",
    courseName: "Backend Mastery with Node.js & Express",
    date: relativeDate(4), // In 4 days
    startTime: "12:00",
    endTime: "13:30",
    description: "Midterm multiple-choice quiz covering Node.js event loop, streams, and file modules.",
    instructorId: "inst-2",
    instructorName: "Prof. Alan Turing",
    maxMarks: 50,
    link: "/student/quizzes",
  },
  {
    id: "seed-7",
    title: "Assignment 2: Secure JWT Login Flow Integration",
    type: "assignment",
    courseId: "course-node-express",
    courseName: "Backend Mastery with Node.js & Express",
    date: relativeDate(-1), // Yesterday
    startTime: "18:00",
    endTime: "18:00",
    description: "Implement refresh tokens and encryption logic on credentials in node.",
    instructorId: "inst-1",
    instructorName: "Dr. Sarah Connor",
    maxMarks: 100,
    link: "/student/my-courses",
  }
];

const initializeLocalStorage = () => {
  if (typeof window !== "undefined") {
    const existing = localStorage.getItem("calendar_events");
    if (!existing) {
      localStorage.setItem("calendar_events", JSON.stringify(seedEvents));
    }
  }
};

/**
 * Get all calendar events
 */
export const getCalendarEvents = async () => {
  try {
    const response = await api.get("/schedules");
    return response.data.data ?? response.data;
  } catch (error) {
    initializeLocalStorage();
    const local = localStorage.getItem("calendar_events");
    return local ? JSON.parse(local) : [];
  }
};

/**
 * Create a calendar event
 */
export const createCalendarEvent = async (eventData) => {
  try {
    const response = await api.post("/schedules", eventData);
    return response.data.data ?? response.data;
  } catch (error) {
    initializeLocalStorage();
    const local = localStorage.getItem("calendar_events");
    const events = local ? JSON.parse(local) : [];
    const newEvent = {
      id: "event-" + Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...eventData,
    };
    events.push(newEvent);
    localStorage.setItem("calendar_events", JSON.stringify(events));
    return newEvent;
  }
};

/**
 * Delete a calendar event
 */
export const deleteCalendarEvent = async (eventId) => {
  try {
    await api.delete(`/schedules/${eventId}`);
  } catch (error) {
    initializeLocalStorage();
    const local = localStorage.getItem("calendar_events");
    if (local) {
      const events = JSON.parse(local);
      const filtered = events.filter((e) => e.id !== eventId);
      localStorage.setItem("calendar_events", JSON.stringify(filtered));
    }
  }
};
