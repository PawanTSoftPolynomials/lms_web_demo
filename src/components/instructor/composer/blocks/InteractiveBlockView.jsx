"use client";

export default function InteractiveBlockView({ block }) {
  if (!block.url) {
    return <p className="text-slate-600 text-sm">No embed URL set</p>;
  }

  return (
    <iframe
      src={block.url}
      className="w-full h-[420px] rounded-lg border border-slate-800 bg-white"
    />
  );
}
