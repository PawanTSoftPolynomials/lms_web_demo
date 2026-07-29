// Matches youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/, and youtube.com/v/
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function getYouTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url) {
  return Boolean(getYouTubeVideoId(url));
}

export function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
