export default function ContentCard({
  content,
}) {
  return (
    <div className="bg-slate-700 p-4 rounded">
      <h4 className="font-semibold">
        {content.title}
      </h4>

      {content.videoUrl && (
        <a
          href={content.videoUrl}
          target="_blank"
          className="
            text-orange-500
            block
            mt-2
          "
        >
          Watch Video
        </a>
      )}

      {content.fileUrl && (
        <a
          href={content.fileUrl}
          target="_blank"
          className="
            text-blue-400
            block
            mt-2
          "
        >
          Download File
        </a>
      )}

      {content.externalUrl && (
        <a
          href={content.externalUrl}
          target="_blank"
          className="
            text-green-400
            block
            mt-2
          "
        >
          Open Link
        </a>
      )}

      {content.htmlContent && (
        <div className="mt-3 text-slate-300">
          {content.htmlContent}
        </div>
      )}
    </div>
  );
}