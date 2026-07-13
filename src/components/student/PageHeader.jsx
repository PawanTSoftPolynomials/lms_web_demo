export default function PageHeader({
  title,
  description,
}) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white">
        {title}
      </h1>

      {description && (
        <p className="text-slate-400 mt-2">
          {description}
        </p>
      )}
    </div>
  );
}