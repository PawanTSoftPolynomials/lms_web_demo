"use client";

import {useParams, useRouter} from "next/navigation";

import ModuleForm from "@/components/instructor/modules/ModuleForm";

import {useCreateModule} from "@/hooks/queries/instructor/useCreateModule";
import {useModules} from "@/hooks/queries/instructor/useModules";

export default function CreateModulePage() {
    const {courseId} = useParams();
    const router = useRouter();

    const createModuleMutation = useCreateModule();

    const {data: modules = []} = useModules(courseId);

    const handleSubmit = async (values) => {
        const nextOrder =
            modules.length > 0
                ? Math.max(...modules.map((m) => m.order), 0) + 1
                : 1;

        try {
            await createModuleMutation.mutateAsync({
                ...values,
                courseId,
                order: nextOrder,
            });

            router.push(`/instructor/courses/${courseId}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModuleForm
            mode="create"
            loading={createModuleMutation.isPending}
            onSubmit={handleSubmit}
        />
    );
}