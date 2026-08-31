'use client';

import { Badge } from '@/components/ui/shadcn/badge';

const STATUS_VARIANT = {
  Excellent: 'success',
  Good: 'info',
  'Needs Review': 'warning',
  Critical: 'destructive',
};

const DOT_CLASS = {
  Excellent: 'bg-success',
  Good: 'bg-info',
  'Needs Review': 'bg-warning',
  Critical: 'bg-destructive',
};

export default function HealthBadge({ status }) {
  const variant = STATUS_VARIANT[status] || STATUS_VARIANT.Good;
  const dot = DOT_CLASS[status] || DOT_CLASS.Good;

  return (
    <Badge variant={variant} className="normal-case tracking-normal font-semibold py-1">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {status}
    </Badge>
  );
}
