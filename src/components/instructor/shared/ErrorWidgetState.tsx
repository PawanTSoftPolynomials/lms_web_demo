import { AlertTriangle } from "lucide-react";

interface ErrorWidgetStateProps {
  message?: string;
}

export function ErrorWidgetState({
  message = "Something went wrong loading this data. Please try again shortly.",
}: ErrorWidgetStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 py-8 px-4 text-center">
      <AlertTriangle className="size-6 text-destructive/70" />
      <p className="text-xs font-semibold text-destructive/90 max-w-[220px]">{message}</p>
    </div>
  );
}
