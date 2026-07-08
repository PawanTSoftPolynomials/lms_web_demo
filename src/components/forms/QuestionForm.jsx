"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
};

export default function QuestionForm({
                                       mode = "create",
                                       initialValues = null,
                                       loading = false,
                                       onSubmit,
                                     }) {
  const [formData, setFormData] =
      useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        question:
            initialValues.question ?? "",
        options:
            Array.isArray(
                initialValues.options
            ) &&
            initialValues.options.length
                ? initialValues.options
                : ["", "", "", ""],
        correctAnswer:
            initialValues.correctAnswer ??
            "",
        marks:
            initialValues.marks ?? 1,
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
          name === "marks"
              ? Number(value)
              : value,
    }));
  };

  const handleOptionChange = (
      index,
      value
  ) => {
    const updatedOptions = [
      ...formData.options,
    ];

    updatedOptions[index] = value;

    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit?.(formData);
  };

  return (
      <Card className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {mode === "create"
                ? "Create Question"
                : "Edit Question"}
          </h1>

          <p className="mt-2 text-slate-400">
            Add a multiple-choice
            question to this quiz.
          </p>
        </div>

        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >
          <Input
              label="Question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="What is JVM?"
              required
          />

          <div className="space-y-5">
            <h2 className="text-lg font-semibold">
              Answer Options
            </h2>

            {formData.options.map(
                (option, index) => (
                    <Input
                        key={index}
                        label={`Option ${
                            index + 1
                        }`}
                        value={option}
                        onChange={(e) =>
                            handleOptionChange(
                                index,
                                e.target.value
                            )
                        }
                        placeholder={`Enter option ${
                            index + 1
                        }`}
                        required
                    />
                )
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Correct Answer
              </label>

              <select
                  name="correctAnswer"
                  value={
                    formData.correctAnswer
                  }
                  onChange={
                    handleChange
                  }
                  required
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
              >
                <option value="">
                  Select Correct
                  Answer
                </option>

                {formData.options.map(
                    (
                        option,
                        index
                    ) => (
                        <option
                            key={
                              index
                            }
                            value={
                              option
                            }
                            disabled={
                              !option
                            }
                        >
                          Option{" "}
                          {index +
                              1}
                          {option
                              ? ` - ${option}`
                              : ""}
                        </option>
                    )
                )}
              </select>
            </div>

            <Input
                label="Marks"
                type="number"
                name="marks"
                min={1}
                value={formData.marks}
                onChange={
                  handleChange
                }
                required
            />
          </div>

          <div
              className="
            rounded-xl
            border
            border-orange-500/20
            bg-orange-500/5
            p-5
          "
          >
            <h3 className="font-semibold text-orange-400">
              Guidelines
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>
                Write one clear
                question.
              </li>

              <li>
                Provide four answer
                options.
              </li>

              <li>
                Select the correct
                answer before
                saving.
              </li>

              <li>
                Marks should be a
                positive number.
              </li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
                type="submit"
                disabled={loading}
            >
              {loading
                  ? mode ===
                  "create"
                      ? "Creating..."
                      : "Updating..."
                  : mode ===
                  "create"
                      ? "Create Question"
                      : "Update Question"}
            </Button>
          </div>
        </form>
      </Card>
  );
}