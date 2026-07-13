"use client";

import { Loader2, AlertCircle, Trophy, Star, Zap, BookOpen, Award } from "lucide-react";
import { useMyAchievements, useCheckAchievements } from "@/hooks/queries/student/useAchievements";

const typeColor = (type) => {
  switch (type) {
    case "QUIZ": return "from-purple-400 to-indigo-500";
    case "COURSE": return "from-amber-400 to-orange-500";
    case "STREAK": return "from-red-400 to-rose-500";
    case "NOTE": return "from-teal-400 to-cyan-500";
    default: return "from-slate-400 to-slate-600";
  }
};

const typeIcon = (type) => {
  switch (type) {
    case "QUIZ": return <Star size={20} className="text-white" />;
    case "COURSE": return <BookOpen size={20} className="text-white" />;
    case "STREAK": return <Zap size={20} className="text-white" />;
    case "NOTE": return <Award size={20} className="text-white" />;
    default: return <Trophy size={20} className="text-white" />;
  }
};

export default function AchievementsPage() {
  const { data, isLoading, isError } = useMyAchievements();
  const checkAchievements = useCheckAchievements();

  const achievements = data?.achievements || [];
  const totalXp = data?.totalXp || 0;
  const earnedCount = data?.earnedCount || 0;
  const totalCount = data?.totalCount || 0;

  const handleCheck = async () => {
    try {
      const result = await checkAchievements.mutateAsync();
      if (result?.length > 0) {
        alert(`🎉 You earned ${result.length} new achievement(s)!`);
      } else {
        alert("No new achievements unlocked yet. Keep learning!");
      }
    } catch {}
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Achievements</h1>
          <p className="text-xs text-slate-400 mt-1">Track your badges, XP, and milestones</p>
        </div>
        <button
          onClick={handleCheck}
          disabled={checkAchievements.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          {checkAchievements.isPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Check for New
        </button>
      </div>

      {/* XP Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md text-center">
          <p className="text-2xl font-black text-orange-500">{totalXp}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Total XP</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md text-center">
          <p className="text-2xl font-black text-emerald-450">{earnedCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Earned</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md text-center">
          <p className="text-2xl font-black text-slate-200">{totalCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Total Badges</p>
        </div>
      </div>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading achievements…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-red-500 gap-2 text-sm">
          <AlertCircle size={18} /> Failed to load achievements.
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <Trophy size={40} className="mx-auto mb-3 opacity-40 text-slate-450" />
          <p className="text-sm font-semibold text-white">No achievements yet</p>
          <p className="text-xs mt-1 text-slate-400">Complete courses, quizzes, and take notes to earn badges.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-slate-900/50 border backdrop-blur-md rounded-2xl p-5 shadow-luxury-md transition ${
                achievement.earned
                  ? "border-orange-500/25 hover:border-orange-500/40 hover:shadow-lg"
                  : "border-slate-800/80 opacity-55 grayscale"
              }`}
            >
              {/* Badge Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${typeColor(achievement.type)} flex items-center justify-center mb-4 shadow-sm`}>
                {typeIcon(achievement.type)}
              </div>

              <h3 className="text-sm font-black text-white mb-1">{achievement.name}</h3>
              {achievement.description && (
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{achievement.description}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                  +{achievement.xpReward} XP
                </span>
                {achievement.earned ? (
                  <span className="text-[9px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    ✓ Earned
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700/50 px-2.5 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </div>

              {achievement.earned && achievement.earnedAt && (
                <p className="text-[9px] text-slate-500 mt-2.5 font-semibold">
                  {new Date(achievement.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
