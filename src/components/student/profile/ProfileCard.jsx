export default function ProfileCard({
  student,
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div
          className="
            h-24 w-24 rounded-full
            bg-orange-500
            flex items-center justify-center
            text-3xl font-bold
          "
        >
          {student?.name?.charAt(0) || "S"}
        </div>

        <div className="space-y-3 flex-1">
          <h2 className="text-2xl font-bold">
            {student.name}
          </h2>

          <p className="text-gray-400">
            Email: {student.email}
          </p>

          <p className="text-gray-400">
            Phone: {student.phone}
          </p>

          <p className="text-gray-400">
            Education: {student.education}
          </p>

          <button className="mt-4 bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}