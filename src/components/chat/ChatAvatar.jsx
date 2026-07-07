"use client";

export default function ChatAvatar({
  name = "User",
  image,
}) {
  const initials = (name || "User")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="
        h-12
        w-12

        rounded-full

        object-cover
        "
      />
    );
  }

  return (
    <div
      className="
      flex

      h-12
      w-12

      items-center
      justify-center

      rounded-full

      bg-gradient-to-br
      from-orange-500
      to-orange-600

      text-sm
      font-bold

      text-white

      shadow-lg
      "
    >
      {initials}
    </div>
  );
}