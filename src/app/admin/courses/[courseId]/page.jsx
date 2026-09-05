"use client";

import {useMemo, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import CourseOverview from "@/components/course-details/CourseOverview";
import CourseHero from "@/components/course-details/CourseHero";
import CourseStats from "@/components/course-details/CourseStats";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import CurriculumModule from "@/components/courses/CurriculumModule";
import {
    getCourseById, updateCourse, deleteCourse,
} from "@/services/course.service";
import Modal from "@/components/ui/Modal";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import ModuleForm from "@/components/modules/ModuleForm";
import {
    useUpdateCourseStatus,
} from "@/hooks/queries/admin/useCourses";
import {
    createModule, updateModule, deleteModule,
} from "@/services/module.service";

export default function AdminCoursePage() {
    const {courseId} = useParams();
    const router = useRouter();
    const updateStatusMutation = useUpdateCourseStatus();
    const confirm = useConfirm();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [course, setCourse] = useState(null);
    const [moduleModalOpen, setModuleModalOpen] = useState(false);

    const [moduleLoading, setModuleLoading] = useState(false);

    const [editingModule, setEditingModule] = useState(null);

    const [formData, setFormData] = useState({
        title: "", description: "", category: "", level: "",
    });

    const loadCourse = async () => {
        try {
            setLoading(true);

            const data = await getCourseById(courseId);
            console.log("Course data:", data);

            setCourse(data);

            setFormData({
                title: data.title || "",
                description: data.description || "",
                category: data.category || "",
                level: data.level || "",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleCreateModule = async (moduleData) => {
        try {
            setModuleLoading(true);

            if (editingModule) {
                await updateModule(editingModule.id, moduleData);

                showToast("Module updated successfully.", "success");
            } else {
                await createModule({
                    ...moduleData, courseId,
                });

                showToast("Module created successfully.", "success");
            }

            setEditingModule(null);
            setModuleModalOpen(false);

            await loadCourse();
        } catch (error) {
            console.error(error);

            showToast("Failed to save modules.", "error");
        } finally {
            setModuleLoading(false);
        }
    };
    const handleEditModule = (module) => {
        setEditingModule(module);
        setModuleModalOpen(true);
    };
    const handleDeleteModule = async (moduleId) => {
        const confirmed = await confirm({
            title: "Delete Module",
            message: "Delete this modules?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });

        if (!confirmed) return;

        try {
            await deleteModule(moduleId);

            await loadCourse();

            showToast("Module deleted successfully.", "success");
        } catch (error) {
            console.error(error);

            showToast("Failed to delete modules.", "error");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            await updateCourse(courseId, formData);

            await loadCourse();

            showToast("Course updated successfully.", "success");
        } catch (error) {
            console.error(error);

            showToast("Failed to update course.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = async (status) => {
        try {
            await updateStatusMutation.mutateAsync({
                courseId, status,
            });

            await loadCourse();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: "Delete Course",
            message: "Delete this course?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });

        if (!confirmed) return;

        try {
            await deleteCourse(courseId);

            router.push("/admin/courses");
        } catch (error) {
            console.error(error);
        }
    };

    const lessonCount = useMemo(() => {
        return (course?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0,) || 0);
    }, [course]);

    if (loading) {
        return (<div className="flex justify-center py-20">
                <Loader/>
            </div>);
    }

    return (<div className="space-y-6">
            <CourseHero
                course={course}
                onBack={() => router.push("/admin/courses")}
                onPublish={() => handleStatus("PUBLISHED")}
                onArchive={() => handleStatus("ARCHIVED")}
            />

            <CourseStats
                modules={course.modules?.length || 0}
                lessons={lessonCount}
                quizzes={course.quizzes?.length || 0}
                status={course.status}
            />
            <div className="space-y-8">
                <CourseOverview course={course}/>

                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold">Course Curriculum</h2>

                            <p className="mt-2 text-muted-foreground">
                                Manage modules, lessons and course contents.
                            </p>
                        </div>

                        <Button
                            onClick={() => {
                                setEditingModule(null);
                                setModuleModalOpen(true);
                            }}
                        >
                            + Add Module
                        </Button>
                    </div>

                    {course.modules?.length ? (<div className="space-y-5">
                            {course.modules.map((module, index) => (<CurriculumModule
                                    key={module.id}
                                    module={module}
                                    index={index}
                                    onEdit={handleEditModule}
                                    onDelete={handleDeleteModule}
                                />))}
                        </div>) : (<Card tone="flat">
                            <div className="py-12 text-center">
                                <h2 className="text-lg font-semibold">No Modules Yet</h2>

                                <p className="mt-3 text-muted-foreground">
                                    Start building your course.
                                </p>

                                <Button
                                    className="mt-6"
                                    onClick={() => {
                                        setEditingModule(null);
                                        setModuleModalOpen(true);
                                    }}
                                >
                                    Create First Module
                                </Button>
                            </div>
                        </Card>)}
                </div>

                <Card tone="flat">
                    <h2 className="mb-6 text-lg font-semibold">Course Settings</h2>

                    <div className="space-y-5">
                        <Input
                            label="Course Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />

                        <div>
                            <label className="mb-3 block text-sm text-foreground">
                                Description
                            </label>

                            <textarea
                                rows={6}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="
            w-full
            rounded-xl
            border
            border-transparent
            bg-muted
            px-4
            py-3
            outline-none
            focus:border-primary
          "
                            />
                        </div>

                        <Input
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        />

                        <Input
                            label="Level"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                        />
                    </div>
                </Card>

                <Card className="border border-destructive/20 bg-destructive/10">
                    <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>

                    <p className="mt-3 text-muted-foreground">
                        Deleting this course is permanent. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button loading={saving} onClick={handleSave}>
                            Save Changes
                        </Button>

                        <Button variant="success" onClick={() => handleStatus("PUBLISHED")}>
                            Publish
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => handleStatus("ARCHIVED")}
                        >
                            Archive
                        </Button>

                        <Button variant="danger" onClick={handleDelete}>
                            Delete Course
                        </Button>
                    </div>
                </Card>
            </div>
            <Modal
                open={moduleModalOpen}
                onClose={() => {
                    setEditingModule(null);
                    setModuleModalOpen(false);
                }}
                title={editingModule ? "Edit Module" : "Create Module"}
            >
                <ModuleForm
                    initialData={editingModule}
                    loading={moduleLoading}
                    onSubmit={handleCreateModule}
                    onCancel={() => {
                        setEditingModule(null);
                        setModuleModalOpen(false);
                    }}
                />
            </Modal>
        </div>);
}
