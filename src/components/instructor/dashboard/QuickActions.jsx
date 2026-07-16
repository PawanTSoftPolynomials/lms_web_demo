'use client';

import { PlusCircle, FileText, CheckSquare, Megaphone, Video, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'Create Course',
    href: '/instructor/courses/create',
    icon: PlusCircle,
    colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  },
  {
    title: 'Add Assignment',
    href: '/instructor/dashboard',
    icon: FileText,
    colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
  },
  {
    title: 'Create Quiz',
    href: '/instructor/quizzes',
    icon: CheckSquare,
    colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  {
    title: 'Send Announcement',
    href: '/instructor/dashboard',
    icon: Megaphone,
    colorClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
  },
  {
    title: 'Start Live Session',
    href: '/instructor/calendar',
    icon: Video,
    colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  },
  {
    title: 'View Reports',
    href: '/instructor/courses',
    icon: BarChart2,
    colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
  },
  {
    title: 'Customize Dashboard',
    href: '/instructor/profile',
    icon: Settings,
    colorClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20',
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 shadow-sm hover:border-slate-700/60 transition duration-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 shrink-0">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2 flex-1 lg:justify-end">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <Link
                key={idx}
                href={act.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all duration-200 cursor-pointer ${act.colorClass}`}
              >
                <Icon size={12} className="shrink-0" />
                <span>{act.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
