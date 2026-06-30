import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";
import {
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";

export default function PerformanceMetrics({
  students,
  courses,
  quizzes,
  completion,
}) {
  const metrics = [
    {
      title: "Students",
      value: students,
      subtitle: "Enrolled Students",
      icon: <HiOutlineUsers/>,
      color: "blue",
    },
    {
      title: "Courses",
      value: courses,
      subtitle: "Published Courses",
      icon: <HiOutlineBookOpen/>,
      color: "violet",
    },
    {
      title: "Quizzes",
      value: quizzes,
      subtitle: "Available Quizzes",
      icon: <HiOutlineAcademicCap/>,
      color: "emerald",
    },
    {
      title: "Completion",
      value: `${completion}%`,
      subtitle: "Average Progress",
      icon: <FaArrowTrendUp/>,
      color: "orange",
    },
  ];

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <DashboardStatCard
          key={metric.title}
          {...metric}
        />
      ))}
    </div>
  );
}