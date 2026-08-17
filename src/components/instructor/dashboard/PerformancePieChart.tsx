"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { GradeDistribution } from "@/services/instructor/dashboardHome.service";

export function PerformancePieChart({ data, isLoading }: { data: GradeDistribution[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-slate-200">Students Performance</h3>
        <button className="text-[11px] text-slate-500 font-bold hover:text-slate-300">
          Last 30 days
        </button>
      </div>
      
      <p className="text-[10px] text-slate-500 mb-4">Overall grade distribution across active courses.</p>

      <div className="h-[170px] shrink-0 relative flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-slate-500">No data available</p>
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
                contentStyle={{ backgroundColor: '#080B11', borderColor: '#1A1F35', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {/* Center Text */}
        {data.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-white">{data.reduce((sum, item) => sum + item.value, 0)}</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <p className="text-[9px] text-slate-500 font-bold line-clamp-1">{item.name}</p>
              <p className="text-xs font-black text-slate-200">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
