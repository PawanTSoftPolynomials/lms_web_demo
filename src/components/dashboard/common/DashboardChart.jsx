"use client";

import DashboardSection from "@/components/dashboard/common/DashboardSection";


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