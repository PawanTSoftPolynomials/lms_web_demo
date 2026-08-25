"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

export default function QuizTimer({
                                      duration = 15,
                                      onTimeUp,
                                  }) {
    const effectiveDuration = useMemo(() => {
        const num = Number(duration);
        return !isNaN(num) && num > 0 ? num : 15;
    }, [duration]);

    const [timeLeft, setTimeLeft] = useState(
        effectiveDuration * 60
    );

    useEffect(() => {
        setTimeLeft(effectiveDuration * 60);
    }, [effectiveDuration]);

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
        <div className="flex items-center gap-3">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isCritical
                        ? "bg-red-500/10"
                        : isWarning
                            ? "bg-amber-500/10"
                            : "bg-orange-500/10"
                }`}
            >
                <Clock
                    className={`h-5 w-5 ${
                        isCritical
                            ? "text-red-400"
                            : isWarning
                                ? "text-amber-400"
                                : "text-orange-500"
                    }`}
                />
            </div>

            <div>
                <p className="text-xs text-slate-400">
                    Time Remaining
                </p>

                <p
                    className={`text-2xl font-bold leading-tight tabular-nums ${
                        isCritical
                            ? "text-red-400"
                            : isWarning
                                ? "text-amber-400"
                                : "text-orange-400"
                    }`}
                >
                    {formattedTime}
                </p>
            </div>
        </div>
    );
}