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
        glass-primary
        ${padding}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}