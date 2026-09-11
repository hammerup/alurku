import React, { useState, useRef, useEffect } from 'react';

export default function TaskDetailAttachments({
  tMsg,
  selectedTask,
  attachments = [],
  isUploading = false,
  uploadProgress = 0,
  onUpload,
  onDelete,
  currentUser,
  isTaskAdmin,
  accountStatus,
  isPreviewMode,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [blobThumbnails, setBlobThumbnails] = useState({});

  const canUpload = !isPreviewMode && accountStatus !== 'suspended';

  // Load image thumbnails securely using Authorization Bearer token
  useEffect(() => {
    const token = localStorage.getItem('alurku_token');
    if (!token) return;

    const urlsToRevoke = [];
    const imageAttachments = attachments.filter((file) => {
      const ext = (file.filename || '').split('.').pop().toLowerCase();
      return (
        ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext) ||
        (file.content_type && file.content_type.startsWith('image/'))
      );
    });

    imageAttachments.forEach((file) => {
      fetch(file.preview_url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.blob();
          throw new Error('Thumbnail fetch failed');
        })
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          urlsToRevoke.push(objectUrl);
          setBlobThumbnails((prev) => ({ ...prev, [file.id]: objectUrl }));
        })
        .catch(() => {
          // Fallback to error placeholder handled in JSX
        });
    });

    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileCategory = (filename = '', contentType = '') => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext) || contentType.startsWith('image/')) {
      return 'image';
    }
    if (ext === 'pdf' || contentType.includes('pdf')) {
      return 'pdf';
    }
    if (['doc', 'docx', 'rtf', 'odt'].includes(ext) || contentType.includes('word')) {
      return 'doc';
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || contentType.includes('sheet') || contentType.includes('excel')) {
      return 'excel';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || contentType.includes('zip')) {
      return 'archive';
    }
    return 'generic';
  };

  const handleSecurePreview = async (file) => {
    try {
      setActiveActionId(`preview-${file.id}`);
      const token = localStorage.getItem('alurku_token');
      const res = await fetch(file.preview_url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error('Gagal memuat file.');
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Clean up memory after 1 minute
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      alert(err.message || 'Gagal memuat file.');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleSecureDownload = async (file) => {
    try {
      setActiveActionId(`download-${file.id}`);
      const token = localStorage.getItem('alurku_token');
      const res = await fetch(file.download_url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error('Gagal mengunduh file.');
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      alert(err.message || 'Gagal mengunduh file.');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canUpload) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!canUpload) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>{tMsg('Task Attachments', 'Lampiran File Tugas')}</span>
        </h3>
        <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">
          {attachments.length} {tMsg('file(s)', 'file')}
        </span>
      </div>

      {/* Upload Drag-and-Drop Area */}
      {canUpload && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-yellow-400 bg-yellow-50/40 dark:bg-yellow-900/20 scale-[0.99]'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-extrabold text-black dark:text-white">
              {isUploading
                ? tMsg(`Uploading... ${uploadProgress}%`, `Mengunggah... ${uploadProgress}%`)
                : tMsg('Click or drag files here to attach', 'Klik atau seret file ke sini untuk melampirkan')}
            </p>
            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
              {tMsg('PDF, PNG, JPG, DOCX, XLSX, ZIP (Max 10 MB)', 'PDF, PNG, JPG, DOCX, XLSX, ZIP (Maks 10 MB)')}
            </p>
          </div>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((file) => {
            const category = getFileCategory(file.filename, file.content_type);
            const isOwnerOrAdmin = isTaskAdmin || (currentUser && file.uploader_username && file.uploader_username.toLowerCase() === currentUser.toLowerCase());
            const thumbSrc = blobThumbnails[file.id];
            const isPreviewing = activeActionId === `preview-${file.id}`;
            const isDownloading = activeActionId === `download-${file.id}`;

            return (
              <div
                key={file.id}
                className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all min-w-0"
              >
                {/* Thumbnail or File Icon */}
                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {category === 'image' && thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={file.filename}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`${category === 'image' && thumbSrc ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
                  >
                    {category === 'pdf' ? (
                      <span className="text-red-500 font-black text-xs">PDF</span>
                    ) : category === 'excel' ? (
                      <span className="text-emerald-500 font-black text-xs">XLS</span>
                    ) : category === 'doc' ? (
                      <span className="text-blue-500 font-black text-xs">DOC</span>
                    ) : category === 'archive' ? (
                      <span className="text-amber-500 font-black text-xs">ZIP</span>
                    ) : (
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* File Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs font-bold text-black dark:text-white truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium mt-0.5">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span className="truncate">@{file.uploader_username}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Preview Button (for images and PDFs) */}
                  {(category === 'image' || category === 'pdf') && (
                    <button
                      type="button"
                      onClick={() => handleSecurePreview(file)}
                      disabled={isPreviewing}
                      className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title={tMsg('Preview', 'Lihat')}
                    >
                      {isPreviewing ? (
                        <svg className="w-4 h-4 animate-spin text-neutral-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={() => handleSecureDownload(file)}
                    disabled={isDownloading}
                    className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title={tMsg('Download', 'Unduh')}
                  >
                    {isDownloading ? (
                      <svg className="w-4 h-4 animate-spin text-neutral-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                  </button>

                  {/* Delete Button */}
                  {isOwnerOrAdmin && canUpload && (
                    deleteConfirmId === file.id ? (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-lg border border-red-200 dark:border-red-900/50 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(file.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 text-[10px] font-black bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          {tMsg('Del', 'Ya')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(file.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        title={tMsg('Delete file', 'Hapus file')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !canUpload && (
          <p className="text-xs text-neutral-400 italic mt-2">
            {tMsg('No attachments for this task.', 'Belum ada lampiran file untuk tugas ini.')}
          </p>
        )
      )}
    </div>
  );
}
