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
];
