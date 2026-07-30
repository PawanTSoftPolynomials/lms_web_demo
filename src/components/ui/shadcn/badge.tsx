import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide w-fit whitespace-nowrap shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border-border",
        outline: "bg-transparent text-foreground border-border",
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning-foreground border-warning/30 text-amber-600 dark:text-amber-400",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
