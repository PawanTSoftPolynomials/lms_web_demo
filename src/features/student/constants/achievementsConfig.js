export const getAchievementsList = (stats = {}) => [
  {
    name: "Quiz Master",
    icon: "🏆",
    description: "Scored 90%+ average in quizzes",
    active: (stats.avgQuizScore ?? 0) >= 90,
    bg: "bg-amber-500/10",
    color: "text-amber-400",
    border: "border-amber-500/25",
  },
  {
    name: "Consistency Star",
    icon: "⭐",
    description: `${stats.streak ?? 0} day learning streak`,
    active: (stats.streak ?? 0) >= 3,
    bg: "bg-purple-500/10",
    color: "text-purple-400",
    border: "border-purple-500/25",
  },
  {
    name: "Top Learner",
    icon: "🧠",
    description: "Completed 5+ lessons",
    active: (stats.completedLessons ?? 0) >= 5,
    bg: "bg-emerald-500/10",
    color: "text-emerald-400",
    border: "border-emerald-500/25",
  },
];
