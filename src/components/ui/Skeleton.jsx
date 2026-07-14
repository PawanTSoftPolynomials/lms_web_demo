'use client';

// Helper for standard pulsing container
function Pulse({ className = '', children }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

// 1. KPI Card Skeleton
export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm min-h-[220px] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-2/3">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-10 w-28 rounded-xl" />
        </div>
        <Pulse className="h-12 w-12 rounded-xl" />
      </div>
      
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <Pulse className="h-6 w-full rounded-full" />
        <Pulse className="h-3.5 w-1/3" />
      </div>
    </div>
  );
}

// 2. Chart Card Skeleton
export function ChartCardSkeleton({ title = "Loading Chart", height = "h-96" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center border-b border-slate-800/80 px-6 py-5">
        <div className="space-y-2">
          <Pulse className="h-5 w-32" />
          <Pulse className="h-3.5 w-48" />
        </div>
        <Pulse className="h-8 w-20 rounded-lg" />
      </div>
      <div className="p-6">
        <div className={`${height} flex items-end justify-between gap-3 pt-6 border-b border-l border-slate-800`}>
          <Pulse className="h-[40%] w-full rounded-t-lg" />
          <Pulse className="h-[75%] w-full rounded-t-lg" />
          <Pulse className="h-[55%] w-full rounded-t-lg" />
          <Pulse className="h-[90%] w-full rounded-t-lg" />
          <Pulse className="h-[30%] w-full rounded-t-lg" />
          <Pulse className="h-[60%] w-full rounded-t-lg" />
          <Pulse className="h-[80%] w-full rounded-t-lg" />
        </div>
      </div>
    </div>
  );
}

// 3. Course Progress Grid Skeleton
export function CourseProgressSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm overflow-hidden space-y-4">
      <div className="flex justify-between items-center border-b border-slate-850 pb-4">
        <div className="space-y-2">
          <Pulse className="h-5 w-40" />
          <Pulse className="h-3.5 w-60" />
        </div>
        <Pulse className="h-8 w-24 rounded-lg" />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/20 p-5 space-y-4">
            <div className="flex justify-between">
              <Pulse className="h-5 w-36" />
              <Pulse className="h-4 w-16 rounded-full" />
            </div>
            <Pulse className="h-3 w-28" />
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Pulse className="h-3 w-24" />
                <Pulse className="h-3 w-8" />
              </div>
              <Pulse className="h-2 w-full rounded-full" />
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-800 pt-3">
              <Pulse className="h-3 w-16" />
              <Pulse className="h-4 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Action Card Skeleton
export function ActionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <Pulse className="h-10 w-10 rounded-xl" />
        <Pulse className="h-6 w-12 rounded-full" />
      </div>
      <Pulse className="h-5 w-2/3" />
      <Pulse className="h-12 w-full" />
      <Pulse className="h-4 w-24" />
    </div>
  );
}

// 5. List Row Skeleton
export function ListRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center gap-3 w-2/3">
        <Pulse className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-1.5 w-full">
          <Pulse className="h-4 w-1/2" />
          <Pulse className="h-3 w-1/3" />
        </div>
      </div>
      <Pulse className="h-5 w-16 rounded-full" />
    </div>
  );
}
