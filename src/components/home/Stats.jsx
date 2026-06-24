import { FaUsers, FaBook, FaAward, FaChalkboardTeacher } from "react-icons/fa";

import StatCard from "@/components/ui/StatCard";
export default function Stats() {
  return (
    <section className="py-20">
      <div className="grid md:grid-cols-3 gap-6">
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
</div>
    </section>
  );
}