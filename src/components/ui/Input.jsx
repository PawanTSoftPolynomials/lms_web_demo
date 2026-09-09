export default function Input({
  label,
  error,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-sm text-foreground">
          {label}
        </label>
      )}

      <input
        disabled={disabled}
        className={`
          w-full
          rounded-lg
          border
          border-transparent
          bg-muted
          px-4
          py-3
          outline-none
          transition-all
          hover:border-border-strong
          focus:border-primary
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-2xs font-semibold text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}