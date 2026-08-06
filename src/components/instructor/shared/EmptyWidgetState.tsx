import { Inbox, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyWidgetStateProps {
  message: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyWidgetState({
  message,
  icon: Icon = Inbox,
  actionLabel,
  actionHref,
}: EmptyWidgetStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-card-border dark:border-white/[0.1] py-8 px-4 text-center">
      <Icon className="size-6 text-muted-foreground/60" />
      <p className="text-xs font-semibold text-muted-foreground max-w-[220px]">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-xs font-bold text-primary hover:underline underline-offset-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
