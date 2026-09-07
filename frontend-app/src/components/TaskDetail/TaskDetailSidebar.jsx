import { useState } from 'react';
import axios from 'axios';
import { usePublicPolicies } from '../../hooks/usePublicPolicies';

export default function TaskDetailSidebar({
  selectedTask,
  tMsg,
  queuePosition,
  totalQueue,
  mainAssignee,
  queueType,
  queueLabel,
  formatDateMMM,
  openCalendarPopup,
  generateGoogleMeetScheduleUrl,
  generateGoogleCalendarUrl,
  isPreviewMode,
  setIsNudgeConfirmOpen,
  isGeneratingNudge,
  hasAnyAssignee,
  isTaskAdmin,
  accountStatus,
  handleToggleAutoNudge,
  setSelectedTask,
  showNotification,
}) {
  const { policies } = usePublicPolicies();
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4 sm:gap-5 mb-6 mt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
            {selectedTask.requester?.includes('@') ? tMsg('Assigned To', 'Pekerja') : tMsg('Requester', 'Peminta')}
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            <p className="font-bold text-sm truncate leading-none text-slate-800 dark:text-neutral-100" title={selectedTask.requester}>
              {selectedTask.requester}
            </p>
            {queuePosition && totalQueue && selectedTask.status !== 'Done' && selectedTask.status !== 'Rejected' && (
              <span
                className="text-[9px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/50 cursor-help w-max"
                title={tMsg(
                  `This task is number ${queuePosition} out of ${totalQueue} in ${mainAssignee}'s current ${queueType} queue.`,
                  `Tugas ini berada di urutan ke-${queuePosition} dari ${totalQueue} dalam antrean ${queueType} ${mainAssignee} saat ini.`
                )}
              >
                {queueLabel} #{queuePosition} of {totalQueue}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
            {tMsg('Category', 'Kategori')}
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100" title={selectedTask.category}>
            {selectedTask.category}
          </p>
        </div>
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
            {tMsg('Priority', 'Prioritas')}
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100 flex items-center gap-1.5">
            {selectedTask.impact === 'High' ? (
              <span className="text-red-600 dark:text-red-400 font-bold">{tMsg('High', 'Tinggi')}</span>
            ) : selectedTask.impact === 'Low' ? (
              <span className="text-slate-600 dark:text-slate-400 font-bold">{tMsg('Low', 'Rendah')}</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">{tMsg('Medium', 'Sedang')}</span>
            )}
          </p>
        </div>
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
            {tMsg('Recurring', 'Berulang')}
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100 flex items-center gap-1">
            {selectedTask.recurring === 'daily' ? (
              <>
                <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                <span>Daily</span>
              </>
            ) : selectedTask.recurring === 'weekly' ? (
              <>
                <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                <span>Weekly</span>
              </>
            ) : selectedTask.recurring === 'monthly' ? (
              <>
                <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                <span>Monthly</span>
              </>
            ) : (
              'None'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-5">
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
            {tMsg('Start Date', 'Tanggal Mulai')}
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100">
            {formatDateMMM(selectedTask.start_date || selectedTask.timestamp)}
          </p>
        </div>
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
            {selectedTask.status === 'Done' ? tMsg('Completed At', 'Selesai Pada') : tMsg('Target Deadline', 'Tenggat Waktu')}
          </p>
          <p className="font-bold text-[11px] xl:text-sm truncate flex items-center gap-1.5 xl:gap-2 text-slate-800 dark:text-neutral-100">
            <span className="truncate">
              {selectedTask.status === 'Done'
                ? formatDateMMM(selectedTask.completed_time)
                : formatDateMMM(selectedTask.deadline)}
            </span>
            {(() => {
              if (selectedTask.status !== 'Done' && selectedTask.status !== 'Rejected' && selectedTask.deadline) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dl = new Date(selectedTask.deadline.replace(/-/g, '/'));
                dl.setHours(0, 0, 0, 0);
                const diffDays = Math.round((dl - today) / (1000 * 60 * 60 * 24));
                let timeStr;
                let timeClass;
                if (diffDays < 0) {
                  timeStr = tMsg(`${Math.abs(diffDays)}d overdue`, `${Math.abs(diffDays)}h lewat`);
                  timeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
                } else if (diffDays === 0) {
                  timeStr = tMsg('Today', 'Hari Ini');
                  timeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
                } else if (diffDays === 1) {
                  timeStr = tMsg('1d left', '1h lagi');
                  timeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
                } else if (diffDays < 7) {
                  timeStr = tMsg(`${diffDays}d left`, `${diffDays}h lagi`);
                  timeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
                } else {
                  const w = Math.floor(diffDays / 7);
                  const d = diffDays % 7;
                  timeStr = d === 0 ? tMsg(`${w}w left`, `${w}m lagi`) : tMsg(`${w}w ${d}d left`, `${w}m ${d}h lagi`);
                  timeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
                }
                return (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${timeClass}`}>
                    {timeStr}
                  </span>
                );
              }
              return null;
            })()}
          </p>
        </div>
        <div className="shrink-0 min-w-0">
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1" title={tMsg('Estimated Time Consumption', 'Estimasi Waktu Pengerjaan dalam Jam')}>
            {tMsg('Time Estimate', 'Estimasi Waktu')}
            <span className="cursor-help opacity-70">
              <svg className="w-3 h-3 text-neutral-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"/></svg>
            </span>
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{selectedTask.etc || 2} {tMsg('hrs', 'jam')}</span>
          </p>
        </div>
      </div>

      {selectedTask.status !== 'Done' && (
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-5">
          {/* Calendar & Meeting Compact Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarMenuOpen((prev) => !prev)}
              className="text-[9px] font-bold text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title={tMsg('Calendar & Meeting options', 'Opsi Kalender & Rapat')}
            >
              <svg className="w-3 h-3 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{tMsg('Calendar & Meet', 'Kalender & Rapat')}</span>
              <svg className="w-2.5 h-2.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isCalendarMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsCalendarMenuOpen(false)} />
                <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-40 py-1 text-left animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalendarMenuOpen(false);
                      openCalendarPopup(generateGoogleMeetScheduleUrl());
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span>{tMsg('Schedule Google Meet', 'Jadwalkan Google Meet')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalendarMenuOpen(false);
                      openCalendarPopup(generateGoogleCalendarUrl());
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors cursor-pointer border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <span>{tMsg('Add to Google Calendar', 'Simpan ke Google Calendar')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {!isPreviewMode && policies.enable_proactive_nudge && (
            <button
              type="button"
              onClick={() => setIsNudgeConfirmOpen(true)}
              disabled={isGeneratingNudge || !hasAnyAssignee}
              className={`text-[9px] font-bold text-amber-600 hover:text-amber-100 dark:text-amber-400 dark:hover:text-amber-900/50 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${!hasAnyAssignee ? 'cursor-not-allowed' : ''}`}
              title={!hasAnyAssignee ? tMsg('No assignees to nudge', 'Tidak ada pekerja untuk dipantau') : ''}
            >
              {isGeneratingNudge ? (
                <svg className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              )}
              {tMsg('Smart Nudge', 'Pantauan Cerdas')}
            </button>
          )}
          {isTaskAdmin && accountStatus !== 'suspended' && !isPreviewMode && policies.enable_proactive_nudge && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof handleToggleAutoNudge === 'function') {
                  handleToggleAutoNudge(selectedTask.id, !selectedTask?.auto_nudge);
                } else {
                  const taskId = selectedTask.id;
                  const isEnabled = !selectedTask?.auto_nudge;
                  setSelectedTask((prev) => ({ ...prev, auto_nudge: isEnabled }));
                  axios
                    .put(`/api/tasks/${taskId}/auto-nudge`, { auto_nudge: isEnabled })
                    .then(() => {
                      if (showNotification) showNotification(isEnabled ? 'Auto Nudge enabled' : 'Auto Nudge disabled', 'success');
                    })
                    .catch(() => {
                      setSelectedTask((prev) => ({ ...prev, auto_nudge: !isEnabled }));
                      if (showNotification) showNotification('Failed to toggle Auto Nudge', 'error');
                    });
                }
              }}
              className={`text-[9px] font-bold px-4 py-2 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-1.5 shadow-sm ${selectedTask.auto_nudge ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900/30 dark:text-neutral-400 dark:border-neutral-800/50'}`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {selectedTask.auto_nudge ? tMsg('Auto Nudge: ON', 'Auto Nudge: AKTIF') : tMsg('Auto Nudge: OFF', 'Auto Nudge: MATI')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
