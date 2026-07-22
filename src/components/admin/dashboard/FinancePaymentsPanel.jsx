"use client";

import { CreditCard, ArrowRight, ChevronRight } from "lucide-react";

export default function FinancePaymentsPanel({ financeData, onOpenAction }) {
  const {
    failedTransactions = 0,
    pendingRefunds = 0,
    revenueToday = "$0.00",
    recentTransactions = []
  } = financeData || {};

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Finance & Payments</h3>
            <p className="text-[11px] text-slate-400">Failed transactions, pending refunds & invoices</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "all_payments", title: "Enterprise Payment Gateway & Billing Console" })}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
        >
          Finance Console <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stats row - Actionable */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Failed Payments</p>
          <p className="text-base font-extrabold text-rose-400">{failedTransactions}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Refund Queue</p>
          <p className="text-base font-extrabold text-amber-400">{pendingRefunds}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Revenue Today</p>
          <p className="text-base font-extrabold text-emerald-400">{revenueToday}</p>
        </div>
      </div>

      {/* Transactions Queue */}
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {recentTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-700"
          >
            <div>
              <span className={`text-[10px] font-bold uppercase ${tx.status.includes("Declined") ? "text-rose-400" : "text-emerald-400"}`}>
                {tx.status}
              </span>
              <h4 className="text-xs font-bold text-white mt-0.5">{tx.user} ({tx.amount})</h4>
              <p className="text-[11px] text-slate-400">{tx.method} • {tx.type}</p>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => onOpenAction({ type: "view_payment_detail", title: `Transaction Detail #${tx.id}`, data: tx })}
                className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <span>{tx.status.includes("Declined") ? "Review Failed Payment" : "Review Transaction"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
