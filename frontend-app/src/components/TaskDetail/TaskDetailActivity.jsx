import React from 'react';
import { renderRichText } from '../../Utils';

const getActivityConfig = (msg) => {
  const lowercaseMsg = msg.toLowerCase();
  if (lowercaseMsg.includes('created')) {
    return {
      icon: (
        <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    };
  }
  if (lowercaseMsg.includes('transferred') || lowercaseMsg.includes('assigned')) {
    return {
      icon: (
        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    };
  }
  if (lowercaseMsg.includes('status')) {
    return {
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
        </svg>
      ),
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    };
  }
  if (lowercaseMsg.includes('sub-task') || lowercaseMsg.includes('subtask')) {
    return {
      icon: (
        <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    };
  }
  if (lowercaseMsg.includes('updated') || lowercaseMsg.includes('changed') || lowercaseMsg.includes('edited')) {
    return {
      icon: (
        <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
    };
  }
  if (lowercaseMsg.includes('deleted') || lowercaseMsg.includes('removed')) {
    return {
      icon: (
        <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    };
  }
  return {
    icon: (
      <svg className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    bg: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
  };
};

export default function TaskDetailActivity({ activityLogs = [], tMsg, formatDateMMM }) {
  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200/60 dark:border-neutral-700/60">
          <span className="material-symbols-outlined text-[24px]">history</span>
        </div>
        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
          {tMsg('No activities recorded yet.', 'Belum ada aktivitas terekam.')}
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
          {tMsg('Changes to this task, assignments, and status updates will be logged here.', 'Perubahan tugas, delegasi, dan pembaruan status akan tercatat di sini.')}
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
      {activityLogs.map((a) => {
        const msg = (a.text || '').replace('[ACTIVITY] ', '');
        const { icon, bg } = getActivityConfig(msg);
        return (
          <div key={a.id} className="relative flex items-start gap-3 group">
            {/* Timeline Dot with Icon */}
            <div className={`-ml-4 w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 z-10 shadow-2xs transition-transform group-hover:scale-110 ${bg}`}>
              {icon}
            </div>

            {/* Content Bubble */}
            <div className="flex-1 min-w-0 bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-3 rounded-2xl shadow-2xs">
              <div className="text-xs font-medium text-slate-700 dark:text-neutral-200 leading-relaxed break-words">
                {renderRichText(msg)}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-bold text-neutral-400 dark:text-neutral-500">
                <span className="material-symbols-outlined text-[11px]">schedule</span>
                <span>{formatDateMMM(a.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
