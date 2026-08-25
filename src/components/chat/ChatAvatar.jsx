"use client";

const AVATAR_PALETTES = [
  "from-orange-500 to-amber-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-teal-500 to-emerald-600",
];

const getAvatarPalette = (seed) => {
  if (!seed) return AVATAR_PALETTES[0];
  let hash = 0;
  const strSeed = String(seed);
  for (let i = 0; i < strSeed.length; i++) {
    hash = (hash << 5) - hash + strSeed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

export default function ChatAvatar({
  name = "User",
  image,
  size = "md",
  userId,
}) {
  const initials = (name || "User")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const dims = size === "sm" ? "h-8 w-8" : "h-12 w-12";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";
  const palette = getAvatarPalette(userId || name);

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
      ${palette}
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