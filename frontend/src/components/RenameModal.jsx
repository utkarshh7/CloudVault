import { useState, useEffect } from "react";

export default function RenameModal({ file, onConfirm, onCancel, loading }) {
  const [name, setName] = useState(file?.name || "");

  useEffect(() => {
    setName(file?.name || "");
  }, [file]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && name !== file.name) {
      onConfirm(name.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Rename file</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading || !name.trim() || name === file.name}>
              {loading ? "Renaming…" : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
