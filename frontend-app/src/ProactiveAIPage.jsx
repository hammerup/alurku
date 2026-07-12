import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCloseAnimation, LoadingSpinner } from './Utils';
import { Avatar } from './SharedUI';

export default function ProactiveAIPage({
  setIsProactiveAIOpen,
  boards,
  fetchBoards,
  setSelectedBoard,
  currentUser,
  language,
  setIsProjectChatOpen,
  setDrawerTab,
  setViewMode,
  fetchTasks,
  showNotification,
  userDirectory,
  formatDateMMM,
  avatarsMap,
  isDarkMode,
  setIsDarkMode,
  setLanguage,
}) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [inboxTasks, setInboxTasks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [targetBoard, setTargetBoard] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [privateWarningOpen, setPrivateWarningOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  const [isBoardMentioning, setIsBoardMentioning] = useState(false);
  const [boardMentionQuery, setBoardMentionQuery] = useState('');
  const [boardMentionIndex, setBoardMentionIndex] = useState(0);

  const tasksEndRef = useRef(null);
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const [isClosing, close] = useCloseAnimation(() => {
    setIsProactiveAIOpen(false);
  }, 200);

  // Shader Background Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId;

    const syncSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    window.addEventListener('resize', syncSize);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform int u_dark_mode;
      varying vec2 v_texCoord;

      float noise(vec2 p) {
          return sin(p.x * 1.5 + u_time * 0.2) * cos(p.y * 1.5 + u_time * 0.3) +
                 sin(p.y * 0.8 - u_time * 0.15) * cos(p.x * 1.2 + u_time * 0.25);
      }

      void main() {
          vec2 uv = v_texCoord;
          
          if (u_dark_mode == 1) {
              vec3 bgBase = vec3(0.035, 0.05, 0.086); // #090D16 - Dark Navy Void
              vec3 yellow = vec3(1.0, 0.84, 0.0);    // #FFD700 - Flat Yellow accent
              float n1 = noise(uv * 2.0 + vec2(u_time * 0.05, u_time * 0.02));
              float n2 = noise(uv * 1.5 - vec2(u_time * 0.03, u_time * 0.06));
              float aura = smoothstep(-0.5, 1.5, n1 + n2);
              vec3 color = mix(bgBase, mix(bgBase, yellow, 0.15), aura);
              float vignette = 1.0 - length(uv - 0.5) * 0.8;
              color *= vignette;
              gl_FragColor = vec4(color, 1.0);
          } else {
              vec3 bg = vec3(0.937, 0.957, 0.976);   // #eff4ff
              vec3 yellow = vec3(1.0, 0.95, 0.7);    // Lightened Alurku Yellow
              vec3 blue = vec3(0.85, 0.9, 1.0);      // Subtle blue
              float n1 = noise(uv * 1.8 + vec2(u_time * 0.04, u_time * 0.02));
              float n2 = noise(uv * 1.2 - vec2(u_time * 0.02, u_time * 0.04));
              float aura = smoothstep(-0.8, 1.2, n1 + n2);
              vec3 color = mix(bg, mix(blue, yellow, 0.4), aura * 0.25);
              gl_FragColor = vec4(color, 1.0);
          }
      }
    `;

    const cs = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uDarkMode = gl.getUniformLocation(prog, 'u_dark_mode');

    const render = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uDarkMode) gl.uniform1i(uDarkMode, isDarkMode ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };
    render(0);

    return () => {
      window.removeEventListener('resize', syncSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  // Prevent refresh when unsaved drafts exist
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (inboxTasks.length > 0 || generatedTasks.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [inboxTasks.length, generatedTasks.length]);

  useEffect(() => {
    if (isProcessing && generatedTasks.length > 0) {
      const timer = setTimeout(() => {
        tasksEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [generatedTasks, isProcessing, loadingText]);

  const initBoardRef = useRef(false);

  useEffect(() => {
    const initBoard = async () => {
      if (initBoardRef.current) return;
      initBoardRef.current = true;
      try {
        let board = boards.find((b) => b.name.toLowerCase() === 'to-do list');
        if (!board) {
          const resBoards = await axios.get('/api/boards');
          const currentBoards = resBoards.data.boards || [];
          board = currentBoards.find((b) => b.name.toLowerCase() === 'to-do list');
          if (!board) {
            const res = await axios.post('/api/boards', { name: 'To-do List', is_private: 1 });
            board = { id: res.data.board_id, name: res.data.board_name, is_private: 1 };
            if (fetchBoards) fetchBoards();
          }
        }
        if (board) setTargetBoard(board);
      } catch (e) {
        console.error(e);
      }
    };
    if (!targetBoard) initBoard();
  }, [boards, targetBoard, fetchBoards]);

  const getLocalToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
      2,
      '0'
    )}`;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setGeneratedTasks([]);
    setLoadingText(tMsg('Analyzing your request...', 'Menganalisis permintaan Anda...'));

    try {
      setLoadingText(tMsg('Structuring tasks...', 'Menyusun tugas-tugas...'));
      const currentYear = new Date().getFullYear();
      const aiPrompt = `Act as an Expert Project Manager. Your objective is to parse the user's request and output a strictly valid JSON array of tasks.

DOMAIN KNOWLEDGE: You possess deep contextual understanding of the field mentioned in the request. Use this to accurately estimate time and break down complex workflows into clear, actionable, professional-grade steps.

INSTRUCTIONS:
1. Read and analyze carefully the request from the user.
2. Delimiters: The user's request is enclosed in triple quotes (""").
3. Task Breakdown (Specific vs Generic):
   - BROAD / GENERIC GOAL: If the user's request is generic or broad (e.g., "Paid search", "SEO", "marketing campaign", "website redesign") and does NOT explicitly mention a specific assignee (@name), a specific deadline/due date, a specific project name (#ProjectName), or any highly specific single action, you MUST logically break it down into multiple actionable tasks (minimum 3 tasks), regardless of how few words the user prompt is.
   - SPECIFIC TASK: If it is a single specific action, explicitly assigns work (@name), or specifies a distinct project (#ProjectName), generate EXACTLY ONE task per each action.
4. Naming Convention (project_name):
   - Language: MUST ALWAYS be in English for task titles, regardless of the prompt's language.
   - Format: "[Context/Brand] Task Title". Extract the unique context prefix (e.g., brand, activity, or game title).
   - Numbering: When generating multiple tasks from a breakdown, you MUST prepend step numbers (e.g. "[Part 1] Task Title" or "1. Task Title") so the sequence and order of execution are clear.
5. Language Constraint: The "description" and "subtasks" fields MUST match the EXACT language used in the user's prompt. Make the explanation simple enough for a layperson.
6. Extract URLs: If there are any URLs or links (e.g. http://, https://) mentioned in the user's prompt, extract them into the "supporting_access" field (separated by newlines). DO NOT include or repeat these URLs inside the "description" field.
7. Output Format: Return ONLY a valid JSON array. DO NOT use markdown formatting blocks (\`\`\`json).

JSON SCHEMA:
[
  {
    "project_name": "[Context] Actionable Title in ENGLISH ONLY",
    "suggested_project": "Extract project name identified by '#' (e.g., '#WebsiteRedesign'). Leave empty if none.",
    "requester": "If assigning TO someone, use '@username' (e.g., '@budi'). If requested BY someone else, use their name without '@' (e.g., 'Mr. Smith'). Default to '@${currentUser}' if unspecified.",
    "category": "Identify the best category (e.g. Development, Design, Marketing). If none fit, create a short new category name in English.",
    "impact": "High, Medium, or Low",
    "deadline": "YYYY-MM-DD. Ensure year is ${currentYear} or later. Must be >= ${getLocalToday()}. Extract ONLY if explicitly mentioned, otherwise leave empty.",
    "auto_nudge": "Boolean. Return true ONLY if the user explicitly asks to be reminded or notified about this task. Otherwise false.",
    "etc": "Estimate the REALISTIC time consumption in hours (e.g. 0.5, 1, 1.5, 2.5, 3.0, 4.0, 8.0, 12.0). DO NOT default to 2. Base this heavily on the complexity of the task.",
    "description": "Highly detailed and comprehensive brief expanding on the user's request. Provide full context, background, and specific requirements in markdown format. DO NOT include @ or # routing tags here. DO NOT include any URLs or links here.",
    "supporting_access": "URLs/links found in the prompt (separated by newline). Leave empty if none.",
    "subtasks": ["Break down the task into 3-5 actionable sub-tasks as an array of strings. If not applicable, return an empty array []."]
  }
]

USER REQUEST:
"""${prompt}"""`;
      const resAi = await axios.post('/api/ai/generate', { prompt: aiPrompt, provider: 'auto' });
      let jsonStr = resAi.data.text
        .trim()
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const startIdx = jsonStr.indexOf('[');
      const endIdx = jsonStr.lastIndexOf(']') + 1;
      if (startIdx >= 0 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx);
      }
      const extractedTasks = JSON.parse(jsonStr);

      if (!Array.isArray(extractedTasks) || extractedTasks.length === 0) {
        throw new Error('No tasks generated');
      }

      setPrompt('');

      for (let i = 0; i < extractedTasks.length; i++) {
        setLoadingText(
          tMsg(
            `Drafting task ${i + 1} of ${extractedTasks.length}...`,
            `Menyusun tugas ${i + 1} dari ${extractedTasks.length}...`
          )
        );
        const delay = 1200 + Math.random() * 1000;
        await new Promise((res) => setTimeout(res, delay));

        let matchedBoardId = targetBoard?.id || '';
        if (extractedTasks[i].suggested_project) {
          const sp = extractedTasks[i].suggested_project.replace('#', '').toLowerCase().trim();
          let matched = boards.find((b) => b.name.toLowerCase() === sp);
          if (!matched) {
            matched = boards.find((b) => b.name.toLowerCase().includes(sp));
          }
          if (matched && matched.id !== 'global') {
            matchedBoardId = matched.id;
          }
        }

        setGeneratedTasks((prev) => [
          ...prev,
          {
            ...extractedTasks[i],
            id: Math.random().toString(),
            deadline: extractedTasks[i].deadline && extractedTasks[i].deadline !== '' ? extractedTasks[i].deadline : '',
            auto_nudge: extractedTasks[i].auto_nudge === true || extractedTasks[i].auto_nudge === 'true',
            selected: true,
            target_board_id: matchedBoardId,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      alert(tMsg('Failed to process request. Please try again.', 'Gagal memproses permintaan. Silakan coba lagi.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSelected = async () => {
    if (isSaving) return;
    const selected = generatedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    setIsSaving(true);

    const invalidTask = selected.find((t) => {
      const bId = t.target_board_id || targetBoard?.id;
      const b = boards.find((x) => String(x.id) === String(bId));
      const isPriv = b?.is_private === 1 || b?.name?.toLowerCase() === 'to-do list';
      const req = t.requester || '';
      const isAssignedToOther =
        req.startsWith('@') && req.replace('@', '').toLowerCase().trim() !== currentUser.toLowerCase();
      return isPriv && isAssignedToOther;
    });

    if (invalidTask) {
      setPrivateWarningOpen(true);
      setIsSaving(false);
      return;
    }

    const todayStr = getLocalToday();

    const newItems = selected.map((t) => {
      const bId = t.target_board_id || targetBoard?.id;
      const bObj = boards.find((x) => String(x.id) === String(bId));
      const isTodo = bObj?.name?.toLowerCase() === 'to-do list';
      const target_board_name = bObj?.name || 'Unknown Project';

      let dl = t.deadline || '';
      if (!dl && !isTodo) {
        dl = todayStr;
      }
      if (dl && new Date(dl) < new Date(todayStr)) {
        dl = todayStr;
      }
      const finalDeadline = dl ? `${dl} 17:00:00` : '';

      const reqString = t.requester || '';
      let autoInviteMsg = null;
      if (reqString.startsWith('@')) {
        const reqUsername = reqString.replace('@', '').toLowerCase().trim();
        if (reqUsername && reqUsername !== currentUser.toLowerCase() && bObj) {
          const isAlreadyMember = (bObj.team_preview || []).some(
            (memberUsername) => memberUsername.toLowerCase() === reqUsername
          );
          if (!isAlreadyMember) autoInviteMsg = `@${reqUsername}`;
        }
      }

      return { ...t, target_board_id: bId, target_board_name, finalDeadline, autoInviteMsg };
    });

    if (!isCartVisible) {
      setIsCartVisible(true);
      await new Promise((res) => setTimeout(res, 500));
    }

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      setProcessingId(item.id);
      await new Promise((res) => setTimeout(res, 600));

      setInboxTasks((prev) => [...prev, item]);
      setGeneratedTasks((prev) => prev.filter((task) => task.id !== item.id));
    }

    setProcessingId(null);
    setIsSaving(false);
  };

  const handleDeleteFromCart = async (taskToRemove) => {
    setInboxTasks((prev) => {
      const updated = prev.filter((item) => item.id !== taskToRemove.id);
      if (updated.length === 0) setIsCartVisible(false);
      return updated;
    });
  };

  const handleSkipOrCancel = () => {
    if (isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0) {
      setCancelConfirmOpen(true);
    } else {
      close();
    }
  };

  const confirmSkipOrCancel = () => {
    setIsCancelling(true);
    setInboxTasks([]);
    setGeneratedTasks([]);
    setIsCartVisible(false);
    setIsCancelling(false);
    setCancelConfirmOpen(false);
    close();
  };

  const handleFinish = async () => {
    if (isFinishing) return;
    if (inboxTasks.length === 0) {
      finishAndClose();
      return;
    }

    setIsFinishing(true);
    const error_messages = new Set();
    const todayStr = getLocalToday();
    let successCount = 0;

    for (let i = 0; i < inboxTasks.length; i++) {
      const t = inboxTasks[i];
      const bId = t.target_board_id || targetBoard?.id;

      const formattedData = {
        project_name: t.project_name,
        requester: t.requester || `@${currentUser}`,
        category: t.category || 'Other',
        deadline: t.finalDeadline,
        description: t.description + '\n\n*✨ Auto-generated by Smart Assistant*',
        supporting_access: t.supporting_access || '',
        start_date: todayStr,
        impact: t.impact || 'Medium',
        etc: t.etc || 2,
        auto_nudge: t.auto_nudge === true || t.auto_nudge === 'true',
        subtasks: Array.isArray(t.subtasks)
          ? t.subtasks.map((st) => (typeof st === 'string' ? { task_name: st, assignee: null } : st))
          : [],
      };

      try {
        await axios.post(`/api/boards/${bId}/tasks`, formattedData);
        successCount++;
      } catch (e) {
        console.error(e);
        const errorMsg =
          e.response?.data?.detail || `${tMsg('Failed to create task', 'Gagal membuat tugas')}: ${t.project_name}`;
        error_messages.add(errorMsg);
      }
    }

    setIsFinishing(false);

    if (error_messages.size > 0) {
      error_messages.forEach((msg) => {
        if (showNotification) showNotification(msg, 'error');
        else alert(msg);
      });
    }

    if (successCount > 0 && showNotification) {
      showNotification(
        tMsg(`Successfully created ${successCount} tasks!`, `Berhasil membuat ${successCount} tugas!`),
        'success'
      );
    }

    finishAndClose();
  };

  const finishAndClose = () => {
    if (targetBoard && inboxTasks.length > 0) {
      setSelectedBoard(targetBoard);
      if (setViewMode) setViewMode('list');
      if (fetchTasks) fetchTasks();
    }
    localStorage.setItem('alurku_ai_offer_docs', 'true');
    close();
    setTimeout(() => {
      if (setIsProjectChatOpen) setIsProjectChatOpen(true);
      if (setDrawerTab) setDrawerTab('assistant');
    }, 350);
  };

  const insertMention = (username) => {
    const newVal = prompt.replace(/(?:^|\s)@([\w.-]*)$/, ` @${username} `);
    setPrompt(newVal);
    setIsMentioning(false);
  };

  const insertBoardMention = (boardName) => {
    const newVal = prompt.replace(/(?:^|\s)#([\w\s.-]*)$/, ` #${boardName} `);
    setPrompt(newVal);
    setIsBoardMentioning(false);
  };

  const suggestions = [
    tMsg('Siapkan Draft Campaign', 'Siapkan Draft Campaign'),
    tMsg('Analisis Kompetitor', 'Analisis Kompetitor'),
    tMsg('Jadwal Meeting Tim', 'Jadwal Meeting Tim'),
  ];

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto font-sans transition-colors duration-700 ease-in-out ${
        isClosing ? 'mac-exit' : 'mac-animate'
      } ${isDarkMode ? 'bg-[#090D16] text-white' : 'bg-[#F3F4F6] text-[#111E38]'}`}
    >
      {/* Full-screen WebGL Shader Canvas Background */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* Floating organic blurred flow blobs */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-opacity duration-300 ${isDarkMode ? 'opacity-40' : 'opacity-20'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-[#FACC15]/30 rounded-full blur-[120px] animate-pulse" style={{ animation: 'flow 15s infinite alternate ease-in-out' }}></div>
        <div className={`absolute top-1/3 left-1/4 w-150 h-150 rounded-full blur-[100px] ${isDarkMode ? 'bg-[#001f3f]/50' : 'bg-[#dce9ff]/60'}`} style={{ animation: 'flow 20s infinite alternate-reverse ease-in-out' }}></div>
      </div>

      <style>{`
        @keyframes elegant-fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-elegant {
          animation: elegant-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-up-fade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(100px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        @keyframes flow {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-45%, -55%) scale(1.1) rotate(5deg); }
          100% { transform: translate(-55%, -45%) scale(0.9) rotate(-5deg); }
        }
      `}</style>

      {/* Top Header Navigation Bar (Reference Layout) */}
      <header
        className={`fixed top-0 left-0 right-0 flex justify-between items-center w-full px-8 md:px-12 h-20 z-40 border-b transition-colors duration-700 ease-in-out ${
          isDarkMode ? 'bg-[#090D16]/60 border-white/5' : 'bg-[#F3F4F6]/60 border-black/5'
        } backdrop-blur-md`}
      >
        <div className="flex items-center gap-12">
          {/* Logo matching alurku. style */}
          <div
            onClick={handleSkipOrCancel}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none"
          >
            <div className="w-9 h-9 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <span className="text-[#111E38] font-black text-[32px] leading-none pb-1">a</span>
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className={`font-black text-2xl tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
                alur<span className="text-[#FACC15]">ku</span>.
              </span>
              <span className={`text-[9px] font-bold self-end mt-0.5 leading-none pr-1 ${isDarkMode ? 'text-white/80' : 'text-[#001f3f]/80'}`}>
                Beta
              </span>
            </div>
          </div>
          {/* Top navigation links */}
          <nav className="hidden md:flex gap-8">
            <a
              onClick={handleSkipOrCancel}
              className={`transition-colors font-semibold text-sm cursor-pointer ${
                isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
              }`}
            >
              Dashboard
            </a>
            <a
              onClick={handleSkipOrCancel}
              className={`transition-colors font-semibold text-sm cursor-pointer ${
                isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
              }`}
            >
              Projects
            </a>
            <a
              onClick={handleSkipOrCancel}
              className={`transition-colors font-semibold text-sm cursor-pointer ${
                isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
              }`}
            >
              Team
            </a>
            <a
              onClick={handleSkipOrCancel}
              className={`transition-colors font-semibold text-sm cursor-pointer ${
                isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'
              }`}
            >
              Reports
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          {/* Stylish Light/Dark Theme Switch Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative w-14 h-8 rounded-full transition-all duration-500 ease-in-out p-1 flex items-center shadow-inner ${
                isDarkMode ? 'bg-neutral-800 border border-white/5' : 'bg-neutral-200 border border-black/5'
              }`}
              aria-label="Toggle theme"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out shadow-md ${
                  isDarkMode 
                    ? 'translate-x-6 bg-[#001f3f] text-[#FACC15]' 
                    : 'translate-x-0 bg-white text-[#FACC15]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] select-none font-bold">
                  {isDarkMode ? 'dark_mode' : 'light_mode'}
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                isDarkMode
                  ? 'border-white/10 hover:border-white/30 text-white bg-white/5'
                  : 'border-[#0b1c30]/10 hover:border-[#0b1c30]/30 text-[#001f3f] bg-black/5'
              }`}
            >
              {language}
            </button>
          </div>
          <button className={`p-2 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'}`}>
            <span className="material-symbols-outlined flex items-center">search</span>
          </button>
          <button className={`p-2 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-[#0b1c30]/60 hover:text-[#001f3f]'}`}>
            <span className="material-symbols-outlined flex items-center">notifications</span>
          </button>
          <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-colors">
            <Avatar
              name={currentUser}
              url={avatarsMap[currentUser]}
              size="w-9 h-9"
              textClass="text-xs"
            />
          </div>
        </div>
      </header>

      {/* Main Workspace layout */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch min-h-screen lg:h-screen pt-28 pb-8 px-6 lg:overflow-hidden">
        {/* Left Side: Input panel & AI task output */}
        <div
          className={`flex-1 flex flex-col transition-all duration-500 min-h-0 ${
            isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0
              ? 'lg:pr-8 lg:border-r border-neutral-200 dark:border-neutral-800'
              : ''
          }`}
        >
          <div className="hidden lg:block shrink-0 transition-all duration-700 ease-in-out" style={{ height: isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0 ? '0vh' : '15vh' }} />
          
          <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 min-h-0">
            <div className="shrink-0 mb-8 animate-elegant">
              {/* Active Assistant badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm border ${
                isDarkMode 
                  ? 'bg-[#FACC15]/10 border-[#FACC15]/30 text-[#EAB308]' 
                  : 'bg-[#FACC15]/20 border-[#FACC15]/40 text-[#574500]'
              }`}>
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                AI Assistant Active
              </div>

              {/* Dynamic Headline */}
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-3 ${
                isDarkMode ? 'text-white' : 'text-[#001f3f]'
              }`}>
                {tMsg('Hi there! How can alurku make your workday easier today?', 'Halo, bagaimana alurku bisa membantu pekerjaanmu hari ini?')}
              </h1>
              <p className={`text-sm sm:text-base max-w-lg leading-relaxed ${
                isDarkMode ? 'text-white/50' : 'text-[#0b1c30]/60'
              }`}>
                {tMsg(
                  'Tell me your goals or delegate tasks. I will structure them into actionable items.',
                  'Ceritakan tujuan Anda atau delegasikan tugas. Saya akan menyusunnya menjadi tugas terstruktur.'
                )}
              </p>
            </div>

            {/* Input Form container */}
            <form onSubmit={handleSubmit} className="w-full relative z-20 animate-elegant mb-8">
              <div
                className={`rounded-3xl border-2 p-2 group transition-all flex flex-col ${
                  isDarkMode
                    ? 'glass-panel border-white/10 focus-within:border-[#FACC15]/40 shadow-2xl'
                    : 'bg-white border-[#0b1c30]/10 focus-within:border-[#FACC15]/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                }`}
              >
                <div className="flex items-start w-full">
                  <div className="pl-4 pt-4 text-[#FACC15] group-focus-within:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px] flex items-center" style={{ fontVariationSettings: '"FILL" 1' }}>
                      auto_awesome
                    </span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrompt(val);
                      const mentionMatch = val.match(/(?:^|\s)@([\w.-]*)$/);
                      const boardMatch = val.match(/(?:^|\s)#([\w\s.-]*)$/);

                      if (mentionMatch) {
                        setMentionQuery(mentionMatch[1].toLowerCase());
                        setIsMentioning(true);
                        setMentionIndex(0);
                        setIsBoardMentioning(false);
                      } else if (boardMatch) {
                        const query = boardMatch[1].toLowerCase();
                        const boardOptions = boards.filter((b) => b.id !== 'global').map((b) => b.name.toLowerCase());
                        const hasPartialMatch = boardOptions.some((b) => b.includes(query));

                        if (hasPartialMatch || query === '') {
                          setBoardMentionQuery(query);
                          setIsBoardMentioning(true);
                          setBoardMentionIndex(0);
                          setIsMentioning(false);
                        } else {
                          setIsBoardMentioning(false);
                        }
                      } else {
                        setIsMentioning(false);
                        setIsBoardMentioning(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (isMentioning) {
                        const mentionOptions = (userDirectory || [])
                          .filter((u) => u.is_connected && u.username !== 'admin')
                          .map((u) => u.username);
                        const filtered = mentionOptions.filter((m) => m.toLowerCase().includes(mentionQuery));
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setMentionIndex((prev) => {
                            const nextIdx = (prev + 1) % (filtered.length || 1);
                            setTimeout(() => {
                              document.getElementById(`user-item-${nextIdx}`)?.scrollIntoView({ block: 'nearest' });
                            }, 0);
                            return nextIdx;
                          });
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setMentionIndex((prev) => {
                            const nextIdx = (prev - 1 + filtered.length) % (filtered.length || 1);
                            setTimeout(() => {
                              document.getElementById(`user-item-${nextIdx}`)?.scrollIntoView({ block: 'nearest' });
                            }, 0);
                            return nextIdx;
                          });
                        } else if (e.key === 'Enter' || e.key === 'Tab') {
                          if (filtered.length > 0) {
                            e.preventDefault();
                            insertMention(filtered[mentionIndex] || filtered[0]);
                          } else {
                            setIsMentioning(false);
                          }
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsMentioning(false);
                        }
                      } else if (isBoardMentioning) {
                        const boardOptions = boards.filter((b) => b.id !== 'global').map((b) => b.name);
                        const filtered = boardOptions.filter((m) => m.toLowerCase().includes(boardMentionQuery));
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setBoardMentionIndex((prev) => {
                            const nextIdx = (prev + 1) % (filtered.length || 1);
                            setTimeout(() => {
                              document.getElementById(`board-item-${nextIdx}`)?.scrollIntoView({ block: 'nearest' });
                            }, 0);
                            return nextIdx;
                          });
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setBoardMentionIndex((prev) => {
                            const nextIdx = (prev - 1 + filtered.length) % (filtered.length || 1);
                            setTimeout(() => {
                              document.getElementById(`board-item-${nextIdx}`)?.scrollIntoView({ block: 'nearest' });
                            }, 0);
                            return nextIdx;
                          });
                        } else if (e.key === 'Enter' || e.key === 'Tab') {
                          if (filtered.length > 0) {
                            e.preventDefault();
                            insertBoardMention(filtered[boardMentionIndex] || filtered[0]);
                          } else {
                            setIsBoardMentioning(false);
                          }
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsBoardMentioning(false);
                        }
                      } else if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={tMsg(
                      'Describe your goal to generate a to-do list...',
                      'Ceritakan rencana Anda dan buat to-do list secara otomatis...'
                    )}
                    className={`flex-1 bg-transparent border-none focus:ring-0 font-medium px-5 pt-4 text-base outline-none resize-none h-20 custom-scrollbar select-text ${
                      isDarkMode ? 'text-white placeholder-white/30' : 'text-[#001f3f] placeholder-[#0b1c30]/30'
                    }`}
                    autoFocus
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isProcessing}
                    className="bg-[#FACC15] text-[#111E38] h-12 w-12 rounded-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg mr-1 mt-1 shrink-0"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-[#111E38] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined font-bold flex items-center">send</span>
                    )}
                  </button>
                </div>
                {/* Usage Tips */}
                <div className={`px-5 pb-2 pt-1 flex justify-start gap-4 text-xs font-bold ${
                  isDarkMode ? 'text-neutral-500' : 'text-[#0b1c30]/40'
                }`}>
                  <span
                    onClick={() => {
                      const cur = prompt;
                      const space = cur === '' || cur.endsWith(' ') ? '' : ' ';
                      setPrompt(cur + space + '@');
                      setMentionQuery('');
                      setIsMentioning(true);
                      setMentionIndex(0);
                      setIsBoardMentioning(false);
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className={`flex items-center gap-1 cursor-pointer transition-colors select-none ${
                      isDarkMode ? 'hover:text-white' : 'hover:text-[#001f3f]'
                    }`}
                  >
                    <span className="text-[#FACC15]">@</span> Assign
                  </span>
                  <span
                    onClick={() => {
                      const cur = prompt;
                      const space = cur === '' || cur.endsWith(' ') ? '' : ' ';
                      setPrompt(cur + space + '#');
                      setBoardMentionQuery('');
                      setIsBoardMentioning(true);
                      setBoardMentionIndex(0);
                      setIsMentioning(false);
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className={`flex items-center gap-1 cursor-pointer transition-colors select-none ${
                      isDarkMode ? 'hover:text-white' : 'hover:text-[#001f3f]'
                    }`}
                  >
                    <span className="text-[#FACC15]">#</span> Projects
                  </span>
                  <span className="flex items-center gap-1 cursor-pointer hover:text-sky-500 dark:hover:text-sky-400 transition-colors ml-auto">
                    <span className="material-symbols-outlined text-[14px]">attach_file</span> Attach
                  </span>
                </div>
              </div>

              {/* User mentions autocomplete popup */}
              {isMentioning && (
                <div className="absolute left-4 top-full mt-1 w-64 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2 mac-animate">
                  {(() => {
                    const mentionOptions = (userDirectory || [])
                      .filter((u) => u.is_connected && u.username !== 'admin')
                      .map((u) => u.username);
                    const filtered = mentionOptions.filter((m) => m.toLowerCase().includes(mentionQuery));
                    if (filtered.length > 0) {
                      return filtered.map((m, idx) => (
                        <div
                          key={m}
                          id={`user-item-${idx}`}
                          className={`px-4 py-2.5 cursor-pointer text-sm font-semibold flex items-center gap-2 ${
                            mentionIndex === idx
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white'
                          }`}
                          onClick={() => insertMention(m)}
                        >
                          <span>@{m}</span>
                        </div>
                      ));
                    }
                    return <div className="px-4 py-3 text-sm text-neutral-500 italic">No members found</div>;
                  })()}
                </div>
              )}

              {/* Project mentions autocomplete popup */}
              {isBoardMentioning && (
                <div className="absolute left-4 top-full mt-1 w-64 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2 mac-animate">
                  {(() => {
                    const boardOptions = boards.filter((b) => b.id !== 'global').map((b) => b.name);
                    const filtered = boardOptions.filter((m) => m.toLowerCase().includes(boardMentionQuery));
                    if (filtered.length > 0) {
                      return filtered.map((m, idx) => (
                        <div
                          key={m}
                          id={`board-item-${idx}`}
                          className={`px-4 py-2.5 cursor-pointer text-sm font-semibold flex items-center gap-2 ${
                            boardMentionIndex === idx
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white'
                          }`}
                          onClick={() => insertBoardMention(m)}
                        >
                          <span>#{m}</span>
                        </div>
                      ));
                    }
                    return (
                      <div className="px-4 py-3 text-sm text-neutral-500 italic">
                        {tMsg('No projects found', 'Tidak ada proyek ditemukan')}
                      </div>
                    );
                  })()}
                </div>
              )}
            </form>

            {/* Default prompt suggestions */}
            {generatedTasks.length === 0 && !isProcessing && (
              <div className="flex flex-wrap justify-center gap-3 mt-4 animate-elegant">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setPrompt(sug);
                    }}
                    className={`px-5 py-2 rounded-full border transition-all text-sm font-semibold ${
                      isDarkMode
                        ? 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/30'
                        : 'border-[#111E38]/10 text-[#111E38]/60 hover:bg-[#111E38]/5 hover:text-[#111E38] hover:border-[#111E38]/30'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Generated tasks wrapper */}
            {isProcessing && generatedTasks.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-70 animate-elegant shrink-0">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-sky-500 animate-pulse">
                  {loadingText}
                </p>
              </div>
            )}

            {generatedTasks.length > 0 && (
              <div className="flex-1 flex flex-col min-h-0 animate-elegant">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="font-bold text-lg">
                    {tMsg('Generated Tasks', 'Tugas Dihasilkan')}
                  </h3>
                  <button
                    onClick={() => {
                      const allSelected = generatedTasks.every((t) => t.selected);
                      setGeneratedTasks(generatedTasks.map((t) => ({ ...t, selected: !allSelected })));
                    }}
                    className="text-xs font-bold text-sky-500 hover:underline"
                  >
                    {generatedTasks.every((t) => t.selected)
                      ? tMsg('Deselect All', 'Batal Pilih Semua')
                      : tMsg('Select All', 'Pilih Semua')}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0 custom-scrollbar">
                  <div className={`p-4 border rounded-2xl shadow-sm mb-4 ${isDarkMode ? 'bg-[#121B2D]/80 border-white/10' : 'bg-white border-black/10'}`}>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                      {tMsg('Target Project', 'Target Proyek')}
                    </label>
                    <select
                      value={targetBoard?.id || ''}
                      onChange={(e) => {
                        const b = boards.find((x) => String(x.id) === e.target.value);
                        if (b) setTargetBoard(b);
                        setGeneratedTasks(generatedTasks.map((item) => ({ ...item, target_board_id: b.id })));
                      }}
                      className={`w-full border rounded-xl p-2.5 text-xs font-bold outline-none transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#090D16] border-white/10 text-white focus:border-[#FACC15]'
                          : 'bg-neutral-100 border-black/10 text-[#111E38] focus:border-sky-500'
                      }`}
                    >
                      {boards
                        .filter((b) => b.id !== 'global')
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} {b.is_private ? '(Private)' : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  {generatedTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() =>
                        setGeneratedTasks(
                          generatedTasks.map((item) =>
                            item.id === t.id ? { ...item, selected: !item.selected } : item
                          )
                        )
                      }
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 animate-slide-up ${
                        t.selected
                          ? isDarkMode
                            ? 'bg-sky-500/10 border-sky-500/50'
                            : 'bg-sky-50 border-sky-200'
                          : isDarkMode
                          ? 'bg-[#121B2D]/55 border-white/5 opacity-70 hover:opacity-100'
                          : 'bg-white border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.selected}
                        readOnly
                        disabled={isSaving}
                        className="mt-1 w-4 h-4 rounded border-neutral-300 text-sky-500 focus:ring-sky-500 cursor-pointer disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{t.project_name}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-[#090D16] text-neutral-400' : 'bg-neutral-200 text-neutral-600'}`}>
                            {t.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-700'}`}>
                            {t.requester || `@${currentUser}`}
                          </span>
                          {t.deadline && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'}`}>
                              📅 {formatDateMMM(t.deadline)}
                            </span>
                          )}
                          {t.auto_nudge && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                              🔔 Auto nudge
                            </span>
                          )}
                          <select
                            value={t.target_board_id || targetBoard?.id || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newId = e.target.value;
                              setGeneratedTasks((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, target_board_id: newId } : item))
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded outline-none cursor-pointer max-w-35 truncate border ${
                              isDarkMode
                                ? 'bg-[#090D16] border-white/10 text-amber-400 [&>option]:bg-[#090D16] [&>option]:text-white'
                                : 'bg-amber-50 border-amber-200 text-amber-700 [&>option]:bg-white [&>option]:text-black'
                            }`}
                          >
                            {boards
                              .filter((b) => b.id !== 'global')
                              .map((b) => (
                                <option key={b.id} value={b.id}>
                                  📁 {b.name} {b.is_private ? '(Private)' : ''}
                                </option>
                              ))}
                          </select>
                        </div>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          {t.description}
                        </p>
                      </div>
                      {processingId === t.id && (
                        <div className="shrink-0 mt-1">
                          <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!isSaving && processingId !== t.id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedTasks((prev) => prev.filter((item) => item.id !== t.id));
                          }}
                          className="shrink-0 ml-2 text-neutral-400 hover:text-red-500 transition-colors p-1"
                          title={tMsg('Remove task', 'Hapus tugas')}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="p-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 dark:bg-sky-900/10 flex items-center gap-4 animate-pulse">
                      <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500">
                        {loadingText}
                      </span>
                    </div>
                  )}
                  <div ref={tasksEndRef} className="h-4 shrink-0" />
                </div>
                <div className="sticky bottom-0 mt-4 pt-4 pb-4 flex justify-end shrink-0 z-20 pointer-events-none">
                  <button
                    onClick={handleSaveSelected}
                    disabled={isSaving || isProcessing || !generatedTasks.some((t) => t.selected)}
                    className="w-full sm:w-auto bg-[#111E38] dark:bg-white text-white dark:text-[#111E38] px-8 py-3.5 rounded-full font-bold text-xs shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 pointer-events-auto"
                  >
                    {isSaving ? <LoadingSpinner /> : '🚀'}
                    {isSaving
                      ? tMsg('Processing...', 'Memproses...')
                      : tMsg('Add to Inbox', 'Tambahkan ke Kotak Masuk')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Inbox drawer */}
        {(isCartVisible || inboxTasks.length > 0) && (
          <div className={`w-full lg:w-80 flex flex-col shrink-0 rounded-3xl p-5 border shadow-sm animate-slide-in-right h-[calc(100vh-120px)] lg:sticky lg:top-28 ${
            isDarkMode
              ? 'bg-[#121B2D]/80 border-white/10'
              : 'bg-white border-black/10'
          }`}>
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${
                isDarkMode ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0H4m16 0v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1m2 4h12" />
                </svg>
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight">
                  {tMsg('Inbox', 'Kotak Masuk')}
                </h2>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  {tMsg('Ready to dispatch', 'Siap untuk dikirim')}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {inboxTasks.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className={`p-3.5 rounded-xl border shadow-sm relative group transition-opacity ${
                    isDarkMode ? 'bg-[#090D16] border-white/5' : 'bg-neutral-50 border-neutral-200'
                  } ${deletingId === t.id ? 'opacity-50' : 'animate-slide-up'}`}
                >
                  <div className="flex justify-between items-center mb-2.5 pb-1 pr-6 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded truncate max-w-25">
                        📁 {t.target_board_name || 'Project'}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700 font-bold text-[10px]">/</span>
                      <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded truncate max-w-20">
                        {t.category || 'Other'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="font-bold text-sm leading-snug line-clamp-2">
                      {t.project_name}
                    </div>
                    {t.description && (
                      <p className={`text-xs mt-2 leading-relaxed line-clamp-2 font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {t.description.replace(/<[^>]*>?/gm, '')}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-1 rounded shadow-sm ${
                          t.impact === 'High'
                            ? 'bg-red-500/20 text-red-500'
                            : t.impact === 'Low'
                            ? 'bg-slate-500/20 text-slate-500'
                            : 'bg-sky-500/20 text-sky-500'
                        }`}
                      >
                        {t.impact === 'High' ? '🔥 High' : t.impact === 'Low' ? '🧊 Low' : '⚡ Med'}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded shadow-sm ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-600'}`}>
                        ⏳ {t.etc || 2}h
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/50 text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
                    <div className="flex justify-between items-center">
                      <span>✨ AI Draft</span>
                      <span className="text-black dark:text-white">
                        {t.finalDeadline ? `⏳ ${formatDateMMM(t.finalDeadline)}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>
                        {t.requester?.includes('@') ? '👉 Assignee' : '👤 Requester'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={t.requester || currentUser}
                          url={avatarsMap[(t.requester || currentUser).replace('@', '').trim()]}
                          size="w-4 h-4"
                          textClass="text-[8px]"
                        />
                        <span className="text-black dark:text-white font-bold">
                          {t.requester || `@${currentUser}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  {deletingId === t.id ? (
                    <div className="absolute top-3 right-3 w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <button
                      onClick={() => handleDeleteFromCart(t)}
                      className="absolute top-2 right-2 p-1.5 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      title={tMsg('Cancel task', 'Batal tugas')}
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 mt-4 pt-4 border-t border-black/5 dark:border-white/5 shrink-0 z-20 pointer-events-auto">
              <button
                onClick={handleFinish}
                disabled={isFinishing}
                className="w-full bg-[#FACC15] text-[#111E38] px-6 py-4 rounded-full font-bold text-xs shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                {isFinishing ? <LoadingSpinner /> : null}
                {isFinishing
                  ? tMsg('Saving...', 'Menyimpan...')
                  : tMsg('Finish & Go to Project', 'Selesai & Buka Proyek')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discard draft confirmation dialog */}
      {cancelConfirmOpen && (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-1000 p-4">
          <div className={`p-6 sm:p-10 w-full max-w-sm border shadow-2xl rounded-3xl text-center mac-animate ${
            isDarkMode ? 'bg-[#121B2D] border-white/10' : 'bg-white border-black/10'
          }`}>
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-red-500/25">
              🗑️
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">
              {tMsg('Discard Drafts?', 'Buang Draf?')}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm font-medium leading-relaxed">
              {tMsg(
                'You have unsaved tasks in your cart or drafts. Are you sure you want to discard them? This action cannot be undone.',
                'Anda memiliki tugas yang belum disimpan di keranjang atau draf. Yakin ingin membuangnya? Tindakan ini tidak dapat dibatalkan.'
              )}
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setCancelConfirmOpen(false)}
                className={`flex-1 px-4 py-4 rounded-full font-bold text-xs uppercase tracking-widest border shadow-sm transition-colors ${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
                    : 'bg-neutral-100 border-neutral-200 text-black hover:bg-neutral-200'
                }`}
              >
                {tMsg('No, Keep', 'Tidak')}
              </button>
              <button
                onClick={confirmSkipOrCancel}
                className="flex-1 px-4 py-4 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-all uppercase tracking-widest text-xs hover:-translate-y-0.5"
              >
                {tMsg('Yes, Discard', 'Ya, Buang')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private workspace assignment warning dialog */}
      {privateWarningOpen && (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-1000 p-4">
          <div className={`p-6 sm:p-10 w-full max-w-sm border shadow-2xl rounded-3xl text-center mac-animate ${
            isDarkMode ? 'bg-[#121B2D] border-white/10' : 'bg-white border-black/10'
          }`}>
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-amber-500/25">
              ⚠️
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">
              {tMsg('Private Workspace Alert', 'Peringatan Ruang Kerja')}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm font-medium leading-relaxed">
              {tMsg(
                'You assigned a task to someone else, but selected a Private Workspace. Please select a shared project from the dropdown.',
                'Anda menugaskan tugas ke orang lain, tetapi memilih Ruang Kerja Pribadi. Silakan pilih proyek bersama dari dropdown.'
              )}
            </p>
            <button
              onClick={() => setPrivateWarningOpen(false)}
              className={`w-full px-4 py-4 rounded-full font-bold text-xs uppercase tracking-widest border shadow-sm transition-colors ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 border-neutral-200 text-black hover:bg-neutral-200'
              }`}
            >
              {tMsg('Understood', 'Mengerti')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
