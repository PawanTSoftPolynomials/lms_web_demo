export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-foreground">
          {label}
        </label>
      )}

      <input
        className={`
          glass-input
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
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}