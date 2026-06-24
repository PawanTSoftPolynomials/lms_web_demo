"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  getModuleById,
  updateModule,
} from "@/services/module.service";

export default function EditModule() {
  const { moduleId } =
    useParams();

  const router =
    useRouter();

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [order, setOrder] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadModule =
      async () => {
        try {
          const data =
            await getModuleById(
              moduleId
            );

          setTitle(
            data.title
          );

          setDescription(
            data.description
          );

          setOrder(
            data.order
          );
        } catch (error) {
          console.error(
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    if (moduleId) {
      loadModule();
    }
  }, [moduleId]);

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        await updateModule(
          moduleId,
          {
            title,
            description,
            order:
              Number(
                order
              ),
          }
        );

        router.push(
          `/instructor/modules/${moduleId}`
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };

  if (loading) {
    return (
      <div className="text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 p-8 rounded-xl">
        <h1 className="text-3xl font-bold text-white mb-6">
          Edit Module
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          <div>
            <label className="text-slate-400">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="
                w-full
                mt-2
                p-3
                rounded-lg
                bg-slate-800
                text-white
              "
            />
          </div>

          <div>
            <label className="text-slate-400">
              Description
            </label>

            <textarea
              rows="4"
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="
                w-full
                mt-2
                p-3
                rounded-lg
                bg-slate-800
                text-white
              "
            />
          </div>

          <div>
            <label className="text-slate-400">
              Order
            </label>

            <input
              type="number"
              value={order}
              onChange={(e) =>
                setOrder(
                  e.target.value
                )
              }
              className="
                w-full
                mt-2
                p-3
                rounded-lg
                bg-slate-800
                text-white
              "
            />
          </div>

          <button
            type="submit"
            className="
              bg-orange-600
              hover:bg-orange-700
              px-6
              py-3
              rounded-lg
              text-white
            "
          >
            Update Module
          </button>
        </form>
      </div>
    </div>
  );
}