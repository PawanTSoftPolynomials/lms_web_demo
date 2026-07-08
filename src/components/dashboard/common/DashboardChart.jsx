"use client";

import DashboardSection from "@/components/dashboard/common/DashboardSection";
import ChartTooltip from "@/components/dashboard/components/ChartTooltip";


export default function DashboardChart({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <DashboardSection
      title={title}
      subtitle={subtitle}
      action={action}
      className={className}
      contentClassName="h-[340px]"
    >
      {children}
    </DashboardSection>
  );
}