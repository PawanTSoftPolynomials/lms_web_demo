"use client";

export default function InfoItem({
                                     icon,
                                     label,
                                     value,
                                 }) {
    return (
        <div
            className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background p-4">
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-300/40 text-orange-600 dark:bg-primary/10 dark:text-primary">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-900 dark:text-foreground">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}