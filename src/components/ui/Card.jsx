const TONE_CLASSES = {
  __proto__: null,
  elevated: "border-card-border bg-card backdrop-blur-md shadow-luxury-md",
  flat: "border-border bg-card",
};

export default function Card({
  children,
  className = "",
  padding = "p-6",
  onClick,
  tone = "elevated",
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg
        border
        ${TONE_CLASSES[tone] || TONE_CLASSES.elevated}
        ${padding}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}