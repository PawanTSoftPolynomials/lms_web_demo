'use client';

import KPICard from '../cards/KPICard';

export default function KPIGrid({ role, data }) {
  const kpis = data?.kpis ?? [];

  const gridColsClass = kpis.length === 3 ? "md:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <section className="mb-8">
      <div className={`grid gap-6 grid-cols-1 ${gridColsClass}`}>
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>
    </section>
  );
}
