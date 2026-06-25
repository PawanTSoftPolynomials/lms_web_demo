export default function VideoPlayer({
  title,
  videoUrl,
}) {
  return (
    <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      {videoUrl ? (
        <video
          controls
          className="w-full aspect-video"
        >
          <source src={videoUrl} />
        </video>
      ) : (
        <div className="aspect-video flex items-center justify-center text-zinc-500">
          Video URL not provided.
        </div>
      )}
    </div>
  );
}