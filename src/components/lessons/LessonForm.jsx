"use client";

export default function LessonForm({
  formData,
  setFormData,
  onSubmit,
  buttonText,
  title,
}) {
  return (
    <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-xl">
      <h1 className="text-3xl text-white mb-6">
        {title}
      </h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Lesson Title"
          value={formData.title}
          onChange={(e) =>
            setFormData({
              ...formData,
              title: e.target.value,
            })
          }
          className="
            w-full
            p-3
            rounded
            bg-slate-800
            text-white
          "
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description:
                e.target.value,
            })
          }
          className="
            w-full
            p-3
            rounded
            bg-slate-800
            text-white
          "
        />

        <input
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({
              ...formData,
              order: Number(
                e.target.value
              ),
            })
          }
          className="
            w-full
            p-3
            rounded
            bg-slate-800
            text-white
          "
        />

        <button
          type="submit"
          className="
            bg-orange-600
            hover:bg-orange-700
            px-6
            py-3
            rounded
            text-white
          "
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}