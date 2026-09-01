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
        <label className="text-xs font-bold text-foreground block">
          {label}
        </label>
      )}

      <input
        disabled={disabled}
        className={`
          w-full
          rounded-xl
          border
          border-border/90
          bg-background
          text-foreground
          placeholder:text-muted-foreground
          px-3.5
          py-2.5
          text-xs sm:text-sm
          shadow-2xs
          outline-none
          transition-all
          hover:border-border-strong
          focus:border-primary
          focus:ring-2
          focus:ring-primary/20
          disabled:pointer-events-none
          disabled:opacity-50
          ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
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