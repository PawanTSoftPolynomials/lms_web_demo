'use client';

import { ChevronDown } from 'lucide-react';

export default function ChartCard({
  title,
  subtitle,
  action,
  filter,
  children,
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-background/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-transparent/60">
      {/* Header */}

      <div className="flex items-start justify-between border-b border-border px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {filter && (
            <button className="flex items-center gap-2 rounded-lg border border-transparent bg-muted px-3 py-2 text-sm text-foreground transition hover:border-primary">
              <span>{filter}</span>

              <ChevronDown size={16} />
            </button>
          )}

          {action && (
            <button className="text-sm font-medium text-primary transition hover:text-orange-300">
              {action}
            </button>
          )}
        </div>
      </div>

      {/* Content */}

      <div className="p-6">{children}</div>
    </div>
  );
}
