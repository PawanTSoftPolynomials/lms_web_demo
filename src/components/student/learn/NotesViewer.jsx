export default function NotesViewer({
  htmlContent,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
      <h2 className="text-white text-xl font-semibold mb-4">
        Notes
      </h2>

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: htmlContent,
        }}
      />
    </div>
  );
}