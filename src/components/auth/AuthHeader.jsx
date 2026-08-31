"use client";

export default function AuthHeader({
  icon,
  title,
  description,
  badge,
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-orange-500/20">
        {icon}
      </div>

      <h1 className="mt-6 text-3xl font-bold text-foreground">
        {title}
      </h1>

      {description && (
        <p className="mt-3 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {badge && (
        <div className="mx-auto mt-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
          <span className="break-all text-sm font-medium text-primary">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
