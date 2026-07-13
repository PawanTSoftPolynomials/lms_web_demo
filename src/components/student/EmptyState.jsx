export default function EmptyState({
  message,
}) {
  return (
    <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      p-10
      text-center
      text-slate-400
    ">
      {message}
    </div>
  );
}