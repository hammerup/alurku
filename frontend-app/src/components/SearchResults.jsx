import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export default function SearchResults({ query, onClose, onSelectTask, onSelectBoard }) {
  const { boards, globalSearchResults, language, selectedBoard, forceSearchAll, setForceSearchAll, activeWorkspace } = useAppContext();
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const matchedBoards = React.useMemo(() => {
    if (!query) return [];
    const filtered = (boards || []).filter((b) =>
      b.name?.toLowerCase().includes(query.toLowerCase())
    );
    if (!forceSearchAll && activeWorkspace && activeWorkspace.id) {
      return filtered.filter(b => b.workspace_id === activeWorkspace.id);
    }
    return filtered;
  }, [query, boards, activeWorkspace, forceSearchAll]);

  const matchedTasks = globalSearchResults;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] dark:bg-[#0d0f11] p-6 overflow-y-auto h-[calc(100vh-5rem)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#111E38] dark:text-white">
              {tMsg('Search Results', 'Hasil Pencarian')}
            </h1>
             <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5 flex-wrap">
              {tMsg('Showing results for:', 'Menampilkan hasil untuk:')} <span className="font-extrabold text-indigo-600 dark:text-indigo-400">"{query}"</span>
              {activeWorkspace && activeWorkspace.id && !forceSearchAll && (
                <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded text-xs font-semibold">
                  {activeWorkspace.name}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              {tMsg('Back', 'Kembali')}
            </button>
          </div>
        </div>

        {matchedBoards.length === 0 && matchedTasks.length === 0 ? (
          <div className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center shadow-xs">
            <span className="material-symbols-outlined text-5xl text-neutral-300 dark:text-neutral-700 block mb-4">search_off</span>
            <h3 className="text-lg font-bold text-[#111E38] dark:text-white mb-2">
              {tMsg('No results found', 'Hasil tidak ditemukan')}
            </h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              {tMsg('We couldn\'t find any projects or tasks matching your query. Try searching for something else!', 'Kami tidak menemukan proyek atau tugas yang cocok. Yuk coba kata kunci lain!')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Projects Section */}
            {matchedBoards.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">folder</span>
                  {tMsg('Projects', 'Proyek')} ({matchedBoards.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedBoards.map((b) => (
                    <div
                      key={`search-b-${b.id}`}
                      onClick={() => onSelectBoard(b)}
                      className="bg-white dark:bg-[#121B2D] p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer shadow-xs hover:shadow-md transition-all group flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-extrabold text-[#111E38] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {b.name}
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Owned by @{b.owner_username}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-neutral-400 group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Section */}
            {matchedTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">assignment</span>
                  {tMsg('Tasks', 'Tugas')} ({matchedTasks.length})
                </h2>
                <div className="space-y-3">
                  {matchedTasks.map((t) => (
                    <div
                      key={`search-t-${t.id}`}
                      onClick={() => onSelectTask(t)}
                      className="bg-white dark:bg-[#121B2D] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-[#111E38] dark:text-white">
                            {t.project_name}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold">
                            {t.workspace_name ? `${t.workspace_name} › ${t.board_name}` : t.board_name}
                          </span>
                          {t.category && (
                            <>
                              <span className="text-neutral-300 dark:text-neutral-700">&bull;</span>
                              <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                {t.category}
                              </span>
                            </>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-neutral-500 mt-1 truncate">
                            {t.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {t.deadline && (
                          <span className="text-[10px] text-neutral-500 dark:text-slate-400 font-medium flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                            <span className="material-symbols-outlined text-xs">calendar_today</span>
                            {formatDate(t.deadline)}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            t.status === 'Done'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
