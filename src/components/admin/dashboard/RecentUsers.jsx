"use client";

import { User } from "lucide-react";

export function RecentUsers({ users = [], isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl"></div>;
  }

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
        <h3 className="text-sm font-black text-slate-200">Recent Users</h3>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent users</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                {user.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
