"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { GradeDistribution } from "@/services/instructor/dashboardHome.service";

export function PerformancePieChart({ data, isLoading }: { data: GradeDistribution[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3.5 w-36 rounded bg-muted/50 animate-pulse" />
          <div className="h-2.5 w-16 rounded bg-muted/50 animate-pulse" />
        </div>

        <div className="h-2.5 w-48 rounded bg-muted/50 animate-pulse mb-4" />

        <div className="h-[170px] shrink-0 flex items-center justify-center">
          <div className="h-[140px] w-[140px] rounded-full bg-muted/50 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-muted/50 animate-pulse shrink-0" />
              <div className="space-y-1">
                <div className="h-2 w-14 rounded bg-muted/50 animate-pulse" />
                <div className="h-2.5 w-6 rounded bg-muted/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-foreground">Students Performance</h3>
        <button className="text-[11px] text-muted-foreground font-bold hover:text-foreground">
          Last 30 days
        </button>
      </div>
      
      <p className="text-[10px] text-muted-foreground mb-4">Overall grade distribution across active courses.</p>

      <div className="h-[170px] shrink-0 relative flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: 'var(--popover-foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {/* Center Text */}
        {data.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-foreground">{data.reduce((sum, item) => sum + item.value, 0)}</span>
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
