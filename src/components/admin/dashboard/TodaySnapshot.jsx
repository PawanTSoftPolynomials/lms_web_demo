"use client";

/**
 * What moved on the platform today.
 *
 * These four numbers are read-only indicators, so they are plain figures on the
 * card rather than four bordered, tinted boxes — a border reads as a button,
 * and nothing here is clickable.
 */
export function TodaySnapshot({ snapshot, isLoading }) {
  if (isLoading) {
    return <div className="h-full min-h-[13rem] animate-pulse rounded-2xl bg-muted" />;
  }

  const {
    newUsersToday = 0,
    newEnrollmentsToday = 0,
    coursesPublishedToday = 0,
    certificatesIssuedToday = 0,
  } = snapshot ?? {};

  const items = [
    { label: "New users", value: newUsersToday },
    { label: "New enrollments", value: newEnrollmentsToday },
    { label: "Courses published", value: coursesPublishedToday },
    { label: "Certificates issued", value: certificatesIssuedToday },
  ];

  const quiet = items.every((i) => i.value === 0);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Today</h2>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      {quiet ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing has happened yet today.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <dd className="text-xl font-semibold leading-none tracking-tight text-foreground">
                {item.value}
              </dd>
              <dt className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{item.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
