export default function Button({
  children,
  className = "",
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`
        px-4
        py-2
        rounded-lg
        font-medium
        transition
        bg-orange-600
        hover:bg-orange-700
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}