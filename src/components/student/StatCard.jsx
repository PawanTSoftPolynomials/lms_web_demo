export default function StatCard({
  title,
  value,
  color,
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <p className="text-slate-400">
        {title}
      </p>

      <h2
        className={`text-4xl font-bold ${color}`}
      >
        {value}
      </h2>
    </div>
  );
}