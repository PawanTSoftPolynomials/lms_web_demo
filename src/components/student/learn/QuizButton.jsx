import Link from "next/link";

export default function QuizButton({
  courseId,
}) {
  return (
    <Link
      href={`/student/quizzes/${courseId}`}
      className="
        inline-block
        bg-orange-600
        hover:bg-orange-700
        px-5
        py-3
        rounded-lg
        font-semibold
      "
    >
      Take Quiz
    </Link>
  );
}