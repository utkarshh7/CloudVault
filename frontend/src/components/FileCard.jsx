import { useState } from "react";
import { formatBytes, formatDate, getFileIcon, isImage, isVideo } from "../utils/fileUtils";

export default function FileCard({ file, onRename, onDelete, onPreview, onDownload }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const icon = getFileIcon(file.mimeType);
  const hasPreview = isImage(file.mimeType) || isVideo(file.mimeType);

  return (
    <div className="file-card">
      <div
        className="file-card-preview"
        onClick={() => hasPreview ? onPreview(file) : onDownload(file)}
        style={{ cursor: "pointer" }}
      >
        {file.previewUrl && isImage(file.mimeType) ? (
          <img src={file.previewUrl} alt={file.name} loading="lazy" />
        ) : file.previewUrl && isVideo(file.mimeType) ? (
          <video src={file.previewUrl} muted style={{ pointerEvents: "none" }} />
        ) : (
          <span style={{ fontSize: "3rem" }}>{icon}</span>
        )}
      </div>

      <div className="file-card-body">
        <div className="file-name" title={file.name}>{file.name}</div>
        <div className="file-meta">
          <span>{formatBytes(file.size)}</span>
          <span>·</span>
          <span>{formatDate(file.uploadedAt)}</span>
        </div>

        <div className="file-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDownload(file)}
            title="Download"
          >
            ↓ Download
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setMenuOpen(!menuOpen); }}
            title="More"
          >
            ⋯
          </button>
        </div>

        {menuOpen && (
          <div style={{
            marginTop: 8,
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, border: 'none' }}
              onClick={() => { setMenuOpen(false); onRename(file); }}
            >
              ✏️ Rename
            </button>
            <button
              className="btn btn-danger btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, border: 'none' }}
              onClick={() => { setMenuOpen(false); onDelete(file); }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
