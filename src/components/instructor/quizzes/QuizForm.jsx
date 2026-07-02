"use client";

import {useEffect, useState} from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
    title: "", description: "", timeLimit: 30, passingScore: 50,
};

export default function QuizForm({
                                     mode = "create", initialValues = null, loading = false, onSubmit,
                                 }) {
    const [formData, setFormData] = useState(INITIAL_FORM);

    useEffect(() => {
        if (initialValues) {
            setFormData({
                ...INITIAL_FORM,
                ...initialValues,
            });
        }
    }, [initialValues]);
    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev, [name]: name === "timeLimit" || name === "passingScore" ? Number(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    return (<Card className="mx-auto max-w-4xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold">
                {mode === "create" ? "Create Quiz" : "Edit Quiz"}
            </h1>

            <p className="mt-2 text-slate-400">
                {mode === "create" ? "Create a new quiz for your course." : "Update quiz information."}
            </p>
        </div>

        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <Input
                label="Quiz Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Java Basics Quiz"
                required
            />

            <div>
                <label className="mb-2 block text-sm font-medium text-white">
                    Description
                </label>

                <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the quiz..."
                    className="
                            w-full
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-900
                            px-4
                            py-3
                            text-white
                            outline-none
                            transition
                            focus:border-orange-500
                        "
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Input
                    label="Time Limit (Minutes)"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                />

                <Input
                    label="Passing Score (%)"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? mode === "create" ? "Creating..." : "Updating..." : mode === "create" ? "Create Quiz" : "Update Quiz"}
                </Button>
            </div>
        </form>
    </Card>);
}