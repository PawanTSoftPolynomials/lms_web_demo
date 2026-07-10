"use client";

import VideoPlayer from "./VideoPlayer";
import NotesViewer from "./NotesViewer";
import PdfViewer from "./PdfViewer";

export default function ContentViewer({
  lesson,
}) {
  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a lesson.
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-3">
          {lesson.title}
        </h1>

        <p className="text-zinc-400 mb-8">
          {lesson.description}
        </p>

        {lesson.contents?.length === 0 && (
          <div className="bg-zinc-900 rounded-xl p-8 text-zinc-400">
            No content available.
          </div>
        )}

        {lesson.contents?.map((content) => {
          switch (content.type) {
            case "VIDEO":
              return (
                <VideoPlayer
                  key={content.id}
                  title={content.title}
                  videoUrl={content.videoUrl}
                />
              );

            case "TEXT":
              return (
                <NotesViewer
                  key={content.id}
                  htmlContent={content.htmlContent}
                />
              );

            case "DOCUMENT":
              return (
                <PdfViewer
                  key={content.id}
                  fileUrl={content.fileUrl}
                />
              );

            case "LINK":
              return (
                <a
                  key={content.id}
                  href={content.externalUrl}
                  target="_blank"
                  className="block bg-zinc-900 p-5 rounded-xl text-orange-400 mb-5"
                >
                  Open External Resource
                </a>
              );

            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}