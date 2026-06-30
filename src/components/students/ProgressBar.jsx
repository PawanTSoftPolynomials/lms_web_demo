export default function ProgressBar({
  value,
}) {
  return (
    <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
      <div
        className="bg-orange-500 h-3 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}