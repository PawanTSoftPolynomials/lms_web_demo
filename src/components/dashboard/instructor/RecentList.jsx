export default function RecentList({ items, field }) {
  return (
    <div className="space-y-3">
      {items.slice(0, 4).map((item) => (
        <div key={item.id} className="border-b border-slate-800 pb-3">
          <p className="text-white">{item[field]}</p>
        </div>
      ))}
    </div>
  );
}
