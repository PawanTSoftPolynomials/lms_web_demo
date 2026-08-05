import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Shared KPI tile markup, extracted from InstructorKPIs.tsx's inline version so the Batches stats row can reuse it exactly. */
export default function KpiTile({ label, value, icon: Icon, iconBg, iconColor, bottomText, href, trend }) {
  return (
    <div className="flex-1 min-w-[150px] flex items-center gap-3 rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-3 shadow-sm hover:border-slate-700 transition">
      <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>

      <div className="min-w-0">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">{label}</p>
        <div className="flex items-end gap-1.5 mt-0.5">
          <p className="text-lg font-black text-white leading-none">{value}</p>

          {href ? (
            <Link href={href} className="text-[9px] text-orange-400 font-bold hover:text-orange-300 truncate hidden xl:block">
              View &rarr;
            </Link>
          ) : (
            <p className="text-[9px] text-slate-500 font-medium hidden xl:flex items-center">
              {trend === "up" && <ArrowUpRight size={10} className="text-emerald-400 mr-0.5" />}
              {bottomText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
