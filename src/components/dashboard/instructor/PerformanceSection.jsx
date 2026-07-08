import DashboardChart from "@/components/dashboard/common/DashboardChart";

import PerformanceMetrics from "./PerformanceMetrics";
import PerformanceChart from "./PerformanceChart";

export default function PerformanceSection({
  data,
  students,
  courses,
  quizzes,
  completion,
}) {
  return (
    <DashboardChart
      title="Performance Analytics"
      subtitle="Monitor student and quiz performance"
    >
      

      <PerformanceChart data={data} />
    </DashboardChart>
  );
}