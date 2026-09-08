"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function CourseStatusPieChart({ data = [], isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-foreground">Course Status</h3>
      </div>

      <p className="text-[10px] text-muted-foreground mb-4">Published vs. draft courses across the platform.</p>

      <div className="flex-1 min-h-[160px] relative flex items-center justify-center">
        {total === 0 ? (
          <p className="text-xs text-muted-foreground">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#080B11', borderColor: '#1A1F35', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-foreground">{total}</span>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <p className="text-[9px] text-muted-foreground font-bold line-clamp-1">{item.name}</p>
              <p className="text-xs font-black text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
