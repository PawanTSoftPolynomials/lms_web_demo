import Link from "next/link";

export default function QuizCard({ quiz }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h2 className="text-xl font-bold">
        {quiz.title}
      </h2>

      <p className="text-gray-400 mt-2">
        Duration: {quiz.duration} mins
      </p>

      <p className="text-gray-400">
        Questions: {quiz.questions}
      </p>

      <Link
        href={`/student/attempt/${quiz.id}`}
        className="inline-block mt-4 bg-orange-500 px-4 py-2 rounded-lg"
      >
        Start Quiz
      </Link>
    </div>
  );
}