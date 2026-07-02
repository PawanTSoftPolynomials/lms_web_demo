"use client";

import {useParams, useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import ModuleForm from "@/components/instructor/modules/ModuleForm";

import {useModule} from "@/hooks/queries/instructor/useModule";
import {useUpdateModule} from "@/hooks/queries/instructor/useUpdateModule";

export default function EditModulePage() {
    const {moduleId} = useParams();
    const router = useRouter();

    const {
        data: module, isLoading, isError,
    } = useModule(moduleId);

    const updateModuleMutation = useUpdateModule();

    const handleSubmit = async (values) => {
        try {
            await updateModuleMutation.mutateAsync({
                moduleId, moduleData: {
                    ...values, courseId: module.courseId, order: module.order,
                },
            });

            router.push(`/instructor/modules/${moduleId}`);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (<div className="flex justify-center py-20">
            <Loader/>
        </div>);
    }

    if (isError || !module) {
        return (<Card>
            <div className="py-16 text-center">
                <h2 className="text-2xl font-semibold">
                    Module Not Found
                </h2>

                <p className="mt-2 text-slate-400">
                    Unable to load module.
                </p>
            </div>
        </Card>);
    }

    return (<ModuleForm
        mode="edit"
        initialValues={module}
        loading={updateModuleMutation.isPending}
        onSubmit={handleSubmit}
    />);
}