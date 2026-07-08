export default function ProgressBar({
                                        value = 0,
                                        size = "md",
                                        showLabel = false,
                                    }) {
    const progress = Math.min(
        Math.max(Number(value) || 0, 0),
        100
    );

    const heights = {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
    };

    return (
        <div className="space-y-2">
            {showLabel && (
                <div className="flex justify-between text-sm">
          <span className="text-slate-400">
            Progress
          </span>

                    <span className="font-medium text-orange-500">
            {progress}%
          </span>
                </div>
            )}

            <div
                className={`w-full rounded-full bg-slate-700 overflow-hidden ${heights[size]}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
            >
                <div
                    className={`
            h-full
            rounded-full
            bg-orange-500
            transition-all
            duration-500
            ease-out
          `}
                    style={{width: `${progress}%`}}
                />
            </div>
        </div>
    );
}