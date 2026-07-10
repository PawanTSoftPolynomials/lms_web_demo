export default function PdfViewer({
  fileUrl,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
      <iframe
        src={fileUrl}
        title="PDF Viewer"
        className="w-full h-[700px]"
      />
    </div>
  );
}