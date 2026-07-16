'use client';

import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardHeader({ name }) {
  const queryClient = useQueryClient();
  
  // Detects if any dashboard or notification queries are currently refetching in the background
  const isFetchingDashboard = useIsFetching({ queryKey: ['instructorDashboard'] });
  const isFetchingNotifications = useIsFetching({ queryKey: ['notifications'] });
  const isFetching = isFetchingDashboard > 0 || isFetchingNotifications > 0;

  const [currentDate, setCurrentDate] = useState('');
  const [lastSynced, setLastSynced] = useState('');

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
    setLastSynced(new Date().toLocaleTimeString());
  }, []);

  const handleSyncAll = () => {
    queryClient.invalidateQueries({ queryKey: ['instructorDashboard'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  useEffect(() => {
    if (!isFetching && currentDate) {
      setLastSynced(new Date().toLocaleTimeString());
    }
  }, [isFetching, currentDate]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-5 shadow-sm">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentDate}</span>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Welcome back, {name || 'Instructor'}
        </h1>
        <p className="text-xs text-slate-400">
          Here is an overview of your active courses, student feedback, and teaching schedule.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2 text-xs font-bold shadow-sm">
        {isFetching ? (
          <span className="flex items-center gap-1.5 text-orange-400 select-none">
            <Loader2 size={13} className="animate-spin" />
            <span>Syncing...</span>
          </span>
        ) : (
          <span className="text-slate-400 select-none">
            Last Synced: <span className="text-slate-200">{lastSynced}</span>
          </span>
        )}
        <button
          onClick={handleSyncAll}
          disabled={isFetching}
          className="text-orange-400 hover:text-orange-300 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer border-l border-slate-800 pl-3 transition flex items-center gap-1.5 font-extrabold select-none"
        >
          <RefreshCw size={11} className={isFetching ? 'animate-spin' : ''} />
          Sync
        </button>
      </div>
    </div>
  );
}
