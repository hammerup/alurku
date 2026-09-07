import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { IconPlus } from './SharedUI';
import { useCloseAnimation, LoadingSpinner } from './Utils';
import { usePublicPolicies } from './hooks/usePublicPolicies';

export default function TaskFormModal({
  setIsFormOpen,
  currentUser,
  handleSubmit,
  formData,
  setFormData,
  handleRequesterChange,
  isMentioning,
  teamMembers,
  mentionQuery,
  insertMention,
  categories,
  handleOpenAddBoard,
  formSubtaskInput,
  setFormSubtaskInput,
  handleAddFormSubtask,
  formSubtaskAssignee,
  setFormSubtaskAssignee,
  formSubtasks,
  setFormSubtasks,
  handleRemoveFormSubtask,
  mentionIndex,
  setMentionIndex,
  setIsMentioning,
  language,
  isSubmitting,
  handleManualFormClick,
  selectedBoard,
  boards = [],
  userDirectory,
  showNotification,
}) {
  const [isClosing, close] = useCloseAnimation(() => setIsFormOpen(false));
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const { policies } = usePublicPolicies();

  const [formMode, setFormMode] = useState('ai'); // 'ai' atau 'manual'
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);

  // Custom in-modal alert & confirm dialog state
  const [modalPopup, setModalPopup] = useState(null);

  const showAlert = (message, title = null, type = 'warning') => {
    setModalPopup({
      title: title || (type === 'error' ? tMsg('Error', 'Terjadi Kesalahan') : tMsg('Attention', 'Perhatian')),
      message,
      type,
    });
    if (showNotification) {
      showNotification(message, type);
    }
  };

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const handleGenerateDesc = async () => {
    if (!formData.project_name) {
      showAlert(
        language === 'id' ? 'Silakan masukkan nama/judul tugas terlebih dahulu.' : 'Please enter a task name first.',
        tMsg('Task Title Required', 'Judul Tugas Diperlukan'),
        'warning'
      );
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const baseDesc = formData.description ? `\n\nUser's initial brief/draft:\n${formData.description}` : '';
      const prompt = `Write a professional, structured task description (brief) in markdown format. The task title is "${formData.project_name}", category is "${formData.category}". Please respond in the same language as the task title.${baseDesc}`;
      const res = await axios.post('/api/ai/generate', { prompt });
      setFormData({ ...formData, description: res.data.text });
    } catch (err) {
      console.error(err);
      showAlert(
        language === 'id' ? 'Gagal membuat deskripsi dengan AI.' : 'Failed to generate description with AI.',
        tMsg('AI Generation Failed', 'Gagal Membuat Deskripsi AI'),
        'error'
      );
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAiSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGeneratingTask(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const subtaskInstruction = policies.enable_auto_subtasks
      ? '3. Break down the task into 3-5 actionable "subtasks".'
      : '3. Do NOT generate subtasks. Return an empty array [] for "subtasks".';
    const subtaskFormat = policies.enable_auto_subtasks
      ? '["Step 1", "Step 2", "Step 3"]'
      : '[]';

    const promptStr = `You are a helpful project manager AI. Today is ${todayStr}.
The user currently logged in is "@${currentUser}".
The user wants to create a new task: "${aiPrompt}".
1. Extract the details into a JSON object.
2. "project_name" MUST ALWAYS be in English. "description" MUST be in the SAME LANGUAGE the user used (e.g., if the prompt is in Indonesian, write the description and notes in Indonesian).
${subtaskInstruction}
4. Determine the "requester" field. If the task is ASSIGNED TO someone, use an '@' prefix (e.g., "@budi"). If someone else REQUESTED the task for you to do, write their name WITHOUT the '@' prefix (e.g., "Robert"). If the user implies the task is for themselves to do, use "@${currentUser}".
5. Find the closest "category" from: [${categories.join(
      ', '
    )}]. If nothing fits, create a new short relevant category name.
6. Extract any URLs/links from the prompt into "supporting_access" (separated by newline).
7. Calculate "start_date" and "deadline" (YYYY-MM-DD) based on relative time mentioned (e.g., 'tomorrow', 'next week').
8. Determine "impact" (High/Medium/Low) based on urgency, and "recurring" (none/daily/weekly/monthly).
9. Return ONLY valid JSON without any markdown formatting.

Format:
{
  "project_name": "[Brand/Context] Short, clear task title",
  "requester": "Assignee with '@' prefix OR Requester name without '@'",
  "category": "Category name",
  "description": "Well-structured description using markdown",
  "supporting_access": "URLs if any, else empty string",
  "start_date": "YYYY-MM-DD",
  "deadline": "YYYY-MM-DD",
  "impact": "High/Medium/Low",
  "etc": Estimated time in hours as a number (e.g. 2.5),
  "recurring": "none/daily/weekly/monthly",
  "subtasks": ${subtaskFormat}
}`;

    try {
      const res = await axios.post('/api/ai/generate', {
        prompt: promptStr,
        prompt_type: policies.enable_auto_subtasks ? 'subtask' : 'general',
        provider: 'auto'
      });
      let jsonStr = res.data.text
        .trim()
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}') + 1;
      if (startIdx >= 0 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx);
      }
      const parsed = JSON.parse(jsonStr);

      setFormData({
        ...formData,
        project_name: parsed.project_name || '',
        requester: parsed.requester || formData.requester,
        category: parsed.category || categories[0] || 'Other',
        description: parsed.description || '',
        supporting_access: parsed.supporting_access || '',
        start_date: parsed.start_date || formData.start_date,
        deadline: parsed.deadline || formData.deadline,
        impact: parsed.impact || 'Medium',
        etc: parsed.etc !== undefined ? parseFloat(parsed.etc) : 2.0,
        recurring: parsed.recurring || 'none',
      });

      if (policies.enable_auto_subtasks && parsed.subtasks && Array.isArray(parsed.subtasks) && setFormSubtasks) {
        setFormSubtasks(parsed.subtasks.map((name) => ({ task_name: name, assignee: null })));
      } else if (!policies.enable_auto_subtasks && setFormSubtasks) {
        setFormSubtasks([]);
      }
    } catch (err) {
      console.error(err);
      showAlert(
        language === 'id' ? 'Gagal menyusun tugas dengan Asisten Pintar.' : 'Failed to draft task with Smart Assistant.',
        tMsg('AI Drafting Failed', 'Gagal Menyusun Tugas AI'),
        'error'
      );
    } finally {
      setIsGeneratingTask(false);
      setFormMode('manual');
    }
  };

  const [isEstimatingEtc, setIsEstimatingEtc] = useState(false);
  const handleEstimateEtc = async () => {
    if (!formData.project_name) {
      showAlert(
        language === 'id' ? 'Silakan masukkan judul tugas terlebih dahulu.' : 'Please enter a task name first.',
        tMsg('Task Title Required', 'Judul Tugas Diperlukan'),
        'warning'
      );
      return;
    }
    setIsEstimatingEtc(true);
    try {
      const prompt = `Estimate the time consumption in hours to complete this task based on its title and description. Task Title: "${
        formData.project_name
      }". Description: "${
        formData.description || ''
      }". Return ONLY a number (e.g. 2.5, 4, 10). Do not include any other text.`;
      const res = await axios.post('/api/ai/generate', { prompt, provider: 'auto' });
      const match = res.data.text.match(/[\d.]+/);
      const val = match ? parseFloat(match[0]) : NaN;
      if (!isNaN(val)) {
        setFormData({ ...formData, etc: val });
      }
    } catch (err) {
      console.error(err);
      showAlert(
        language === 'id' ? 'Gagal mengestimasi waktu pengerjaan tugas.' : 'Failed to estimate task time.',
        tMsg('Estimation Failed', 'Gagal Estimasi Waktu'),
        'error'
      );
    } finally {
      setIsEstimatingEtc(false);
    }
  };

  const getLocalToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
      2,
      '0'
    )}`;
  };

  const handleCancel = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      project_name: '',
      requester: '',
      category: categories[0] || 'Development',
      description: '',
      supporting_access: '',
      start_date: getLocalToday(),
      deadline: getLocalToday(),
      etc: 2,
      impact: 'Medium',
      recurring: 'none',
      auto_nudge: false,
    }));
    setFormSubtasks([]);
    setFormSubtaskInput('');
    setFormSubtaskAssignee('');
    close();
  }, [categories, setFormData, setFormSubtasks, setFormSubtaskInput, setFormSubtaskAssignee, close]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalPopup) {
          e.preventDefault();
          e.stopPropagation();
          setModalPopup(null);
        } else if (!isMentioning) {
          handleCancel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMentioning, handleCancel, modalPopup]);

  const globalMentionOptions = selectedBoard?.is_private
    ? [currentUser]
    : userDirectory && userDirectory.length > 0
    ? userDirectory
        .filter((u) => u.is_connected)
        .map((u) => u.username)
        .filter((u) => u !== 'admin')
    : teamMembers;

  return (
    <div
      className={`fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-white dark:bg-neutral-950 shadow-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl md:rounded-[2.5rem] w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden ${
          isClosing ? 'mac-exit' : 'mac-animate'
        }`}
      >
        <div className="flex justify-between items-center p-5 sm:p-8 md:px-12 md:py-8 border-b border-neutral-200 dark:border-neutral-800 shrink-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-20">
          <h2 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-2 sm:gap-3">
            {formMode === 'ai' ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            ) : (
              <IconPlus className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
            {formMode === 'ai' ? tMsg('Smart Assistant', 'Asisten Pintar') : tMsg('Add Task', 'Tugas Baru')}
          </h2>
          <button
            onClick={handleCancel}
            className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {formMode === 'ai' ? (
          <div
            className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-12 flex flex-col items-center text-center custom-scrollbar"
            style={{ animation: 'elegant-fade-up 0.6s ease forwards' }}
          >
            <h3 className="text-2xl sm:text-4xl font-black text-black dark:text-white mb-3 tracking-tight">
              {tMsg('Describe your request', 'Ceritakan tugas yang ingin dibuat')}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-lg text-sm font-medium">
              {tMsg(
                'Type your task description freely. The Smart Assistant will structure the details, deadlines, and checklists for you.',
                'Ketik deskripsi tugas Anda secara bebas. Asisten Pintar akan menyusun detail, tenggat waktu, dan daftar periksanya.'
              )}
            </p>

            <div className="w-full relative max-w-2xl tour-form-ai-input">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiSubmit(e);
                  }
                }}
                disabled={isGeneratingTask}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-black rounded-3xl p-6 text-sm font-medium outline-none resize-none shadow-inner transition-all h-40 custom-scrollbar text-black dark:text-white"
                placeholder={tMsg(
                  'e.g. Prepare social media campaign for next Friday...',
                  'Contoh: Siapkan kampanye sosial media untuk Jumat depan...'
                )}
                autoFocus
              />
              {isGeneratingTask && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center">
                  <LoadingSpinner />
                  <span className="text-xs font-bold text-indigo-600 mt-3 animate-pulse">
                    {tMsg('Drafting Task...', 'Menyusun Tugas...')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-2xl">
              <button
                type="button"
                onClick={() => {
                  setFormMode('manual');
                  if (handleManualFormClick) handleManualFormClick();
                }}
                disabled={isGeneratingTask}
                className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold py-4 rounded-full text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shadow-sm disabled:opacity-50 tour-form-manual-btn"
              >
                {tMsg('Just Fill Manually', 'Isi Manual Saja')}
              </button>
              <button
                type="button"
                onClick={handleAiSubmit}
                disabled={!aiPrompt.trim() || isGeneratingTask}
                className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-full text-xs hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                <span>{tMsg('Draft with AI', 'Buat dengan AI')}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 animate-elegant">
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:px-12 md:py-8 custom-scrollbar">
              <div className="mb-8">
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full text-lg font-extrabold bg-transparent border-0 border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 px-0 py-3 text-black dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 transition-colors outline-none tour-form-project"
                  placeholder={tMsg('Enter task name...', 'Masukkan judul tugas...')}
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6 mb-6 relative z-50">
                  <div className="sm:col-span-2 group tour-form-requester relative z-50">
                    <label className="flex items-center gap-2 mb-2 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {tMsg('Assignee / Requester', 'Pekerja / Peminta')}
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center relative h-11.5 sm:h-12.5">
                      <input
                        type="text"
                        value={formData.requester}
                        onChange={(e) => handleRequesterChange(e.target.value, setFormData, formData)}
                        onKeyDown={(e) => {
                          if (isMentioning) {
                            const filtered = globalMentionOptions.filter((m) => m.toLowerCase().includes(mentionQuery));
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setMentionIndex((prev) => (prev + 1) % (filtered.length || 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setMentionIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
                            } else if (e.key === 'Enter' || e.key === 'Tab') {
                              if (filtered.length > 0) {
                                e.preventDefault();
                                insertMention(filtered[mentionIndex] || filtered[0], setFormData, formData);
                              } else {
                                setIsMentioning(false);
                              }
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsMentioning(false);
                            }
                          }
                        }}
                        className="w-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white outline-none placeholder-neutral-400 placeholder:text-[9px] sm:placeholder:text-[10px] h-full"
                        placeholder={tMsg(
                          'Requester name (or type @ to assign someone)',
                          'Nama peminta (atau ketik @ untuk menugaskan)'
                        )}
                        required
                        autoComplete="off"
                      />

                      {isMentioning && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2 mac-animate">
                          {globalMentionOptions.filter((m) => m.toLowerCase().includes(mentionQuery)).length > 0 ? (
                            globalMentionOptions
                              .filter((m) => m.toLowerCase().includes(mentionQuery))
                              .map((m, idx) => (
                                <div
                                  key={m}
                                  ref={(el) => {
                                    if (mentionIndex === idx && el) {
                                      el.scrollIntoView({ block: 'nearest' });
                                    }
                                  }}
                                  className={`px-4 py-3 cursor-pointer text-xs text-black dark:text-white font-bold border-b border-neutral-200 dark:border-neutral-800 last:border-0 flex items-center gap-2 ${
                                    mentionIndex === idx
                                      ? 'bg-neutral-200 dark:bg-neutral-800'
                                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                  }`}
                                  onClick={() => insertMention(m, setFormData, formData)}
                                >
                                  <span>@{m}</span>
                                  {!teamMembers.includes(m) && (
                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold ml-auto">
                                      + Auto-Invite
                                    </span>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="px-4 py-3 text-xs text-neutral-400 font-bold">
                              {tMsg('No members found', 'Tidak ada anggota ditemukan')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Project Selector */}
                  <div className="sm:col-span-3 group">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {tMsg('Target Project', 'Proyek Tujuan')}
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center h-11.5 sm:h-12.5">
                      <select
                        value={formData.board_id || (selectedBoard && selectedBoard.id !== 'global' ? selectedBoard.id : (boards.find((b) => b.id !== 'global')?.id || ''))}
                        onChange={(e) => setFormData({ ...formData, board_id: e.target.value })}
                        className="w-full h-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white cursor-pointer outline-none truncate [&>option]:bg-white dark:[&>option]:bg-neutral-950"
                      >
                        {boards.filter((b) => b.id !== 'global').map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} {b.is_private ? `(${tMsg('Private', 'Privat')})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2 group">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                      {tMsg('Category', 'Kategori')}
                    </label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center min-w-0 h-11.5 sm:h-12.5">
                        <select
                          value={formData.category || categories[0] || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full h-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white cursor-pointer outline-none truncate [&>option]:bg-white dark:[&>option]:bg-neutral-950"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                          {formData.category &&
                            !categories.some((c) => c.toLowerCase() === formData.category.toLowerCase()) && (
                              <option value={formData.category}>{formData.category} ({tMsg('Custom', 'Kustom')})</option>
                            )}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAddBoard('Category')}
                        className="bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 px-3 sm:px-4 rounded-2xl transition-colors text-sm font-bold flex items-center justify-center shrink-0 shadow-sm h-11.5 sm:h-12.5 cursor-pointer"
                        title={tMsg('Add New Category', 'Tambah Kategori Baru')}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-1 group">
                    <label className="flex items-center gap-2 min-h-4 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                      {tMsg('Priority', 'Prioritas')}
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center h-11.5 sm:h-12.5">
                      <select
                        value={formData.impact || 'Medium'}
                        onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                        className="w-full h-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white cursor-pointer outline-none [&>option]:bg-white dark:[&>option]:bg-neutral-950"
                      >
                        <option value="High">{tMsg('High', 'Tinggi')}</option>
                        <option value="Medium">{tMsg('Medium', 'Sedang')}</option>
                        <option value="Low">{tMsg('Low', 'Rendah')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 min-h-4 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {tMsg('Start Date', 'Tanggal Mulai')}
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center h-11.5 sm:h-12.5">
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white cursor-pointer outline-none h-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="group tour-form-deadline">
                    <label className="flex items-center gap-2 min-h-4 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {tMsg('Deadline', 'Tenggat Waktu')}
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center h-11.5 sm:h-12.5">
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white cursor-pointer outline-none h-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 min-h-4 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                      {tMsg('Recurring', 'Berulang')}
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center h-11.5 sm:h-12.5">
                      <select
                        value={formData.recurring || 'none'}
                        onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                        className="w-full h-full bg-transparent border-0 focus:ring-0 p-3.5 text-xs font-bold text-black dark:text-white cursor-pointer outline-none [&>option]:bg-white dark:[&>option]:bg-neutral-950"
                      >
                        <option value="none">{tMsg('None', 'Tidak')}</option>
                        <option value="daily">{tMsg('Daily', 'Harian')}</option>
                        <option value="weekly">{tMsg('Weekly', 'Mingguan')}</option>
                        <option value="monthly">{tMsg('Monthly', 'Bulanan')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-1.5 min-h-4 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{tMsg('Time (Hrs)', 'Waktu (Jam)')}</span>
                      <span className="relative group/etc-tip inline-flex items-center cursor-help">
                        <svg className="w-3 h-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/etc-tip:block px-2 py-1 text-[9px] font-medium text-white bg-neutral-900 dark:bg-neutral-800 rounded shadow-md whitespace-nowrap z-50">
                          {tMsg('Estimated time in hours', 'Estimasi waktu dalam jam')}
                        </span>
                      </span>
                    </label>
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center p-1.5 h-11.5 sm:h-12.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, etc: Math.max(0, (parseFloat(formData.etc) || 0) - 0.5) })
                        }
                        className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl font-bold transition-colors shrink-0 cursor-pointer"
                        title={tMsg('Decrease by 0.5h', 'Kurangi 0.5 jam')}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.etc}
                        onChange={(e) => setFormData({ ...formData, etc: e.target.value })}
                        className="w-full min-w-0 text-center bg-transparent border-0 focus:ring-0 p-0 text-xs font-bold text-black dark:text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, etc: (parseFloat(formData.etc) || 0) + 0.5 })}
                        className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl font-bold transition-colors shrink-0 cursor-pointer"
                        title={tMsg('Increase by 0.5h', 'Tambah 0.5 jam')}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={handleEstimateEtc}
                        disabled={isEstimatingEtc}
                        className="w-7 h-7 ml-1 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                        title={tMsg('AI Time Estimation', 'Estimasi Waktu AI')}
                      >
                        {isEstimatingEtc ? (
                          <svg className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {policies.enable_proactive_nudge && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <input
                      type="checkbox"
                      id="modal-auto-nudge"
                      checked={!!formData.auto_nudge}
                      onChange={(e) => setFormData({ ...formData, auto_nudge: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                    <label htmlFor="modal-auto-nudge" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer flex items-center gap-1.5 select-none">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">notifications_active</span>
                      <span>{tMsg('Enable AI Proactive Nudge for this task', 'Aktifkan Pengingat AI Otomatis untuk tugas ini')}</span>
                    </label>
                  </div>
                )}

                <div className="group pt-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {tMsg('Description', 'Deskripsi')}
                  </label>
                  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all p-2">
                    <div className="flex gap-2 mb-2 px-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, description: formData.description + '**bold text**' })
                        }
                        className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, description: formData.description + '*italic text*' })
                        }
                        className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, description: formData.description + '__underline__' })
                        }
                        className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 underline"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, description: formData.description + '\n- list item' })
                        }
                        className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-black rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateDesc}
                        disabled={isGeneratingDesc}
                        className="ml-auto text-[10px] font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md shadow-sm border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isGeneratingDesc ? (
                          <>
                            <svg className="w-3 h-3 animate-spin text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                            <span>{tMsg('Generating...', 'Membuat...')}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                            <span>{tMsg('Auto Generate', 'Buat Otomatis')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-transparent border-0 focus:ring-0 p-3.5 text-sm font-medium text-black dark:text-white min-h-25 resize-y outline-none placeholder-neutral-400 leading-relaxed"
                      placeholder={tMsg('Add details or notes...', 'Tambahkan detail atau catatan...')}
                    ></textarea>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2 ml-4 font-medium italic">
                    {tMsg(
                      'Rich text supported: **bold**, *italic*, __underline__, and new lines starting with "- " for bullets.',
                      'Dukungan teks kaya: **tebal**, *miring*, __garis bawah__, dan baris baru dengan "- " untuk poin.'
                    )}
                  </p>
                </div>

                <div className="group pt-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-2">
                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    {tMsg('External Links / References', 'Tautan Eksternal / Referensi')}
                  </label>
                  <div className="flex flex-col gap-2 w-full min-w-0">
                    {(formData.supporting_access ? formData.supporting_access.split('\n') : ['']).map(
                      (link, idx, arr) => (
                        <div key={idx} className="flex items-center gap-2 w-full min-w-0">
                          <div className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-neutral-300 dark:focus-within:border-neutral-700 focus-within:bg-white dark:focus-within:bg-black transition-all flex items-center">
                            <input
                              type="url"
                              value={link}
                              onChange={(e) => {
                                const newLinks = [...arr];
                                newLinks[idx] = e.target.value;
                                setFormData({ ...formData, supporting_access: newLinks.join('\n') });
                              }}
                              className="w-full bg-transparent border-0 focus:ring-0 p-3.5 text-sm font-medium text-black dark:text-white outline-none placeholder-neutral-400"
                              placeholder={tMsg('Paste URL (<https://...)>', 'Tempel URL (<https://...)>')}
                            />
                          </div>
                          {arr.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newLinks = arr.filter((_, i) => i !== idx);
                                setFormData({ ...formData, supporting_access: newLinks.join('\n') });
                              }}
                              className="text-neutral-400 hover:text-red-500 p-2 transition-colors cursor-pointer"
                              title={tMsg('Remove Link', 'Hapus Tautan')}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const arr = formData.supporting_access ? formData.supporting_access.split('\n') : [''];
                        setFormData({ ...formData, supporting_access: [...arr, ''].join('\n') });
                      }}
                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 self-start mt-1 flex items-center gap-1.5 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      {tMsg('Add Another Link', 'Tambah Tautan Lainnya')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="group pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800 tour-form-checklist">
                <label className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white mb-4">
                  <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  {tMsg('Sub-task Checklist', 'Daftar Periksa Sub-tugas')}
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input
                    type="text"
                    value={formSubtaskInput}
                    onChange={(e) => setFormSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFormSubtask(e);
                      }
                    }}
                    className="flex-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-transparent p-3.5 text-sm font-medium text-black dark:text-white outline-none placeholder-neutral-400 focus:bg-white dark:focus:bg-black focus:border-neutral-300 dark:focus-neutral-700 transition-all"
                    placeholder={tMsg('Add checklist item...', 'Tambah item daftar periksa...')}
                  />
                  <select
                    value={formSubtaskAssignee}
                    onChange={(e) => setFormSubtaskAssignee(e.target.value)}
                    className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-transparent p-3.5 text-sm font-medium text-black dark:text-white outline-none focus:bg-white dark:focus:bg-black focus:border-neutral-300 dark:focus:border-neutral-700 transition-all normal-case tracking-normal [&>option]:bg-white dark:[&>option]:bg-neutral-950 [&>option]:text-black dark:[&>option]:text-white"
                  >
                    <option value="">{tMsg('Unassigned', 'Belum Ditugaskan')}</option>
                    {teamMembers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddFormSubtask}
                    className="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md hover:-translate-y-0.5"
                  >
                    {tMsg('Add', 'Tambah')}
                  </button>
                </div>

                {formSubtasks.length > 0 && (
                  <div className="space-y-3 mt-4 max-h-40 overflow-y-auto pr-2">
                    {formSubtasks.map((st, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 px-5 py-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 group/item transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 wrap-break-word">
                          <span className="w-4 h-4 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-black shrink-0"></span>
                          <span className="text-sm font-medium text-black dark:text-white">{st.task_name}</span>
                          {st.assignee && (
                            <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/50">
                              @{st.assignee}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFormSubtask(i)}
                          className="text-neutral-400 hover:text-red-500 opacity-100 md:opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 cursor-pointer"
                          title={tMsg('Delete Subtask', 'Hapus Sub-tugas')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 sm:p-8 md:px-12 md:py-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 z-10">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm transition-colors text-xs"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-10 py-4 rounded-full font-bold text-white transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-black dark:border-white ${
                  isSubmitting
                    ? 'bg-neutral-600 dark:bg-neutral-400 dark:text-neutral-900 border-neutral-600 dark:border-neutral-400'
                    : 'bg-black dark:bg-white dark:text-black hover:opacity-80 hover:-translate-y-0.5 tour-form-submit'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner /> {tMsg('Creating...', 'Membuat...')}
                  </>
                ) : (
                  tMsg('Create Task', 'Buat Tugas')
                )}
              </button>
            </div>
          </form>
        )}

        {/* Custom In-Modal Alert / Confirm Dialog */}
        {modalPopup && (
          <div
            className="fixed inset-0 bg-neutral-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-70 p-4 transition-opacity duration-200 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalPopup(null);
            }}
          >
            <div
              className="bg-white dark:bg-neutral-950 p-6 sm:p-8 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl md:rounded-[2.5rem] text-center mac-animate"
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border ${
                  modalPopup.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-800/50'
                    : modalPopup.type === 'info'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border-indigo-200 dark:border-indigo-800/50'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-200 dark:border-amber-800/50'
                }`}
              >
                {modalPopup.type === 'error' ? (
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                  </svg>
                ) : modalPopup.type === 'info' ? (
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">
                {modalPopup.title}
              </h3>

              <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-xs sm:text-sm font-medium leading-relaxed">
                {modalPopup.message}
              </p>

              <div className="flex justify-center gap-3">
                {modalPopup.onConfirm ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        modalPopup.onCancel?.();
                        setModalPopup(null);
                      }}
                      className="flex-1 px-4 py-3.5 rounded-full font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 uppercase tracking-widest text-[10px] sm:text-xs transition-colors cursor-pointer"
                    >
                      {modalPopup.cancelText || tMsg('Cancel', 'Batal')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        modalPopup.onConfirm();
                        setModalPopup(null);
                      }}
                      className="flex-1 px-4 py-3.5 rounded-full font-bold text-white bg-black dark:bg-white dark:text-black hover:opacity-90 shadow-md uppercase tracking-widest text-[10px] sm:text-xs transition-all cursor-pointer hover:-translate-y-0.5"
                    >
                      {modalPopup.confirmText || tMsg('Confirm', 'Konfirmasi')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalPopup(null)}
                    className="w-full px-6 py-3.5 rounded-full font-bold text-white bg-black dark:bg-white dark:text-black hover:opacity-90 shadow-md uppercase tracking-widest text-[10px] sm:text-xs transition-all cursor-pointer hover:-translate-y-0.5"
                    autoFocus
                  >
                    {modalPopup.confirmText || tMsg('Understood', 'Mengerti')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
