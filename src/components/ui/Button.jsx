// Glass Campus buttons: a translucent glass surface (bg-secondary/bg-primary
// at partial opacity) rather than a flat fill, using the glass-button
// utility for the hover-lift/press-down mechanics + transition timing.
const VARIANT_CLASSES = {
  primary:
    "btn-rainbow [--btn-rainbow-fill:var(--primary)] [--btn-rainbow-foreground:var(--primary-foreground)] text-primary-foreground",
  secondary:
    "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  danger:
    "btn-rainbow [--btn-rainbow-fill:var(--destructive)] [--btn-rainbow-foreground:var(--destructive-foreground)] text-destructive-foreground",
  success: "bg-success text-success-foreground hover:opacity-90",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-primary/10",
  outline:
    "bg-transparent border border-border text-foreground hover:border-primary/40 hover:bg-primary/5",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`
        glass-button
        min-h-[44px]
        px-4
        py-2
        rounded-[0.75rem]
        font-medium
        cursor-pointer
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}