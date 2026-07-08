import { getCourseById } from "@/services/course.service";

export default async function CoursePage({
  params,
}) {
  const { courseId } =
    await params;

  console.log(
    "Course ID:",
    courseId
  );

  const course =
    await getCourseById(
      courseId
    );
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Title */}
        <h1 className="text-4xl font-bold">
          {course.title}
        </h1>

        {/* Description */}
        <p className="text-slate-400 mt-4">
          {course.description}
        </p>

        {/* Badges */}
        <div className="flex gap-4 mt-6">
          <span className="bg-orange-500 px-3 py-1 rounded">
            {course.level}
          </span>

          <span className="bg-slate-800 px-3 py-1 rounded">
            {course.category}
          </span>
        </div>

        {/* ===== PUT STATISTICS HERE ===== */}
        <div className="grid md:grid-cols-4 gap-4 mt-10">

  <div className="bg-slate-900 p-4 rounded-xl">
    <h3 className="text-3xl font-bold">
      {course.modules.length}
    </h3>
    <p>Modules</p>
  </div>

  <div className="bg-slate-900 p-4 rounded-xl">
    <h3 className="text-3xl font-bold">
      {course.quizzes.length}
    </h3>
    <p>Quizzes</p>
  </div>

  <div className="bg-slate-900 p-4 rounded-xl">
    <h3 className="text-3xl font-bold">
      {
        course.modules.reduce(
          (acc, module) =>
            acc +
            module.lessons.length,
          0
        )
      }
    </h3>
    <p>Lessons</p>
  </div>

  <div className="bg-slate-900 p-4 rounded-xl">
    <h3 className="text-3xl font-bold">
      {course.creator.name}
    </h3>
    <p>Instructor</p>
  </div>

</div>

        {/* ===== PUT CURRICULUM HERE ===== */}
<div className="mt-12">
  <h2 className="text-2xl font-bold mb-6">
    Course Curriculum
  </h2>

  <div className="space-y-4">
    {course.modules.map(
      (module) => (
        <div
          key={module.id}
          className="bg-slate-900 p-5 rounded-xl"
        >
          <h3 className="font-semibold text-lg">
            {module.title}
          </h3>

          <p className="text-slate-400 text-sm mt-1">
            {module.description}
          </p>

          <div className="mt-4 space-y-2">
            {module.lessons.map(
              (lesson) => (
                <div
                  key={lesson.id}
                  className="bg-slate-800 p-3 rounded"
                >
                  {lesson.title}
                </div>
              )
            )}
          </div>
        </div>
      )
    )}
  </div>
</div>
        {/* ===== PUT QUIZZES HERE ===== */}
<div className="mt-12">
  <h2 className="text-2xl font-bold mb-6">
    Course Quizzes
  </h2>

  <div className="space-y-4">
    {course.quizzes.map(
      (quiz) => (
        <div
          key={quiz.id}
          className="bg-slate-900 p-5 rounded-xl"
        >
          <h3 className="font-semibold">
            {quiz.title}
          </h3>

          <p className="text-slate-400 mt-2">
            {quiz.description}
          </p>

          <div className="flex gap-4 mt-4 text-sm">
            <span>
              {quiz.questions.length}
              Questions
            </span>

            <span>
              Passing Score:
              {quiz.passingScore}
            </span>

            <span>
              {quiz.timeLimit}
              Minutes
            </span>
          </div>
        </div>
      )
    )}
  </div>
</div>
      </div>
    </div>
  );
}