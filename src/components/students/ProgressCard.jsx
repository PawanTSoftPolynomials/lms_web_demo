import ProgressBar from "./ProgressBar";

export default function ProgressCard({
  course,
}) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h2 className="text-lg font-bold">
        {course.title}
      </h2>

      <p className="text-gray-400 mt-2">
        Instructor: {course.instructor}
      </p>

      <ProgressBar value={course.progress} />

      <p className="mt-2 text-orange-400 font-semibold">
        {course.progress}% Completed
      </p>
    </div>
  );
}