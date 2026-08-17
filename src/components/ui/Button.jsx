const VARIANT_CLASSES = {
  primary: "bg-orange-600 hover:bg-orange-700 text-white",
  secondary:
    "bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600",
  danger: "bg-red-600 hover:bg-red-700 text-white",
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