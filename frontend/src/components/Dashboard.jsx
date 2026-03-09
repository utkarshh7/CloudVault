import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast, ToastContainer } from "../hooks/useToast";
import { api } from "../utils/api";
import { formatBytes, isPreviewable } from "../utils/fileUtils";
import FileCard from "./FileCard";
import RenameModal from "./RenameModal";
import DeleteModal from "./DeleteModal";
import PreviewModal from "./PreviewModal";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toasts, addToast } = useToast();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");

  const [renameFile, setRenameFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fileInputRef = useRef();
  const searchTimeout = useRef();

  const loadFiles = useCallback(async (query = "") => {
    try {
      const endpoint = query ? `/search-files?q=${encodeURIComponent(query)}` : "/list-files";
      const data = await api.get(endpoint);
      const filesWithPreviews = await Promise.all(
        (data.files || []).map(async (f) => {
          if (isPreviewable(f.mimeType)) {
            try {
              const { url } = await api.authPost("/get-download-url", { fileKey: f.fileKey });
              return { ...f, previewUrl: url };
            } catch {
              return f;
            }
          }
          return f;
        })
      );
      setFiles(filesWithPreviews);
    } catch (err) {
      addToast("Failed to load files: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleSearch = (q) => {
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setLoading(true);
      loadFiles(q);
    }, 400);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      addToast("File too large. Max 100MB allowed.", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);

    try {
      // 1. Get presigned upload URL
      const { uploadUrl, fileKey } = await api.authPost("/get-upload-url", {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      });

      // 2. Upload directly to S3
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`S3 upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // 3. Save metadata to DynamoDB
      await api.authPost("/add-metadata", {
        fileKey,
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      });

      addToast(`${file.name} uploaded successfully!`, "success");
      await loadFiles(searchQuery);
    } catch (err) {
      addToast("Upload failed: " + err.message, "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadFileName("");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDownload = async (file) => {
    try {
      const { url } = await api.authPost("/get-download-url", { fileKey: file.fileKey });
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
    } catch (err) {
      addToast("Download failed: " + err.message, "error");
    }
  };

  const handleRenameConfirm = async (newName) => {
    setActionLoading(true);
    try {
      await api.authPut("/rename-file", {
        fileKey: renameFile.fileKey,
        newName,
        uploadedAt: renameFile.uploadedAt,
      });
      addToast("File renamed!", "success");
      setRenameFile(null);
      await loadFiles(searchQuery);
    } catch (err) {
      addToast("Rename failed: " + err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await api.authDelete("/delete-file", {
        fileKey: deleteFile.fileKey,
        uploadedAt: deleteFile.uploadedAt,
      });
      addToast("File deleted.", "info");
      setDeleteFile(null);
      await loadFiles(searchQuery);
    } catch (err) {
      addToast("Delete failed: " + err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredFiles = files;

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="url(#gn)" />
            <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gn" x1="4" y1="4" x2="36" y2="36">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span>CloudVault</span>
        </div>

        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="search-input"
            type="search"
            placeholder="Search your files…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="nav-right">
          <div className="user-badge">
            <div className="user-avatar">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <span>{user?.email}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Body */}
      <div className="dashboard-body">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-title">
              My Drive{" "}
              <span className="file-count">
                {files.length > 0 ? `· ${files.length} file${files.length !== 1 ? "s" : ""}` : ""}
              </span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "auto" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload file
          </button>
          <input ref={fileInputRef} type="file" hidden onChange={handleFileInputChange} />
        </div>

        {/* Upload zone */}
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-zone-icon">☁️</div>
          <div className="upload-zone-text">
            Drop files here or <strong>click to browse</strong>
          </div>
          <div className="upload-zone-sub">Max 100MB · Any file type</div>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-label">
              <span>Uploading {uploadFileName}…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Files grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div className="files-grid">
            {filteredFiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  {searchQuery ? "🔍" : "📂"}
                </div>
                <div className="empty-state-title">
                  {searchQuery ? `No files matching "${searchQuery}"` : "No files yet"}
                </div>
                <div className="empty-state-sub">
                  {searchQuery ? "Try a different search term" : "Upload your first file to get started"}
                </div>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <FileCard
                  key={file.fileKey}
                  file={file}
                  onRename={setRenameFile}
                  onDelete={setDeleteFile}
                  onPreview={setPreviewFile}
                  onDownload={handleDownload}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <span>© 2026 CloudVault</span>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>

      {/* Modals */}
      {renameFile && (
        <RenameModal
          file={renameFile}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenameFile(null)}
          loading={actionLoading}
        />
      )}
      {deleteFile && (
        <DeleteModal
          file={deleteFile}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteFile(null)}
          loading={actionLoading}
        />
      )}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
