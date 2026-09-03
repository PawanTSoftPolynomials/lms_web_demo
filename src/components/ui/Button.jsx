import { Slot } from "@radix-ui/react-slot";

const VARIANT_CLASSES = {
  primary: "btn-rainbow [--btn-rainbow-fill:var(--primary)] text-primary-foreground",
  secondary:
    "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  danger: "btn-rainbow [--btn-rainbow-fill:var(--destructive)] text-destructive-foreground",
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
  asChild = false,
  ...props
}) {
  // Landing-page callers (Hero, FinalCta) render this as their child element
  // (e.g. a Link) instead of a native <button> — Radix Slot merges this
  // component's classes/props onto that child rather than wrapping it.
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
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
    </Comp>
  );
}
