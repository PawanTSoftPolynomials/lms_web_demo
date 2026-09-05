import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Shared KPI tile markup, extracted from InstructorKPIs.tsx's inline version so the Batches stats row can reuse it exactly. */
export default function KpiTile({ label, value, icon: Icon, iconBg, iconColor, bottomText, href, trend }) {
  return (
    <div className="flex-1 min-w-[150px] flex items-center gap-3 rounded-2xl bg-card border border-border p-3 shadow-sm hover:border-transparent transition">
      <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>

      <div className="min-w-0">
        <p className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider truncate">{label}</p>
        <div className="flex items-end gap-1.5 mt-0.5">
          <p className="text-lg font-black text-foreground leading-none">{value}</p>

          {href ? (
            <Link href={href} className="text-[10.5px] text-primary font-bold hover:text-orange-300 truncate block">
              View &rarr;
            </Link>
          ) : (
            <p className="text-[10.5px] text-muted-foreground font-medium hidden xl:flex items-center">
              {trend === "up" && <ArrowUpRight size={10} className="text-emerald-400 mr-0.5" />}
              {bottomText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
