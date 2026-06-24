"use client";

export default function ContentForm({
  title,
  buttonText,
  formData,
  setFormData,
  onSubmit,
  loading = false,
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          {title}
        </h1>

        <form
          onSubmit={onSubmit}
          className="space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-2">
              Content Title
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="Enter content title"
              className="
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-3
                text-white
                focus:outline-none
                focus:border-orange-500
              "
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-slate-400 mb-2">
              Content Type
            </label>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
              className="
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-3
                text-white
                focus:outline-none
                focus:border-orange-500
              "
            >
              <option value="VIDEO">
                Video
              </option>

              <option value="DOCUMENT">
                Document
              </option>

              <option value="TEXT">
                Text
              </option>

              <option value="LINK">
                Link
              </option>

              <option value="PRESENTATION">
                Presentation
              </option>
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-slate-400 mb-2">
              Content URL
            </label>

            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  url: e.target.value,
                })
              }
              placeholder="https://..."
              className="
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-3
                text-white
                focus:outline-none
                focus:border-orange-500
              "
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 mb-2">
              Description
            </label>

            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Content description"
              className="
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-3
                text-white
                focus:outline-none
                focus:border-orange-500
              "
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-slate-400 mb-2">
              Order
            </label>

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
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-3
                text-white
                focus:outline-none
                focus:border-orange-500
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              bg-orange-600
              hover:bg-orange-700
              px-6
              py-3
              rounded-xl
              text-white
              transition
              disabled:opacity-50
            "
          >
            {loading
              ? "Saving..."
              : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}