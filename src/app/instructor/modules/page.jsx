"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import { getModules } from "@/services/module.service";

export default function ModulesPage() {
  const router = useRouter();

  const [modules, setModules] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadModules =
      async () => {
        try {
          const response =
            await getModules();

          setModules(response);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    loadModules();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">
        Modules
      </h1>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card
            key={module.id}
            className="
              cursor-pointer
              hover:border-orange-500
              transition
            "
            onClick={() =>
              router.push(
                `/instructor/modules/${module.id}`
              )
            }
          >
            <h2 className="text-xl font-semibold">
              {module.title}
            </h2>

            <p className="text-slate-400 mt-2">
              {module.description}
            </p>

            <p className="text-sm text-slate-500 mt-3">
              Order: {module.order}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}