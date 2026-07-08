"use client";

export default function ChatAvatar({
  name = "User",
  image,
  size = "md",
}) {
  const initials = (name || "User")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const dims = size === "sm" ? "h-8 w-8" : "h-12 w-12";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`
        ${dims}
        rounded-full
        object-cover
        `}
      />
    );
  }

  return (
    <div
      className={`
      flex
      ${dims}
      items-center
      justify-center
      rounded-full
      bg-gradient-to-br
      from-orange-500
      to-orange-600
      ${fontSize}
      font-bold
      text-white
      shadow-lg
      `}
    >
      {initials}
    </div>
  );
}