import { isImage, isVideo } from "../utils/fileUtils";

export default function PreviewModal({ file, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="modal-title" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
            {file.name}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {isImage(file.mimeType) ? (
          <img src={file.previewUrl} alt={file.name} />
        ) : isVideo(file.mimeType) ? (
          <video src={file.previewUrl} controls autoPlay style={{ maxWidth: '80vw', maxHeight: '70vh' }} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
            Preview not available for this file type.
          </div>
        )}
      </div>
    </div>
  );
}
