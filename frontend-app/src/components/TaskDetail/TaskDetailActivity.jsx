import React from 'react';
import { renderRichText } from '../../Utils';

const getActivityIcon = (msg) => {
  const lowercaseMsg = msg.toLowerCase();
  if (lowercaseMsg.includes('created')) {
    return <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
  }
  if (lowercaseMsg.includes('transferred')) {
    return <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  }
  if (lowercaseMsg.includes('status')) {
    return <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>;
  }
  if (lowercaseMsg.includes('sub-task')) {
    return <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
  }
  if (lowercaseMsg.includes('updated')) {
    return <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
  }
  if (lowercaseMsg.includes('deleted')) {
    return <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
  }
  return <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
};

export default function TaskDetailActivity({ activityLogs, tMsg, formatDateMMM }) {
  return (
    <div className="space-y-4">
      {activityLogs.map((a) => {
        const msg = a.text.replace('[ACTIVITY] ', '');
        return (
          <div
            key={a.id}
            className="flex gap-3 items-start p-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-sm"
          >
            <div className="shrink-0 mt-0.5">{getActivityIcon(msg)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {renderRichText(msg)}
              </div>
              <div className="text-[9px] font-bold text-neutral-400 mt-1">
                {formatDateMMM(a.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
      {activityLogs.length === 0 && (
        <p className="text-center text-[10px] text-neutral-400 font-bold mt-10">
          {tMsg('No activities recorded yet.', 'Belum ada aktivitas terekam.')}
        </p>
      )}
    </div>
  );
}
