const VARIANT_CLASSES = {
  primary: "bg-primary hover:brightness-110 text-primary-foreground",
  secondary:
    "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  danger: "bg-destructive hover:brightness-110 text-destructive-foreground",
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