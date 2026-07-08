export default function Card({
  children,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-md
        shadow-lg
        p-6
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}