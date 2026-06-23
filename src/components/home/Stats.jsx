import { FaUsers, FaBook, FaAward, FaChalkboardTeacher } from "react-icons/fa";
import StatCard from "@/components/dashboard/StatCard";

export default function Stats() {
  return (
    <section className="py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Students"
          value="1200+"
          icon={FaUsers}
        />

        <StatCard
          title="Courses"
          value="80+"
          icon={FaBook}
        />

        <StatCard
          title="Certificates"
          value="600+"
          icon={FaAward}
        />

        <StatCard
          title="Instructors"
          value="25+"
          icon={FaChalkboardTeacher}
        />
      </div>
    </section>
  );
}