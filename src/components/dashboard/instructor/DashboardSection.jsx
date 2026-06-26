export default function DashboardSection({ title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-5">{title}</h2>

      {children}
    </div>
  );
}
