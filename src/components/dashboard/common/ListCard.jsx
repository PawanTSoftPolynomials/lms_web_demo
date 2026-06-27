"use client";

import DashboardSection from "@/components/dashboard/common/DashboardSection";
import EmptyState from "@/components/ui/EmptyState";

export default function ListCard({
  title,
  subtitle,
  action,
  items = [],
  emptyMessage = "No data available.",
  children,
}) {
  return (
    <DashboardSection
      title={title}
      subtitle={subtitle}
      action={action}
    >
      {items.length === 0 ? (
        <EmptyState
          title={emptyMessage}
        />
      ) : (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </DashboardSection>
  );
}