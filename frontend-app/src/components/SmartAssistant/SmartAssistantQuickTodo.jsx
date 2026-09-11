import React from 'react';
import { LoadingSpinner } from '../../Utils';

export default function SmartAssistantQuickTodo({
  selectedBoard,
  boards,
  quickTargetBoardId,
  setQuickTargetBoardId,
  tMsg,
  quickTasks,
  setQuickTasks,
  setDiscardConfirmAction,
  setAssistantMode,
  quickTaskInput,
  setQuickTaskInput,
  isSavingQuickTasks,
  handleSaveQuickTasks,
  handleQuickTaskSubmit,
  renderDiscardModal,
}) {
  const targetBoardName =
    !selectedBoard || selectedBoard.id === 'global'
      ? (boards || []).find((b) => String(b.id) === String(quickTargetBoardId))?.name || tMsg('Project', 'Proyek')
      : selectedBoard?.name || tMsg('Project', 'Proyek');

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-neutral-50 dark:bg-neutral-950 relative z-20">
      <style>{`
        @keyframes slide-up-slow {
          0% { opacity: 0; transform: translateY(25px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .quick-task-animate {
          animation: slide-up-slow 0.4s ease-out forwards;
        }
      `}</style>
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center shrink-0 shadow-sm z-10">
        <button
          onClick={() => {
            if (quickTasks.length > 0) {
              setDiscardConfirmAction(() => () => {
                setQuickTasks([]);
                setAssistantMode('landing');
              });
              return;
            }
            setAssistantMode('landing');
          }}
          className="text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors w-16"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {tMsg('Menu', 'Menu')}
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 flex-1 justify-center">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          {tMsg('Quick To-Do', 'To-Do Cepat')}
        </span>
        <button
          onClick={() => {
            if (quickTasks.length > 0) {
              setDiscardConfirmAction(() => () => {
                setQuickTasks([]);
                setQuickTaskInput('');
              });
              return;
            }
            setQuickTaskInput('');
          }}
          className="text-[10px] font-bold text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center justify-end gap-1 transition-colors w-16"
        >
          {tMsg('Reset', 'Ulang')} ↻
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col justify-start bg-neutral-50/50 dark:bg-neutral-950 relative">
        {quickTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 mac-animate">
            <div className="w-16 h-16 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center mb-4 text-neutral-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-neutral-500">
              {tMsg('Type below to add tasks', 'Ketik di bawah untuk menambah tugas')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 w-full mb-auto">
              {quickTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm quick-task-animate flex justify-between items-start gap-3 w-full"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words flex-1 mt-0.5 leading-snug">
                    {t.text}
                  </span>
                  <button
                    onClick={() => setQuickTasks((prev) => prev.filter((x) => x.id !== t.id))}
                    className="text-neutral-400 hover:text-red-500 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 w-full pt-4 z-10 mt-auto">
              <div className="absolute inset-0 bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-md -mx-5 -mb-5" />
              <div className="flex flex-col gap-2 quick-task-animate relative z-10">
                {(!selectedBoard || selectedBoard.id === 'global') && (
                  <select
                    value={quickTargetBoardId}
                    onChange={(e) => setQuickTargetBoardId(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent text-xs font-bold p-3 rounded-xl outline-none focus:border-indigo-500 text-black dark:text-white [&>option]:bg-white dark:[&>option]:bg-neutral-950 [&>option]:text-black dark:[&>option]:text-white cursor-pointer"
                  >
                    <option value="">-- {tMsg('Select Project', 'Pilih Proyek')} --</option>
                    {(boards || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleSaveQuickTasks}
                  disabled={isSavingQuickTasks}
                  className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition-colors uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5"
                >
                  {isSavingQuickTasks ? (
                    <LoadingSpinner />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  )}
                  {isSavingQuickTasks
                    ? tMsg('Saving...', 'Menyimpan...')
                    : tMsg(`Save ${quickTasks.length} Tasks to`, `Simpan ${quickTasks.length} Tugas ke`)}
                  {!isSavingQuickTasks && (
                    <span className="truncate max-w-[120px] sm:max-w-[200px] inline-block align-bottom">
                      {targetBoardName}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div id="quick-tasks-end" className="h-2 shrink-0"></div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0 relative z-20 flex flex-col gap-3">
        <form onSubmit={handleQuickTaskSubmit} className="flex gap-2 relative items-center">
          <input
            type="text"
            value={quickTaskInput}
            onChange={(e) => setQuickTaskInput(e.target.value)}
            disabled={isSavingQuickTasks}
            placeholder={tMsg('Add a quick task...', 'Tambah tugas cepat...')}
            className="flex-1 py-3.5 px-4 bg-neutral-100 dark:bg-neutral-900 border border-transparent text-black dark:text-white rounded-xl focus:bg-white dark:focus:bg-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium placeholder-neutral-400 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!quickTaskInput.trim() || isSavingQuickTasks}
            className="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 w-[48px] h-[48px] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0 shadow-sm"
          >
            <span className="text-xl">↑</span>
          </button>
        </form>
      </div>
      {renderDiscardModal()}
    </div>
  );
}
