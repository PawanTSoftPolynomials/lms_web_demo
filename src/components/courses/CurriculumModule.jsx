"use client";

import { useState } from "react";
import ActionMenu from "@/components/menus/ActionMenu";
import {
  FaChevronDown,
  FaChevronRight,
  FaBook,
  FaPlayCircle,
  FaFileAlt,
  FaLink,
} from "react-icons/fa";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const getContentIcon = (type) => {
  switch (type) {
    case "VIDEO":
      return (
        <FaPlayCircle className="text-red-400" />
      );

    case "DOCUMENT":
    case "TEXT":
    case "PRESENTATION":
      return (
        <FaFileAlt className="text-blue-400" />
      );

    case "LINK":
      return (
        <FaLink className="text-green-400" />
      );

    default:
      return (
        <FaBook className="text-orange-400" />
      );
  }
};

export default function CurriculumModule({
  module,
  index,
   onEdit,
  onDelete,
}) {
  const [open, setOpen] =
    useState(true);

  return (
    <Card
  className="
    border
    border-slate-800
    hover:border-orange-500/30
    transition-all
    duration-300
  "
>

    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <button
          onClick={() =>
            setOpen(!open)
          }
          className="
            flex
            items-center
            gap-3
            text-left
          "
        >

          {open ? (
            <FaChevronDown />
          ) : (
            <FaChevronRight />
          )}

         <div>

  <div className="flex items-center gap-3">

    <div className="
      flex
      h-12
      w-12
      items-center
      justify-center
      rounded-xl
      bg-orange-500/10
    ">

      <FaBook className="text-orange-400 text-lg"/>

    </div>

    <div>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
<div className="flex items-center gap-3">

  <span
    className="
      rounded-full
      bg-orange-500/10
      px-3
      py-1
      text-xs
      font-bold
      uppercase
      tracking-wider
      text-orange-400
    "
  >
    Module {index + 1}
  </span>

</div>

      </p>

      <h2 className="mt-1 text-3xl font-bold tracking-tight">

        {module.title}

      </h2>

    </div>

  </div>

  {module.description && (

    <p className="mt-4 text-slate-400 leading-7">

      {module.description}

    </p>

  )}

</div>

        </button>

  <div className="flex items-center gap-3">

  <div className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-400">

    {module.lessons?.length || 0} Lessons

  </div>

  <ActionMenu
    items={[
      {
        label: "Add Lesson",
        onClick: () => {
          // TODO
        },
      },
      {
        label: "Edit Module",
        onClick: () => onEdit(module),
      },
      {
        label: "Delete Module",
        onClick: () => onDelete(module.id),
      },
    ]}
  />

</div>
      </div>

      {open && (

       <div className="relative mt-8 ml-5 border-l border-slate-800 pl-8 space-y-6">

          {module.lessons?.length ? (

            module.lessons.map(
              (
                lesson,
                lessonIndex
              ) => (

    <div
  key={lesson.id}
  className="
    relative
    rounded-2xl
    border
    border-slate-700
    bg-slate-950/40
    p-7
    transition-all
    duration-300
    hover:border-orange-500/30
  "
>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div>

  <div className="flex items-center gap-3">

    <div className="
      flex
      h-10
      w-10
      items-center
      justify-center
      rounded-xl
      bg-blue-500/10
    ">

      <FaBook className="text-blue-400" />

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-blue-400">
        Lesson {lessonIndex + 1}
      </p>

      <h3 className="text-xl font-semibold">
        {lesson.title}
      </h3>

    </div>

  </div>

  {lesson.description && (

    <p className="mt-4 text-slate-400 leading-7">

      {lesson.description}

    </p>

  )}

</div>
<div className="flex items-center gap-3">

  <div className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">

    {lesson.contents?.length || 0} Contents

  </div>

  <ActionMenu
    items={[
      {
        label: "Add Content",
        onClick: () => {
          // TODO
        },
      },
      {
        label: "Edit Lesson",
        onClick: () => {
          // TODO
        },
      },
      {
        label: "Delete Lesson",
        onClick: () => {
          // TODO
        },
      },
    ]}
  />

</div>

                  </div>

              <div className="mt-6 rounded-xl bg-slate-950/40 p-4 space-y-3">
                                        {lesson.contents?.length ? (

                      lesson.contents.map(
                        (content) => (
<div
  key={content.id}
  className="
    flex
    items-center
    justify-between
    rounded-xl
    border
    border-slate-800
    bg-slate-900/70
    p-4
    transition-all
    duration-300
    hover:border-orange-500/30
    hover:bg-slate-900
  "
>

                          <div className="flex items-center gap-4">

                              {getContentIcon(
                                content.type
                              )}
<div>

  <h4 className="font-semibold text-white">

    {content.title}

  </h4>

  <span
    className="
      mt-2
      inline-flex
      rounded-full
      bg-slate-800
      px-3
      py-1
      text-xs
      font-medium
      text-slate-300
    "
  >
    {content.type}
  </span>

</div>

                            </div>

                           <div className="flex items-center gap-3">
<ActionMenu
  items={[
    {
      label: "Edit Content",
      onClick: () => {
        // TODO
      },
    },
    {
      label: "Delete Content",
      onClick: () => {
        // TODO
      },
    },
  ]}
/>

                            </div>

                          </div>

                        )
                      )

                    ) : (

                     <div
  className="
    rounded-xl
    border
    border-dashed
    border-slate-700
    bg-slate-950/40
    py-10
    text-center
  "
>

  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">

    <FaFileAlt className="text-slate-500" />

  </div>

  <h4 className="font-semibold">
    No Content Yet
  </h4>

  <p className="mt-2 text-sm text-slate-400">
    Add your first learning material.
  </p>

</div>

                    )}

                  </div>

                </div>

              )

            )

          ) : (

            <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">

              <h3 className="text-lg font-semibold">
                No Lessons Found
              </h3>

              <p className="mt-2 text-slate-400">
                Start by adding your first lesson.
              </p>

              <Button
                className="mt-5"
              >
                + Add Lesson
              </Button>

            </div>

          )}

        </div>

      )}

    </Card>

  );
}