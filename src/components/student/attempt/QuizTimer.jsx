"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

export default function QuizTimer({
                                      duration = 0,
                                      onTimeUp,
                                  }) {
    const [timeLeft, setTimeLeft] = useState(
        duration * 60
    );

    useEffect(() => {
        setTimeLeft(duration * 60);
    }, [duration]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(2, "0")}`;
    }, [timeLeft]);

    const isWarning = timeLeft <= 300;
    const isCritical = timeLeft <= 60;

    return (
        <div
            className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${
                isCritical
                    ? "border-red-500/40 bg-red-500/10"
                    : isWarning
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-slate-800 bg-slate-900"
            }`}
        >
            <div className="flex items-center gap-3">
                <Clock
                    className={`h-6 w-6 ${
                        isCritical
                            ? "text-red-400"
                            : isWarning
                                ? "text-amber-400"
                                : "text-orange-500"
                    }`}
                />

                <div>
                    <p className="text-sm text-slate-400">
                        Time Remaining
                    </p>

                    <h3
                        className={`text-2xl font-bold ${
                            isCritical
                                ? "text-red-400"
                                : isWarning
                                    ? "text-amber-400"
                                    : "text-white"
                        }`}
                    >
                        {formattedTime}
                    </h3>
                </div>
            </div>

            <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isCritical
                        ? "bg-red-500/20 text-red-400"
                        : isWarning
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-orange-500/20 text-orange-400"
                }`}
            >
        {isCritical
            ? "Final Minute"
            : isWarning
                ? "Hurry Up"
                : "In Progress"}
      </span>
        </div>
    );
}