const VARIANT_CLASSES = {
  primary: "btn-rainbow [--btn-rainbow-fill:var(--primary)] text-primary-foreground",
  secondary:
    "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  danger: "btn-rainbow [--btn-rainbow-fill:var(--destructive)] text-destructive-foreground",
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
        min-h-[44px]
        px-4
        py-2
        rounded-lg
        font-medium
        transition
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