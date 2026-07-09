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
        border-slate-800/80
        bg-slate-900/50
        backdrop-blur-md
        shadow-luxury-md
        p-6
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}