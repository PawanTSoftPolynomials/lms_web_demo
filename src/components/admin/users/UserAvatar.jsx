export default function UserAvatar({
                                       name,
                                       avatar,
                                       size = "md",
                                   }) {
    const initials = name
        ? name
            .trim()
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase()
        : "?";

    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
    };

    const sizeClass =
        sizes[size] || sizes.md;

    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                className={`${sizeClass} rounded-full object-cover border border-white/10`}


            />
        );
    }

    return (
        <div
            className={`
        ${sizeClass}
        rounded-full
        bg-orange-600
        flex
        items-center
        justify-center
        font-semibold
        text-white
        select-none
      `}
        >
            {initials}
        </div>
    );
}