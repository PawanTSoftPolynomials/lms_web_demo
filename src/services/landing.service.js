import api from "@/lib/axios";

/**
 * Get Landing Page Data (Public stats and recently published courses)
 */
export const getLandingData = async () => {
  try {
    const { data } = await api.get("/public/landing-data");
    return data.data;
  } catch (error) {
    console.error("Error fetching landing data, using mock fallback:", error);
    return {
      stats: {
        students: 1200,
        courses: 80,
        certificates: 600
      },
      courses: [
        {
          id: "course-react-next",
          title: "Fullstack Web Development with Next.js",
          description: "Learn Next.js 15, App Router, React 19, Tailwind CSS, and more.",
          thumbnailUrl: null,
          instructorName: "Super Admin",
          rating: "4.8",
          reviewsCount: 120,
          lessonsCount: 24,
          level: "Intermediate",
          category: "Web Development"
        },
        {
          id: "course-node-express",
          title: "Backend Mastery with Node.js & Express",
          description: "Build secure APIs, work with database schemas, and deploy.",
          thumbnailUrl: null,
          instructorName: "Super Admin",
          rating: "4.7",
          reviewsCount: 98,
          lessonsCount: 18,
          level: "Advanced",
          category: "Backend"
        }
      ]
    };
  }
};
