"use client";

export default function SlideshowBlockEdit({ block, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">
        Slide markdown — separate slides with a line containing only{" "}
        <code className="text-orange-400">---</code>
      </label>
      <textarea
        value={block.markdown || ""}
        onChange={(e) => onChange({ markdown: e.target.value })}
        rows={10}
        placeholder={"# Slide 1\n\nContent here\n\n---\n\n# Slide 2\n\nMore content"}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono outline-none focus:border-orange-500 resize-y"
      />
    </div>
  );
}
