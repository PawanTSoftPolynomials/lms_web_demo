import clsx from "clsx";

export default function PageHeader({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div
      className={clsx(
        "mb-8",
        "flex flex-col gap-5",
        "md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="select-none">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>
        )}
      </div>

      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
