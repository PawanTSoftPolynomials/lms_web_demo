export default function ProgressBar({
  progress = 0,
}) {
  return (
    <div>
      <div className="flex justify-between text-sm text-zinc-400 mb-2">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>

      <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}