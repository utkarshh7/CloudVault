export default function DeleteModal({ file, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Delete file?</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{file?.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
