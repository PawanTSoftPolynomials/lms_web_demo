import { Badge } from "@/components/ui/shadcn/badge";

// Only the 3 statuses that actually exist on the Course model (CourseStatus
// enum: DRAFT/PUBLISHED/ARCHIVED). No "Pending Review" — there's no
// submission-for-review workflow in this system, so that status can never
// occur; showing it as a real filter/badge option would be fabricated.
const STATUS_CONFIG = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PUBLISHED: { label: "Published", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "destructive" },
};

export default function CourseStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
