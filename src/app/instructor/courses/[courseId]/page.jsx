"use client";

import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import CourseHeader from "@/components/instructor/courses/CourseHeader";
import CourseStats from "@/components/instructor/courses/CourseStats";
import ModuleGrid from "@/components/instructor/courses/ModuleGrid";

import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useDeleteModule } from "@/hooks/queries/instructor/useDeleteModule";

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useInstructorCourse(courseId);

  const {
    data: modules = [],
    isLoading: modulesLoading,
    isError: modulesError,
  } = useModules(courseId);

  const deleteModuleMutation = useDeleteModule();

  const handleDelete = async (module) => {
    const confirmed = window.confirm(
        `Delete "${module.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteModuleMutation.mutateAsync(module.id);
    } catch (error) {
      console.error(error);
    }
  };

  if (courseLoading || modulesLoading) {
    return (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
    );
  }

  if (courseError || modulesError || !course) {
    return (
        <Card>
          <div className="py-16 text-center">
            <h2 className="text-2xl font-semibold">
              Failed to load course.
            </h2>

            <p className="mt-2 text-slate-400">
              Please try again later.
            </p>
          </div>
        </Card>
    );
  }

  return (
      <div className="space-y-8">
        <CourseHeader course={course} />

        <CourseStats
            modules={modules.length}
            lessons={0}
            quizzes={course.quizzes?.length ?? 0}
            students={0}
        />

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Modules
            </h2>

            <p className="mt-2 text-slate-400">
              Organize your course into modules and
              manage their content.
            </p>
          </div>

          <ModuleGrid
              courseId={courseId}
              modules={modules}
              onManage={(module) =>
                  router.push(
                      `/instructor/modules/${module.id}`
                  )
              }
              onLessons={(module) =>
                  router.push(
                      `/instructor/modules/${module.id}`
                  )
              }
              onQuizzes={() =>
                  router.push(
                      `/instructor/quizzes/${courseId}`
                  )
              }
              onEdit={(module) =>
                  router.push(
                      `/instructor/modules/edit/${module.id}`
                  )
              }
              onDelete={handleDelete}
          />
        </section>
      </div>
  );
}