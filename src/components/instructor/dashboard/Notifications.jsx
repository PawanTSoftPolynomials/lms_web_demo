'use client';

import { useNotifications } from '@/hooks/queries/instructor/useInstructorDashboard';
import { markNotificationAsRead } from '@/services/notification.service';
import { useQueryClient } from '@tanstack/react-query';
import ChartCard from '@/components/ui/ChartCard';
import { Bell, Check, Loader2, BellOff } from 'lucide-react';
import { useState } from 'react';

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();
  const [markingId, setMarkingId] = useState(null);

  const unreadList = notifications.filter(n => !n.isRead);

  const handleMarkRead = async (id) => {
    try {
      setMarkingId(id);
      await markNotificationAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setMarkingId(null);
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <ChartCard title="Notifications" subtitle="Unread alerts inbox">
        <div className="space-y-4 py-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex gap-2 items-center w-2/3">
                <div className="h-7 w-7 rounded bg-slate-800 shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-3.5 w-1/2 bg-slate-800 rounded" />
                  <div className="h-3 w-3/4 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-5 w-14 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard 
      title="Notifications" 
      subtitle="Critical unread alerts from your cohorts and system updates"
      action={unreadList.length > 0 ? `${unreadList.length} New` : null}
    >
      {unreadList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center select-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800/80 text-slate-500 border border-slate-700/60 mb-3">
            <BellOff size={18} />
          </div>
          <h4 className="font-bold text-white text-sm">Inbox is empty</h4>
          <p className="mt-1 text-xs text-slate-400">All notifications have been resolved.</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {unreadList.map((item) => (
            <div 
              key={item.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 transition hover:border-slate-700/60"
            >
              <div className="flex gap-2.5 items-start min-w-0">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0 mt-0.5">
                  <Bell size={13} className="animate-pulse" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h5 className="font-bold text-xs text-white leading-snug truncate">{item.title}</h5>
                  <p className="text-[11px] leading-relaxed text-slate-400 leading-normal">
                    {item.message}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleMarkRead(item.id)}
                disabled={markingId === item.id}
                className="flex items-center justify-center h-6 w-14 shrink-0 rounded-lg border border-slate-800 hover:border-emerald-500/40 bg-slate-900/50 hover:bg-emerald-500/10 text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer disabled:cursor-not-allowed"
              >
                {markingId === item.id ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Check size={10} />
                    Done
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}
