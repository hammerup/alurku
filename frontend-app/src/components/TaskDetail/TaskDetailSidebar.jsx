import React from 'react';
import axios from 'axios';

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
            {tMsg('Impact', 'Dampak')}
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100">
            {selectedTask.impact === 'High'
              ? 'High'
              : selectedTask.impact === 'Low'
              ? 'Low'
              : 'Medium'}
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
                let timeStr = '';
                let timeClass = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
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
          <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1" title="Estimated Time Consumption">
            {tMsg('ETC', 'Estimasi')} <span className="cursor-help opacity-70">🛈</span>
          </p>
          <p className="font-bold text-sm truncate text-slate-800 dark:text-neutral-100 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{selectedTask.etc || 2}h</span>
          </p>
        </div>
      </div>

      {selectedTask.status !== 'Done' && (
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-5">
          <button
            type="button"
            onClick={() => openCalendarPopup(generateGoogleMeetScheduleUrl())}
            className="text-[9px] font-bold text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {tMsg('Schedule Meeting', 'Jadwalkan Rapat')}
          </button>
          <button
            type="button"
            onClick={() => openCalendarPopup(generateGoogleCalendarUrl())}
            className="text-[9px] font-bold text-blue-600 hover:text-blue-100 dark:text-blue-400 dark:hover:text-blue-900/50 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800/50 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {tMsg('Add to Calendar', 'Ke Kalender')}
          </button>
          {!isPreviewMode && (
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
          {isTaskAdmin && accountStatus !== 'suspended' && !isPreviewMode && (
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
              className={`text-[9px] font-bold px-4 py-2 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-1.5 shadow-sm ${!!selectedTask.auto_nudge ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900/30 dark:text-neutral-400 dark:border-neutral-800/50'}`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {!!selectedTask.auto_nudge ? tMsg('Auto Nudge: ON', 'Auto Nudge: AKTIF') : tMsg('Auto Nudge: OFF', 'Auto Nudge: MATI')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
