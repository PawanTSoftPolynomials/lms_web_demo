const VARIANT_CLASSES = {
  primary: "btn-rainbow [--btn-rainbow-fill:var(--color-orange-600)] hover:[--btn-rainbow-fill:var(--color-orange-700)] text-white",
  secondary:
    "bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600",
  danger: "btn-rainbow [--btn-rainbow-fill:var(--color-red-600)] hover:[--btn-rainbow-fill:var(--color-red-700)] text-white",
  ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
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