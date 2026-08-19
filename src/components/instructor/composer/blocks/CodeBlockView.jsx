"use client";

export default function CodeBlockView({ block }) {
  if (!block.code) {
    return <p className="text-slate-600 text-sm">No code set</p>;
  }

  return (
    <pre className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 overflow-auto text-sm">
      {block.language && (
        <div className="text-xs text-slate-500 mb-2">{block.language}</div>
      )}
      <code>{block.code}</code>
    </pre>
  );
}
