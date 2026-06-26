"use client";

export default function AuthHeader({
  icon,
  title,
  description,
  badge,
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/20">
        {icon}
      </div>

      <h1 className="mt-6 text-3xl font-bold text-white">
        {title}
      </h1>

      {description && (
        <p className="mt-3 text-sm text-slate-400">
          {description}
        </p>
      )}

      {badge && (
        <div className="mx-auto mt-4 inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2">
          <span className="break-all text-sm font-medium text-orange-400">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
