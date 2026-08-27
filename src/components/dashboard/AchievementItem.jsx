"use client";

export default function AchievementItem({ achievement }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg border ${achievement.bg} ${achievement.border} shrink-0 flex items-center justify-center text-base`}>
        {achievement.icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-200">{achievement.name}</p>
        <p className="text-[10px] text-slate-500 line-clamp-1">{achievement.description}</p>
      </div>
    </div>
  );
}
