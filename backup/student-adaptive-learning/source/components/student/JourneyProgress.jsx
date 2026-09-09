"use client";

/**
 * Compact stage indicator for the adaptive learning journey — NOT a large
 * stepper. Three states per stage: done (filled, muted), active (filled,
 * accent + bold label), upcoming (hollow, dim). Purely presentational; the
 * caller decides which stages apply to this cycle (e.g. a student who goes
 * straight to independent practice never sees "Understand"/"Check").
 *
 * @param {Array<{ key: string, label: string }>} stages
 * @param {string} activeKey
 * @param {string[]} doneKeys
 */
export default function JourneyProgress({ stages, activeKey, doneKeys = [] }) {
  if (!stages || stages.length < 2) return null;

  return (
    <ol className="flex items-center gap-2.5 flex-wrap" aria-label="Your learning journey">
      {stages.map((stage, index) => {
        const isActive = stage.key === activeKey;
        const isDone = doneKeys.includes(stage.key);

        return (
          <li key={stage.key} className="flex items-center gap-2.5">
            {index > 0 && <span className="h-px w-3 bg-muted" aria-hidden="true" />}
            <span
              className="flex items-center gap-1.5"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                  isActive
                    ? "bg-primary"
                    : isDone
                      ? "bg-slate-500"
                      : "bg-slate-700"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-200 ${
                  isActive ? "text-primary" : isDone ? "text-muted-foreground" : "text-slate-600"
                }`}
              >
                {stage.label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
