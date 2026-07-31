"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse rounded-lg bg-slate-800" />,
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "code-block"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "link",
  "code-block",
];

const RichTextEditor = forwardRef(({ value, onChange, placeholder }, ref) => {
  return (
    <div className="rich-text-editor">
      <style>{`
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #334155; /* slate-700 */
          background-color: #0f172a; /* slate-900 */
          color: white;
          font-family: inherit;
          font-size: 1rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #334155;
          background-color: #1e293b; /* slate-800 */
        }
        .rich-text-editor .ql-stroke {
          stroke: #94a3b8; /* slate-400 */
        }
        .rich-text-editor .ql-fill {
          fill: #94a3b8;
        }
        .rich-text-editor .ql-picker {
          color: #94a3b8;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor:focus {
           outline: none;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start typing..."}
      />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
