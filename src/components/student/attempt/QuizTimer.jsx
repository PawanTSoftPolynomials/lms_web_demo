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
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <div
                className={`flex h-6 w-6 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${
                    isCritical
                        ? "bg-red-500/10"
                        : isWarning
                            ? "bg-amber-500/10"
                            : "bg-primary/10"
                }`}
            >
                <Clock
                    className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${
                        isCritical
                            ? "text-red-400"
                            : isWarning
                                ? "text-amber-400"
                                : "text-primary"
                    }`}
                />
            </div>

            <div className="min-w-0">
                <p className="hidden sm:block text-xs text-muted-foreground">
                    Time Remaining
                </p>

                <p
                    className={`text-xs sm:text-2xl font-bold leading-tight tabular-nums ${
                        isCritical
                            ? "text-red-400"
                            : isWarning
                                ? "text-amber-400"
                                : "text-primary"
                    }`}
                >
                    {formattedTime}
                </p>
            </div>
        </div>
    );
}