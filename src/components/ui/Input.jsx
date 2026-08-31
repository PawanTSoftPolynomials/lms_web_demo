export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-label text-foreground">
          {label}
        </label>
      )}

      <input
        className={`
          w-full
          rounded-lg
          border
          border-transparent
          bg-muted
          px-4
          py-3
          outline-none
          focus:border-primary
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