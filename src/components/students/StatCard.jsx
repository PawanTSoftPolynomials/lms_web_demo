export default function StatCard({
  title,
  value,
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <p className="text-gray-400">{title}</p>

      <h2 className="text-3xl font-bold text-orange-500 mt-2">
        {value}
      </h2>
    </div>
  );
}