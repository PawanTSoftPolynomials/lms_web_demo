import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground border border-card-border rounded-2xl shadow-sm shadow-black/[0.03]",
        "dark:bg-gradient-to-b dark:from-[#12141c] dark:to-[#0a0b11] dark:border-white/[0.07]",
        "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_20px_50px_-20px_rgba(0,0,0,0.7)]",
        "transition-colors duration-300",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex items-center justify-between gap-3 border-b border-card-border dark:border-white/[0.07] px-4 sm:px-5 py-3.5 sm:py-4",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-[11px] sm:text-xs font-bold uppercase tracking-wider dark:tracking-[0.14em] text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center gap-2 shrink-0", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-4 sm:p-5", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-4 sm:px-5 py-3.5 sm:py-4 border-t border-card-border dark:border-white/[0.07]",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};
