import React from 'react';

export default function SmartAssistantLanding({
  currentUser,
  tMsg,
  setAssistantMode,
  startQuickNote,
  startConversation,
  renderDiscardModal,
}) {
  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#F3F4F6] dark:bg-[#0d0f11] relative z-20 items-center justify-center p-6 text-center select-none">
      {/* Premium Monogram App Icon */}
      <div className="w-16 h-16 bg-[#FACC15] text-[#111E38] rounded-2xl flex items-center justify-center mb-6 shadow-md border border-[#EAB308] mac-animate">
        <svg className="w-8 h-8 text-[#111E38]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.7 8.3L21.5 9.3L16.6 14.1L17.8 20.8L12 17.6L6.2 20.8L7.4 14.1L2.5 9.3L9.3 8.3L12 2Z" />
        </svg>
      </div>
      <h2
        className="text-2xl font-black text-[#111E38] dark:text-slate-100 mb-2 tracking-tight mac-animate"
        style={{ animationDelay: '100ms' }}
      >
        {tMsg('Hello', 'Halo')} @{currentUser}
      </h2>
      <p
        className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-10 max-w-xs mx-auto mac-animate"
        style={{ animationDelay: '150ms' }}
      >
        {tMsg('What would you like to do today?', 'Apa yang ingin kamu lakukan hari ini?')}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm mac-animate" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => setAssistantMode('quick_todo')}
          className="bg-[#FAFAFA] dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FACC15] dark:hover:border-[#FACC15] transition-all flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-indigo-100/50 dark:border-indigo-900/30">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#111E38] dark:text-slate-200 text-sm">
              {tMsg('Quick To-Do List', 'To-Do List Cepat')}
            </h3>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
              {tMsg('Rapidly add multiple tasks', 'Tambah banyak tugas dengan cepat')}
            </p>
          </div>
        </button>

        <button
          onClick={() => setAssistantMode('planner')}
          className="bg-[#FAFAFA] dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FACC15] dark:hover:border-[#FACC15] transition-all flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-100/50 dark:border-amber-900/30">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 13.913M9.813 15.904L14.5 11.5M9.813 15.904L5 11.5M14.907 13.913L18 9L12.093 11.087M14.907 13.913L12.5 7.5" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#111E38] dark:text-slate-200 text-sm">
              {tMsg('AI Task Planner', 'Perencana Tugas AI')}
            </h3>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
              {tMsg('Auto-generate full project structures', 'Buat struktur proyek secara otomatis')}
            </p>
          </div>
        </button>

        <button
          onClick={() => startQuickNote()}
          className="bg-[#FAFAFA] dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FACC15] dark:hover:border-[#FACC15] transition-all flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100/50 dark:border-emerald-900/30">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#111E38] dark:text-slate-200 text-sm">{tMsg('Meeting Notes', 'Catatan Rapat')}</h3>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
              {tMsg('Extract bulk tasks from notes', 'Ekstrak tugas massal dari catatan')}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setAssistantMode('chat');
            startConversation();
          }}
          className="bg-[#FAFAFA] dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FACC15] dark:hover:border-[#FACC15] transition-all flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-purple-100/50 dark:border-purple-900/30">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19c-3.866 0-7-2.91-7-6.5S8.134 6 12 6s7 2.91 7 6.5-3.134 6.5-7 6.5zm0 0v-3" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#111E38] dark:text-slate-200 text-sm">
              {tMsg('Smart AI Chat', 'Obrolan AI Pintar')}
            </h3>
            <p className="text-[10px] font-medium text-neutral-500 mt-0.5">
              {tMsg('Draft, Analyze, Summarize', 'Draf, Analisis, Ringkas')}
            </p>
          </div>
        </button>
      </div>
      {renderDiscardModal()}
    </div>
  );
}
