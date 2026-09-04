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
        "mb-4 sm:mb-8",
        "flex flex-col gap-3 sm:gap-5",
        "md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="select-none">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 sm:mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
