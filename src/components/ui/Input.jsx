export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full
          rounded-lg
          border
          border-slate-700
          bg-slate-800
          px-4
          py-3
          outline-none
          focus:border-orange-500
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}