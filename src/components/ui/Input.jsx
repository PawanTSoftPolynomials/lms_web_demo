export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-muted-foreground">
          {label}
        </label>
      )}

      <input
        className={`
          glass-input
          w-full
          rounded-[0.625rem]
          px-4
          py-3
          text-foreground
          placeholder:text-muted-foreground
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