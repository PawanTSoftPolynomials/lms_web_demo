export default function Card({
  children,
  className = "",
  padding = "p-6",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        border
        border-card-border
        bg-card
        backdrop-blur-md
        shadow-luxury-md
        ${padding}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}