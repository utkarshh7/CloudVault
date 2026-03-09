export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getFileIcon(mimeType) {
  if (!mimeType) return "📄";
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📕";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "📊";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "🗜️";
  if (mimeType.includes("text")) return "📃";
  return "📄";
}

export function isPreviewable(mimeType) {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType.startsWith("video/") || mimeType.includes("pdf");
}

export function isImage(mimeType) {
  return mimeType && mimeType.startsWith("image/");
}

export function isVideo(mimeType) {
  return mimeType && mimeType.startsWith("video/");
}
