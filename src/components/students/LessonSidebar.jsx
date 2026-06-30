export default function LessonSidebar({
  lessons,
  selectedLesson,
  setSelectedLesson,
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">
        Lessons
      </h2>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() =>
              setSelectedLesson(lesson)
            }
            className={`w-full text-left p-3 rounded-lg ${
              selectedLesson.id === lesson.id
                ? "bg-orange-500"
                : "bg-slate-800"
            }`}
          >
            <p className="font-medium">
              {lesson.title}
            </p>

            <p className="text-sm text-gray-300">
              {lesson.duration}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}