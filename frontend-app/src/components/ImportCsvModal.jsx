import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function ImportCsvModal({
  isOpen,
  onClose,
  boardId,
  boardName,
  language = 'id',
  onSuccess,
  showNotification,
}) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [previewTasks, setPreviewTasks] = useState([]);
  const [totalParsed, setTotalParsed] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  if (!isOpen) return null;

  const parseCsvText = (text) => {
    // Strip BOM if present
    const cleanText = text.replace(/^\ufeff/, '');
    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErrorMessage(tMsg('CSV file is empty or missing data rows.', 'File CSV kosong atau tidak memiliki baris data.'));
      setPreviewTasks([]);
      setTotalParsed(0);
      return;
    }

    const firstLine = lines[0];
    const delimiter = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';

    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === delimiter && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/_/g, ' '));
    const titleIdx = headers.findIndex((h) =>
      ['judul tugas', 'judul', 'task name', 'task', 'title', 'nama tugas'].includes(h)
    );
    const catIdx = headers.findIndex((h) => ['kategori', 'category'].includes(h));
    const prioIdx = headers.findIndex((h) => ['prioritas', 'priority', 'impact'].includes(h));
    const reqIdx = headers.findIndex((h) => ['pemohon', 'requester', 'assignee', 'pekerja'].includes(h));
    const subIdx = headers.findIndex((h) => ['subtasks', 'sub-task', 'sub task', 'subtugas'].includes(h));

    if (titleIdx === -1) {
      setErrorMessage(
        tMsg(
          "Column 'Judul Tugas' or 'Task Name' was not found in CSV header.",
          "Kolom 'Judul Tugas' atau 'Task Name' tidak ditemukan di header CSV."
        )
      );
      setPreviewTasks([]);
      setTotalParsed(0);
      return;
    }

    const tasks = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const title = cols[titleIdx];
      if (!title) continue;

      const subtasksRaw = subIdx !== -1 && cols[subIdx] ? cols[subIdx] : '';
      const subtaskCount = subtasksRaw
        ? subtasksRaw.split(/[;\n|]+/).filter((s) => s.trim().length > 0).length
        : 0;

      tasks.push({
        title,
        category: catIdx !== -1 && cols[catIdx] ? cols[catIdx] : 'Development',
        priority: prioIdx !== -1 && cols[prioIdx] ? cols[prioIdx] : 'Medium',
        requester: reqIdx !== -1 && cols[reqIdx] ? cols[reqIdx] : '',
        subtaskCount,
      });
    }

    setErrorMessage('');
    setTotalParsed(tasks.length);
    setPreviewTasks(tasks.slice(0, 4));
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage(tMsg('Please select a valid .csv file.', 'Silakan pilih file berekstensi .csv yang valid.'));
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize((selectedFile.size / 1024).toFixed(1) + ' KB');
    setErrorMessage('');
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        parseCsvText(e.target.result);
      } catch (err) {
        console.error(err);
        setErrorMessage(tMsg('Error reading CSV file format.', 'Gagal membaca format file CSV.'));
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setIsParsing(false);
      setErrorMessage(tMsg('Failed to read the file.', 'Gagal membaca isi file.'));
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file || !boardId || boardId === 'global') return;
    setIsImporting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`/api/boards/${boardId}/import-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const count = res.data?.imported_count || totalParsed;
      if (showNotification) {
        showNotification(
          language === 'id'
            ? `Berhasil mengimpor ${count} tugas ke ${boardName || 'proyek'}!`
            : `Successfully imported ${count} tasks into ${boardName || 'project'}!`,
          'success'
        );
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setErrorMessage(
        detail ||
          tMsg(
            'Failed to import CSV. Please ensure valid permissions and format.',
            'Gagal mengimpor CSV. Pastikan format file sesuai dan Anda memiliki akses tulis.'
          )
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111E38] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-[#111E38] dark:text-white">
                {tMsg('Import CSV Tasks', 'Impor Tugas dari CSV')}
              </h3>
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                {boardName ? `${tMsg('Target project:', 'Proyek tujuan:')} ${boardName}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#111E38] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* File Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#FACC15] bg-amber-50/50 dark:bg-amber-950/20'
                : file
                ? 'border-emerald-400/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-neutral-300 dark:border-neutral-700 bg-[#F3F4F6] dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
            />

            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#111E38] border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-[#111E38] dark:text-[#FACC15] shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>

            {file ? (
              <div className="text-center">
                <p className="text-xs font-bold text-[#111E38] dark:text-white truncate max-w-xs">{fileName}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold">{fileSize}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  {tMsg('Click to choose a different file', 'Klik untuk memilih file lain')}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-bold text-[#111E38] dark:text-white">
                  {tMsg('Drag & drop your CSV file here', 'Tarik & lepas file CSV di sini')}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {tMsg('or click to browse from computer', 'atau klik untuk memilih dari komputer')}
                </p>
              </div>
            )}
          </div>

          {/* Supported Format Tip */}
          <div className="bg-[#F3F4F6] dark:bg-neutral-900/80 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
            <p className="font-bold text-[#111E38] dark:text-neutral-200">
              {tMsg('Supported CSV Columns:', 'Format Kolom CSV yang Didukung:')}
            </p>
            <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 break-words">
              ID, Judul Tugas, Pemohon, Kategori, Status, Prioritas, Start Date, Deadline, Estimasi Jam, Subtasks
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-3 rounded-xl flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs">
              <svg className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Section */}
          {totalParsed > 0 && !errorMessage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111E38] dark:text-white uppercase tracking-wider">
                  {tMsg('Preview Data', 'Pratinjau Data')}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FACC15] text-[#111E38]">
                  {totalParsed} {tMsg('tasks found', 'tugas ditemukan')}
                </span>
              </div>

              <div className="space-y-1.5">
                {previewTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#111E38] dark:text-white truncate">{t.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-500">
                        <span>{t.category}</span>
                        <span>•</span>
                        <span>{t.priority}</span>
                        {t.subtaskCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {t.subtaskCount} subtasks
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {totalParsed > 4 && (
                  <p className="text-[10px] font-bold text-center text-neutral-400 dark:text-neutral-500">
                    +{totalParsed - 4} {tMsg('more tasks will be created', 'tugas lainnya akan dibuat')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5 bg-neutral-50/50 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {tMsg('Cancel', 'Batal')}
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={!file || totalParsed === 0 || isImporting || isParsing}
            className="px-5 py-2 rounded-xl text-xs font-black bg-[#FACC15] hover:bg-amber-400 text-[#111E38] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{tMsg('Importing...', 'Mengimpor...')}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#111E38]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{tMsg('Import Now', 'Impor Sekarang')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
