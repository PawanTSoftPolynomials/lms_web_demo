"use client";

import Select from "@/components/ui/Select";

export default function CourseStatusSelector({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={[
        {
          label: "Draft",
          value: "DRAFT",
        },
        {
          label: "Published",
          value: "PUBLISHED",
        },
        {
          label: "Archived",
          value: "ARCHIVED",
        },
      ]}
    />
  );
}