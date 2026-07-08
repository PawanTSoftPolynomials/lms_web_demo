"use client";

export default function InfoItem({
                                     icon,
                                     label,
                                     value,
                                 }) {
    return (
        <div
            className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                </p>

                <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-900 dark:text-white">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}