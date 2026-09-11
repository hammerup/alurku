import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { renderRichText } from '../../Utils';

const AI_MODEL = 'auto'; // Use auto-fallback: Gemini first, then Groq if Gemini fails

export default function MoMNotepadModal({
  onClose,
  currentUser,
  boards,
  categories,
  fetchTasks,
  showNotification,
  userDirectory = [],
  isSuperAdmin = false,
}) {
  const [activeTab, setActiveTab] = useState('editor');
  const [textWrap, setTextWrap] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle

  // Meeting Details
  const [meetingDate, setMeetingDate] = useState(() => {
    const today = new Date();
    return localStorage.getItem('alurku_mom_date') || today.toISOString().split('T')[0];
  });
  const [meetingTime, setMeetingTime] = useState(() => {
    const now = new Date();
    return localStorage.getItem('alurku_mom_time') || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [meetingLocation, setMeetingLocation] = useState(() => localStorage.getItem('alurku_mom_location') || '');
  const [meetingContext, setMeetingContext] = useState(() => localStorage.getItem('alurku_mom_context') || '');

  // Notion-like Blocks State
  const [blocks, setBlocks] = useState(() => {
    const saved = localStorage.getItem('alurku_mom_blocks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'b1', type: 'heading-1', content: 'Meeting Title' },
      { id: 'b2', type: 'paragraph', content: 'Type your meeting notes here. Press Enter to create a new block.' },
      { id: 'b3', type: 'todo', content: 'Write down action items', completed: false },
      { id: 'b4', type: 'bullet', content: 'Discuss project timelines' }
    ];
  });

  // AI & Processing States - cache results to avoid re-generation
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedMoM, setGeneratedMoM] = useState('');
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [targetBoardId, setTargetBoardId] = useState('');
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Compute allowed team members using same rules as TaskFormModal / SmartAssistant:
  // - isSuperAdmin → show all connected users
  // - normal user → only connected users
  // - never show 'admin' system account
  const allowedMembers = (userDirectory || [])
    .filter(u => (isSuperAdmin || u.is_connected) && u.username !== 'admin' && u.username !== currentUser)
    .map(u => u.username);

  // Include currentUser at the top so self-mention works
  const mentionableMembers = [currentUser, ...allowedMembers];

  // Mention Dropdown State
  const [mention, setMention] = useState({
    isOpen: false,
    query: '',
    field: null,      // 'context' | blockId string
    selectedIdx: 0,
    rect: null        // bounding rect of the triggering textarea
  });

  const blockRefs = useRef({});
  const contextRef = useRef(null);
  const dropdownRef = useRef(null);

  // Auto-save
  useEffect(() => { localStorage.setItem('alurku_mom_date', meetingDate); }, [meetingDate]);
  useEffect(() => { localStorage.setItem('alurku_mom_time', meetingTime); }, [meetingTime]);
  useEffect(() => { localStorage.setItem('alurku_mom_location', meetingLocation); }, [meetingLocation]);
  useEffect(() => { localStorage.setItem('alurku_mom_context', meetingContext); }, [meetingContext]);
  useEffect(() => { localStorage.setItem('alurku_mom_blocks', JSON.stringify(blocks)); }, [blocks]);

  // Default board
  useEffect(() => {
    if (boards?.length > 0 && !targetBoardId) {
      const first = boards.find(b => b.id !== 'global');
      if (first) setTargetBoardId(first.id);
    }
  }, [boards]);

  // Close mention on outside click
  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMention(prev => ({ ...prev, isOpen: false }));
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Filter mention suggestions (uses mentionableMembers, respects query)
  const filteredMembers = mention.isOpen
    ? mentionableMembers.filter(m => {
        if (!mention.query) return false;
        return m.toLowerCase().startsWith(mention.query.toLowerCase());
      })
    : [];

  const openMention = (query, field, el) => {
    const rect = el?.getBoundingClientRect() || null;
    setMention({ isOpen: true, query, field, selectedIdx: 0, rect });
  };

  const closeMention = () => setMention(prev => ({ ...prev, isOpen: false }));

  const detectMention = (text, cursorPos, field, el) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/@([\w.-]*)$/);
    if (match) {
      openMention(match[1], field, el);
    } else {
      closeMention();
    }
  };

  const applyMention = (username) => {
    const { field, query } = mention;

    const replace = (original, cursorPos, setter) => {
      const before = original.slice(0, cursorPos);
      const after = original.slice(cursorPos);
      const prefixEnd = before.lastIndexOf('@');
      const newText = before.slice(0, prefixEnd) + `@${username} ` + after;
      setter(newText);
      return prefixEnd + username.length + 2;
    };

    if (field === 'context') {
      const el = contextRef.current;
      if (!el) return;
      const newPos = replace(meetingContext, el.selectionStart, setMeetingContext);
      setTimeout(() => { el.focus(); el.setSelectionRange(newPos, newPos); }, 30);
    } else {
      const block = blocks.find(b => b.id === field);
      const el = blockRefs.current[field];
      if (!block || !el) return;
      const cursorPos = el.selectionStart;
      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);
      const prefixEnd = before.lastIndexOf('@');
      const newContent = before.slice(0, prefixEnd) + `@${username} ` + after;
      updateBlock(field, { content: newContent });
      const newPos = prefixEnd + username.length + 2;
      setTimeout(() => { el.focus(); el.setSelectionRange(newPos, newPos); }, 30);
    }
    closeMention();
  };

  // ── Block helpers ─────────────────────────────────────────────────
  const updateBlock = (id, newFields) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...newFields } : b));
  };

  const handleBlockKeyDown = (e, index, block) => {
    // Intercept navigation keys when mention dropdown is open
    if (mention.isOpen && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMention(prev => ({ ...prev, selectedIdx: (prev.selectedIdx + 1) % filteredMembers.length }));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMention(prev => ({ ...prev, selectedIdx: (prev.selectedIdx - 1 + filteredMembers.length) % filteredMembers.length }));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyMention(filteredMembers[mention.selectedIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMention();
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const newId = 'block-' + Math.random().toString(36).substr(2, 9);
      const newBlock = {
        id: newId,
        type: block.type === 'todo' ? 'todo' : block.type === 'bullet' ? 'bullet' : 'paragraph',
        content: '',
        completed: false
      };
      const copy = [...blocks];
      copy.splice(index + 1, 0, newBlock);
      setBlocks(copy);
      setTimeout(() => blockRefs.current[newId]?.focus(), 50);
    } else if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      const prev = blocks[index - 1];
      setBlocks(blocks.filter(b => b.id !== block.id));
      if (prev) setTimeout(() => {
        const el = blockRefs.current[prev.id];
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      }, 50);
    } else if (e.key === 'ArrowUp' && !mention.isOpen && index > 0) {
      e.preventDefault();
      blockRefs.current[blocks[index - 1].id]?.focus();
    } else if (e.key === 'ArrowDown' && !mention.isOpen && index < blocks.length - 1) {
      e.preventDefault();
      blockRefs.current[blocks[index + 1].id]?.focus();
    }
  };

  const handleContextKeyDown = (e) => {
    if (mention.isOpen && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMention(prev => ({ ...prev, selectedIdx: (prev.selectedIdx + 1) % filteredMembers.length }));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMention(prev => ({ ...prev, selectedIdx: (prev.selectedIdx - 1 + filteredMembers.length) % filteredMembers.length }));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyMention(filteredMembers[mention.selectedIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMention();
      }
    }
  };

  const handleBlockTextChange = (id, text, el) => {
    // Slash commands
    const slashMap = { '/todo ': 'todo', '/bullet ': 'bullet', '/h1 ': 'heading-1', '/h2 ': 'heading-2', '/p ': 'paragraph' };
    for (const [cmd, type] of Object.entries(slashMap)) {
      if (text.startsWith(cmd)) {
        updateBlock(id, { type, content: text.slice(cmd.length), completed: type === 'todo' ? false : undefined });
        return;
      }
    }
    updateBlock(id, { content: text });
    detectMention(text, el.selectionStart, id, el);
  };

  const getFormattedNotes = () => blocks.map(b => {
    if (b.type === 'heading-1') return `# ${b.content}`;
    if (b.type === 'heading-2') return `## ${b.content}`;
    if (b.type === 'todo') return b.completed ? `- [x] ${b.content}` : `- [ ] ${b.content}`;
    if (b.type === 'bullet') return `- ${b.content}`;
    return b.content;
  }).join('\n');

  // ── AI Processing ──────────────────────────────────────────────────
  const handleRegenerate = () => {
    // Force a fresh generation by passing forceRegenerate=true
    setGeneratedMoM('');
    setExtractedTasks([]);
    setSelectedTasks({});
    processNotesWithAI(true);
  };

  const processNotesWithAI = async (forceRegenerate = false) => {
    const rawNotes = getFormattedNotes().trim();
    if (!rawNotes) {
      showNotification('Please add some notes before processing.', 'error');
      return;
    }

    // If we already have results cached AND not forced, just switch tabs
    if (!forceRegenerate && generatedMoM && extractedTasks.length > 0) {
      setActiveTab('review');
      return;
    }

    setIsProcessing(true);
    try {
      const participantsLine = meetingContext ? `\nPeserta & Peran: ${meetingContext}` : '';
      const details = `Tanggal: ${meetingDate}\nWaktu: ${meetingTime}\nLokasi: ${meetingLocation || 'Tidak Ditentukan'}${participantsLine}`;

      const momPrompt = `You are an expert Project Manager. Organize the following meeting details and raw notes into a professional Minutes of Meeting (MoM). Respond in the SAME language as the raw notes (Indonesian if notes are in Indonesian, English if in English).

STRICT RULES — violations are not allowed:
- Do NOT use markdown tables. Use bullet points, sub-bullets, and paragraphs only.
- The note taker is @${currentUser}. Resolve first-person pronouns ('I', 'me', 'saya', 'aku') and role references (e.g. 'PM', 'SEO') to '@${currentUser}'. Never write placeholders like '[Your Name]'.
- PARTICIPANTS SECTION: List ONLY participants explicitly mentioned in the notes or meeting details. If no participants are stated, write 'Tidak tercatat / Not recorded'. NEVER invent names, channels, Slack threads, or assignments not in the notes.
- FOOTNOTE / CLOSING: Do NOT add any notes about follow-up channels, Slack, or task distribution. End the MoM after the Action Items section.

MEETING DETAILS:
${details}

RAW NOTES:
${rawNotes}

Generate the MoM with EXACTLY these sections:
1. Detail Rapat (Tanggal, Waktu, Lokasi, Peserta)
2. Ringkasan Eksekutif
3. Poin Diskusi Utama
4. Action Items (daftar tugas yang perlu dilakukan)`;

      // Step 1: Generate MoM document
      const momRes = await axios.post('/api/ai/generate', { prompt: momPrompt, provider: AI_MODEL });
      setGeneratedMoM(momRes.data.text);

      // Wait at least 1.5s between AI calls to avoid the 1-second rate limit
      await new Promise(r => setTimeout(r, 1500));

      // Step 2: Extract tasks independently — a failure here must NOT block MoM display
      try {
        const extractPrompt = `Extract ALL action items from the following Minutes of Meeting (MoM). Return ONLY a raw JSON array — no markdown, no extra text.

RULES:
- project_name: SHORT and CONCISE task title, max 6 words. Do NOT copy full sentences from the MoM. Summarize the task intent only. Example: 'Revisi proposal anggaran Q3' or 'Setup staging environment'.
- requester: MUST be one of the exact usernames below. If a person is mentioned for a task, use their username. Default to '@${currentUser}' only if truly unspecified.
- deadline: Use the date stated in the MoM. If none stated, use '${meetingDate}'.
- description: 1-2 sentence summary of what needs to be done.

VALID TEAM MEMBERS (use ONLY these exact usernames):
${JSON.stringify(mentionableMembers)}

CURRENT USER: @${currentUser}
(If MoM refers to 'saya', 'aku', 'I', 'me', or their role, map to '@${currentUser}')

MINUTES OF MEETING:
${momRes.data.text}

If no action items found, return []. JSON Schema:
[{"project_name":"judul task singkat max 6 kata","requester":"@username","category":"Development|Design|Marketing|Research|Maintenance|Consulting|Other","deadline":"YYYY-MM-DD","description":"deskripsi singkat"}]`;

        const extractRes = await axios.post('/api/ai/generate', { prompt: extractPrompt, provider: AI_MODEL });
        let raw = extractRes.data.text.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
        const si2 = raw.indexOf('[');
        const ei2 = raw.lastIndexOf(']') + 1;
        if (si2 >= 0 && ei2 > si2) {
          let tasks = JSON.parse(raw.substring(si2, ei2));
          if (Array.isArray(tasks)) {
            // Normalize requesters: Ensure they start with @ and exist in mentionableMembers
            tasks = tasks.map(t => {
              let req = t.requester ? t.requester.trim() : '';
              if (req && !req.startsWith('@')) req = `@${req}`;
              
              const cleanUsername = req.substring(1).toLowerCase();
              const matched = mentionableMembers.find(m => m.toLowerCase() === cleanUsername);
              
              return {
                ...t,
                requester: matched ? `@${matched}` : `@${currentUser}`
              };
            });

            setExtractedTasks(tasks);
            const sel = {};
            tasks.forEach((_, i) => { sel[i] = true; });
            setSelectedTasks(sel);
          }
        }
      } catch (extractErr) {
        console.warn('Task extraction parse failed — MoM still available:', extractErr);
        setExtractedTasks([]);
      }

      setActiveTab('review');
    } catch (e) {
      console.error(e);
      showNotification('Failed to generate MoM with AI. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkCreateTasks = async () => {
    const toCreate = extractedTasks.filter((_, i) => selectedTasks[i]);
    if (toCreate.length === 0) { showNotification('Please select at least one task.', 'error'); return; }
    if (!targetBoardId) { showNotification('Please select a target project.', 'error'); return; }

    setIsCreatingTasks(true);
    let ok = 0;
    for (const t of toCreate) {
      try {
        const deadline = t.deadline
          ? (t.deadline.includes(' ') ? t.deadline : `${t.deadline} 17:00:00`)
          : `${meetingDate} 17:00:00`;
        const res = await axios.post(`/api/boards/${targetBoardId}/tasks`, {
          project_name: t.project_name || 'Untitled Task',
          requester: t.requester || `@${currentUser}`,
          category: t.category || 'Other',
          deadline,
          description: t.description ? `${t.description}\n\n*---\n🤖 Auto-extracted from MoM Notepad*` : '*🤖 Auto-extracted from MoM Notepad*',
          supporting_access: '',
          start_date: meetingDate,
          impact: 'Medium',
          etc: 2,
          auto_nudge: false,
          recurring: 'none',
          subtasks: []
        });
        if (res.status === 200 || res.status === 201) ok++;
        else console.warn('Task creation returned non-200:', res.status, res.data);
        await new Promise(r => setTimeout(r, 250));
      } catch (e) {
        console.error('Task creation failed:', e?.response?.data || e.message);
      }
    }
    setIsCreatingTasks(false);
    if (ok > 0) {
      showNotification(`Successfully created ${ok} task(s) in project!`, 'success');
      if (fetchTasks) fetchTasks();
      onClose();
    } else {
      showNotification('Failed to create tasks. Check console for details.', 'error');
    }
  };

  const handleCopyMoM = () => {
    const el = document.getElementById('rendered-mom-content');
    if (el) {
      try {
        navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([el.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([el.innerText], { type: 'text/plain' })
        })]).then(() => showNotification('MoM copied with formatting!', 'success'))
          .catch(() => { navigator.clipboard.writeText(generatedMoM); showNotification('MoM copied!', 'success'); });
      } catch { navigator.clipboard.writeText(generatedMoM); showNotification('MoM copied!', 'success'); }
    } else {
      navigator.clipboard.writeText(generatedMoM);
      showNotification('MoM copied!', 'success');
    }
  };

  const clearNotepad = () => {
    const now = new Date();
    const freshDate = now.toISOString().split('T')[0];
    const freshTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setBlocks([
      { id: 'b1', type: 'heading-1', content: '' },
      { id: 'b2', type: 'paragraph', content: '' }
    ]);
    setMeetingDate(freshDate);
    setMeetingTime(freshTime);
    setMeetingLocation('');
    setMeetingContext('');
    setGeneratedMoM('');
    setExtractedTasks([]);
    setSelectedTasks({});
    // Juga bersihkan localStorage agar state segar saat buka ulang
    localStorage.removeItem('alurku_mom_date');
    localStorage.removeItem('alurku_mom_time');
    localStorage.removeItem('alurku_mom_location');
    localStorage.removeItem('alurku_mom_context');
    localStorage.removeItem('alurku_mom_blocks');
    setShowConfirmClear(false);
    showNotification('Notepad berhasil dikosongkan.', 'info');
  };

  // ── Mention dropdown position (anchored near the active element) ───
  const MentionDropdown = ({ field }) => {
    if (!mention.isOpen || mention.field !== field || filteredMembers.length === 0) return null;
    return (
      <div
        ref={dropdownRef}
        className="absolute left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-200 overflow-hidden max-h-40 overflow-y-auto"
        style={{ top: '100%', marginTop: 4 }}
      >
        <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 text-[9px] font-black text-neutral-400 tracking-widest bg-neutral-50 dark:bg-neutral-950">
          Anggota tim — ↑↓ navigasi · Enter pilih
        </div>
        {filteredMembers.map((member, idx) => (
          <button
            key={member}
            onMouseDown={(e) => { e.preventDefault(); applyMention(member); }}
            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2 ${
              idx === mention.selectedIdx
                ? 'bg-indigo-600 text-white'
                : 'text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span className="opacity-60">@</span>{member}
          </button>
        ))}
      </div>
    );
  };

  // ── RENDER ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-150 p-2 sm:p-4 text-slate-800">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="border-b border-neutral-100 dark:border-neutral-800 px-4 py-3 sm:p-5 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-black dark:text-white tracking-tight truncate">
                Notepad Rapat & MoM
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-semibold tracking-wide hidden sm:block">
                Catat → AI buat MoM → buat tugas otomatis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {activeTab === 'editor' && (
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="md:hidden px-2.5 py-1.5 text-[10px] font-black text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all flex items-center gap-1"
              >
                {sidebarOpen ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Detail</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Detail</span>
                  </>
                )}
              </button>
            )}
            {activeTab === 'review' && (
              <button
                onClick={() => setActiveTab('editor')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Notepad</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-all text-sm font-bold shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white dark:bg-neutral-950">

          {activeTab === 'editor' ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">

              {/* ── Sidebar (desktop: always visible, mobile: collapsible) ── */}
              <div className={`${
                sidebarOpen ? 'flex' : 'hidden'
              } md:flex w-full md:w-72 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 p-4 sm:p-5 bg-neutral-50/30 dark:bg-neutral-900/10 overflow-y-auto md:max-h-full shrink-0 flex-col gap-3 sm:gap-4`}>
                <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Detail Rapat</h3>

                {/* Date & Time — side by side on mobile */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Tanggal</label>
                    <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                      className="w-full p-2 sm:p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Waktu</label>
                    <input type="time" value={meetingTime} onChange={e => setMeetingTime(e.target.value)}
                      className="w-full p-2 sm:p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Lokasi</label>
                  <input type="text" placeholder="cth. Ruang A, Google Meet" value={meetingLocation}
                    onChange={e => setMeetingLocation(e.target.value)}
                    className="w-full p-2 sm:p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500" />
                </div>

                {/* Participants (with mention support) */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                    Peserta & Peran
                  </label>
                  <textarea
                    ref={contextRef}
                    placeholder="cth. Bersama @budi dan @siti, saya sebagai PM"
                    value={meetingContext}
                    onChange={(e) => {
                      setMeetingContext(e.target.value);
                      detectMention(e.target.value, e.target.selectionStart, 'context', contextRef.current);
                    }}
                    onKeyDown={handleContextKeyDown}
                    rows={3}
                    className="w-full p-2 sm:p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none font-medium"
                  />
                  <span className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 block font-semibold">
                    Ketik @ untuk mention anggota tim
                  </span>
                  <MentionDropdown field="context" />
                </div>

                {/* Wrap Text toggle */}
                <div className="flex items-center justify-between bg-neutral-100/50 dark:bg-neutral-800/50 p-3 rounded-xl mt-auto">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Wrap Teks</span>
                  <button onClick={() => setTextWrap(!textWrap)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-all ${textWrap ? 'bg-indigo-600 justify-end' : 'bg-neutral-300 dark:bg-neutral-700 justify-start'}`}>
                    <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>

                {/* Clear */}
                <button onClick={() => setShowConfirmClear(true)}
                  className="w-full py-2.5 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 rounded-xl text-xs font-black tracking-wider transition-colors flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus Semua Catatan</span>
                </button>
              </div>

              {/* ── Block Editor ── */}
              <div className={`flex-1 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden ${
                sidebarOpen ? 'hidden md:flex' : 'flex'
              }`}>
                <div className={`flex-1 p-4 sm:p-8 overflow-y-auto ${!textWrap ? 'overflow-x-auto' : ''}`}>
                  <div className={`max-w-3xl mx-auto w-full space-y-3 pb-8 ${!textWrap ? 'min-w-200' : ''}`}>
                    {blocks.map((block, index) => (
                      <div key={block.id} className="flex items-start gap-3 group relative">

                        {/* Type picker on hover */}
                        <div className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select value={block.type} onChange={e => updateBlock(block.id, { type: e.target.value })}
                            className="text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 border-none rounded p-0.5 text-neutral-500 focus:outline-none">
                            <option value="paragraph">Text</option>
                            <option value="heading-1">H1</option>
                            <option value="heading-2">H2</option>
                            <option value="todo">To-do</option>
                            <option value="bullet">Bullet</option>
                          </select>
                        </div>

                        {block.type === 'todo' && (
                          <input type="checkbox" checked={block.completed || false}
                            onChange={e => updateBlock(block.id, { completed: e.target.checked })}
                            className="mt-1.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" />
                        )}
                        {block.type === 'bullet' && (
                          <span className="text-neutral-400 mt-0.5 text-lg shrink-0">•</span>
                        )}

                        {/* Wrapper for textarea + mention dropdown */}
                        <div className="relative flex-1" style={{ minWidth: !textWrap ? 'max-content' : '0' }}>
                          <textarea
                            ref={el => {
                              blockRefs.current[block.id] = el;
                              if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
                            }}
                            rows={1}
                            value={block.content}
                            onChange={e => {
                              handleBlockTextChange(block.id, e.target.value, e.target);
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={e => handleBlockKeyDown(e, index, block)}
                            placeholder={
                              block.type === 'heading-1' ? 'Judul Rapat' :
                              block.type === 'heading-2' ? 'Judul Seksi...' :
                              'Ketik di sini · /todo /bullet /h1 · @ untuk mention'
                            }
                            style={{ 
                              whiteSpace: textWrap ? 'pre-wrap' : 'pre', 
                              overflow: 'hidden', 
                              resize: 'none', 
                              height: 'auto',
                              width: textWrap ? '100%' : 'max-content',
                              minWidth: '100%' 
                            }}
                            className={`bg-transparent border-none p-0.5 focus:outline-none focus:ring-0 text-black dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 transition-all ${
                              block.type === 'heading-1' ? 'text-3xl font-black tracking-tight' :
                              block.type === 'heading-2' ? 'text-xl font-bold tracking-tight mt-3' :
                              block.type === 'todo' && block.completed ? 'line-through text-neutral-400 dark:text-neutral-500 text-sm font-medium' :
                              'text-sm font-medium'
                            }`}
                          />
                          <MentionDropdown field={block.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process button - always stays at bottom */}
                <div className="px-3 py-3 sm:p-5 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 sm:gap-4 shrink-0">
                  {generatedMoM && (
                    <button
                      onClick={() => setActiveTab('review')}
                      className="border border-indigo-400 text-indigo-600 dark:text-indigo-400 font-black px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all text-[10px] sm:text-xs  tracking-wider"
                    >
                      Lihat Hasil Sebelumnya →
                    </button>
                  )}
                  <button
                    onClick={generatedMoM ? handleRegenerate : processNotesWithAI}
                    disabled={isProcessing}
                    className="bg-black dark:bg-white text-white dark:text-black font-black px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-2xl hover:scale-105 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 sm:gap-3  tracking-wider text-[10px] sm:text-xs"
                  >
                    {isProcessing ? (
                      <><span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" /> AI sedang memproses...</>
                    ) : generatedMoM ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                        </svg>
                        <span>Buat Ulang dengan AI</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>Proses Catatan dengan AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            // ── Review Tab ──
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full">

              {/* Left: MoM — full on mobile, flex-1 on desktop */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 min-h-0">
                <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 inline-block bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-black  px-2.5 py-1 rounded-full">Langkah 1</span>
                    <h3 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-slate-200  tracking-widest truncate">Tinjau MoM yang Dibuat</h3>
                  </div>
                  <button onClick={handleCopyMoM}
                    className="shrink-0 text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-200/50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Salin</span>
                  </button>
                </div>
                <div id="rendered-mom-content"
                  className="prose dark:prose-invert max-w-none text-sm leading-relaxed p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm text-black dark:text-white whitespace-pre-wrap">
                  {renderRichText(generatedMoM)}
                </div>
              </div>

              {/* Right: Tasks — full width on mobile, fixed width sidebar on desktop */}
              <div className="w-full md:w-96 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-neutral-950 flex flex-col shrink-0 min-h-0 md:max-h-full">
                <div className="shrink-0 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-black  px-2.5 py-1 rounded-full">Langkah 2</span>
                    <h3 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-slate-200  tracking-widest">Buat Tugas</h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                    Pilih tugas · pilih proyek · klik Buat.
                  </p>
                </div>

                <div className="flex-1 space-y-2.5 sm:space-y-3 overflow-y-auto mb-4 sm:mb-6">
                  {extractedTasks.length > 0 ? extractedTasks.map((task, idx) => (
                    <div key={idx} className={`p-3 sm:p-4 border rounded-2xl flex items-start gap-3 transition-all ${
                      selectedTasks[idx] ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10' : 'border-neutral-200 dark:border-neutral-800 opacity-60'}`}>
                      <input type="checkbox" checked={selectedTasks[idx] || false}
                        onChange={e => setSelectedTasks(prev => ({ ...prev, [idx]: e.target.checked }))}
                        className="mt-1 w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" />
                      <div className="min-w-0 flex-1">
                        <input type="text" value={task.project_name}
                          onChange={e => { const u = [...extractedTasks]; u[idx].project_name = e.target.value; setExtractedTasks(u); }}
                          className="bg-transparent border-none p-0 focus:outline-none text-xs font-bold text-black dark:text-white w-full" />
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded font-black border border-neutral-200 dark:border-neutral-700 inline-flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{task.requester}</span>
                          </span>
                          <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded font-black border border-neutral-200 dark:border-neutral-700 inline-flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{task.deadline}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-neutral-400 text-xs">Tidak ada action item yang ditemukan.</div>
                  )}
                </div>

                {extractedTasks.length > 0 && (
                  <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4 sm:pt-5 space-y-3 shrink-0">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400  tracking-wider mb-1">Proyek Tujuan</label>
                      <select value={targetBoardId} onChange={e => setTargetBoardId(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500">
                        {boards.filter(b => b.id !== 'global').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <button onClick={handleBulkCreateTasks} disabled={isCreatingTasks}
                      className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-3 sm:py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 text-xs  tracking-wider flex items-center justify-center gap-1.5">
                      {isCreatingTasks ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Membuat Tugas...</span>
                        </>
                      ) : (
                        <span>Buat Tugas Terpilih</span>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Custom Confirmation Dialog Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-250 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-black text-black dark:text-white mb-2">Hapus Notepad</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mb-6 leading-relaxed">
              Yakin ingin menghapus semua catatan rapat? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-black  tracking-wider transition-colors flex-1"
              >
                Batal
              </button>
              <button
                onClick={clearNotepad}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black  tracking-wider transition-colors flex-1"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
