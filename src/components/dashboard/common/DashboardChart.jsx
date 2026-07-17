"use client";

import DashboardSection from "@/components/dashboard/common/DashboardSection";
import ChartTooltip from "@/components/dashboard/components/ChartTooltip";


export default function DashboardChart({
  title,
  subtitle,
  action,
  children,
  className = "",
  contentClassName = "h-[340px]",
}) {
  return (
    <DashboardSection
      title={title}
      subtitle={subtitle}
      action={action}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </DashboardSection>
  );
}