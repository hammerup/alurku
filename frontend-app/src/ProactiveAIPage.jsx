import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCloseAnimation, LoadingSpinner, safeParseJSON } from './Utils';
import { Avatar } from './SharedUI';
import HeaderNavigation from './components/Layout/HeaderNavigation';
import { useAppContext } from './hooks/useAppContext';
import { getLurukaSystemPrompt } from './utils/lurukaPersona';

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
  tasks,
  showNotification,
  userDirectory,
  formatDateMMM,
  avatarsMap,
  isDarkMode,
  setIsDarkMode,
  setLanguage,
  setSelectedTask,
}) {
  const {
    setShowMyTasks,
    setShowOverdueOnly,
    setShowDueTodayOnly,
    setSearchQuery,
    setFilterStatus,
    setFilterCategory,
    setFilterAssignee,
    isUserAssigned,
    activeWorkspace,
    selectedBoard,
    teamMembers,
  } = useAppContext();

  const destRef = useRef('/dashboard');

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
  const [aiContext, setAiContext] = useState(null);
  const [lastSearchResults, setLastSearchResults] = useState(null); // Full search results for pagination
  const [lastSearchDisplayed, setLastSearchDisplayed] = useState(0); // How many results already shown
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'id' 
        ? 'Halo! Aku Luruka, asisten cerdas pribadimu di alurku. 😊\n\nKamu bisa menuliskan rencana kerjamu untuk kujabarkan menjadi tugas terstruktur secara otomatis, atau tanyakan apapun untuk berdiskusi!'
        : 'Hello! I am Luruka, your personal smart assistant at alurku. 😊\n\nYou can describe your goals to automatically generate a to-do list, or ask me anything to discuss your work!'
    }
  ]);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [searchSessionQuery, setSearchSessionQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/ai/sessions');
      setChatSessions(res.data.sessions || []);
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    }
  };

  const loadSession = (session) => {
    setActiveSessionId(session.id);
    if (session.messages) {
      try {
        const parsed = JSON.parse(session.messages);
        setChatHistory(parsed.length ? parsed : [
          {
            id: 'welcome',
            sender: 'ai',
            text: language === 'id' 
              ? 'Halo! Aku Luruka, asisten cerdas pribadimu di alurku. 😊\n\nKamu bisa menuliskan rencana kerjamu untuk kujabarkan menjadi tugas terstruktur secara otomatis, atau tanyakan apapun untuk berdiskusi!'
              : 'Hello! I am Luruka, your personal smart assistant at alurku. 😊\n\nYou can describe your goals to automatically generate a to-do list, or ask me anything to discuss your work!'
          }
        ]);
      } catch (e) {
        setChatHistory([]);
      }
    }
  };

  const createNewSession = async (firstMessageText) => {
    try {
      const newId = 'session_' + Date.now();
      const res = await axios.post('/api/ai/sessions', {
        id: newId,
        title: firstMessageText.substring(0, 30) + '...'
      });
      setActiveSessionId(res.data.id);
      setChatSessions((prev) => [res.data, ...prev]);
      return res.data.id;
    } catch(e) {
      console.error(e);
      return null;
    }
  };

  const updateSessionMessages = async (sessionId, messages) => {
    try {
      const messagesStr = JSON.stringify(messages);
      await axios.put('/api/ai/sessions/' + sessionId, {
        messages: messagesStr
      });
      setChatSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, messages: messagesStr } : s
      ));
    } catch(e) {
      console.error(e);
    }
  };

  const togglePinSession = async (e, session) => {
    e.stopPropagation();
    try {
      const newPinned = session.is_pinned ? 0 : 1;
      await axios.put('/api/ai/sessions/' + session.id, {
        is_pinned: newPinned
      });
      fetchSessions();
    } catch(e) {
      console.error(e);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await axios.delete('/api/ai/sessions/' + sessionId);
      if (activeSessionId === sessionId) {
        startNewChat();
      }
      fetchSessions();
    } catch(e) {
      console.error(e);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setChatHistory([
      {
        id: 'welcome',
        sender: 'ai',
        text: language === 'id' 
          ? 'Halo! Aku Luruka, asisten cerdas pribadimu di alurku. 😊\n\nKamu bisa menuliskan rencana kerjamu untuk kujabarkan menjadi tugas terstruktur secara otomatis, atau tanyakan apapun untuk berdiskusi!'
          : 'Hello! I am Luruka, your personal smart assistant at alurku. 😊\n\nYou can describe your goals to automatically generate a to-do list, or ask me anything to discuss your work!'
      }
    ]);
  };

  // Sync to database whenever chatHistory changes and has at least 1 user message
  useEffect(() => {
    if (chatHistory.length > 1) {
      const syncMessages = async () => {
        let sid = activeSessionId;
        if (!sid) {
          const firstUserMsg = chatHistory.find(m => m.sender === 'user')?.text || 'New Chat';
          sid = await createNewSession(firstUserMsg);
        }
        if (sid) {
          updateSessionMessages(sid, chatHistory);
        }
      };
      syncMessages();
    }
  }, [chatHistory]);

  useEffect(() => {
    axios.get('/api/ai/context')
      .then(res => setAiContext(res.data))
      .catch(err => console.error('Failed to fetch AI context:', err));
  }, []);

  const getLocalToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
      2,
      '0'
    )}`;
  };

  const checkUserAssigned = (t) => {
    if (typeof isUserAssigned === 'function') return isUserAssigned(t, currentUser);
    if (!t || !currentUser) return false;
    const u = currentUser.toLowerCase();
    const req = (t.requester || '').toLowerCase();
    const isOwner = (t.owner_username || '').toLowerCase() === u;
    const isReq = req.includes(`@${u}`) || req === u;
    const isSub = (t.subtask_assignees || '').toLowerCase().includes(u);
    return isReq || isSub || (isOwner && !req.includes('@'));
  };

  const buildContextPromptSnippet = () => {
    const todayStr = getLocalToday();
    const allTasks = tasks || [];

    // Calculate live user stats directly from tasks prop (100% accurate to UI cards)
    const myActiveTasks = allTasks.filter((t) => checkUserAssigned(t) && t.status !== 'Done' && t.status !== 'Rejected');
    const myDueTodayTasks = myActiveTasks.filter((t) => t.deadline && t.deadline.split(' ')[0] === todayStr);
    const myOverdueTasks = myActiveTasks.filter((t) => t.deadline && t.deadline.split(' ')[0] < todayStr);

    const activeCount = aiContext?.my_stats?.active ?? myActiveTasks.length;
    const dueTodayCount = aiContext?.my_stats?.due_today ?? myDueTodayTasks.length;
    const overdueCount = aiContext?.my_stats?.overdue ?? myOverdueTasks.length;

    const projectList = (boards || []).map((b) => b.name).filter((b) => b && b.toLowerCase() !== 'global');
    const projectBreakdown = (boards || [])
      .filter((b) => b && b.name && b.name.toLowerCase() !== 'global')
      .map((b) => `"${b.name}" (Pemilik: @${b.owner_username || currentUser})`)
      .join(', ');

    const validMemberSet = new Set(
      (teamMembers && teamMembers.length > 0)
        ? teamMembers.map((m) => (typeof m === 'string' ? m.replace(/^@/, '') : m.username))
        : (aiContext?.team_members && aiContext.team_members.length > 0)
        ? aiContext.team_members.map((m) => m.replace(/^@/, ''))
        : [currentUser]
    );

    const teamMemberList = (userDirectory && userDirectory.length > 0)
      ? userDirectory
          .filter((u) => validMemberSet.has(u.username))
          .map((u) => `@${u.username}${u.full_name ? ` (${u.full_name})` : ''}`)
      : Array.from(validMemberSet).map((m) => '@' + m);

    const wsName = aiContext?.workspace_name || activeWorkspace?.name || 'Workspace';

    let str = `\n\nACTUAL WORKSPACE DATA (CRITICAL: Use ONLY this data to answer questions about projects, tasks, or team members. DO NOT invent or make up fake numbers/names under ANY circumstances!):\n`;
    str += `- Current User: @${currentUser}\n`;
    str += `- Workspace Name: "${wsName}"\n`;
    str += `- Projects/Boards Currently Existing in Workspace (with Owner): ${projectBreakdown.length > 0 ? projectBreakdown : 'None'}\n`;
    str += `- User Directory / Team Members in Workspace "${wsName}": ${teamMemberList.join(', ')}\n`;
    str += `- Your Personal Workload (@${currentUser}) [matches top UI cards]: Total Active Tasks = ${activeCount}, Due Today = ${dueTodayCount}, Overdue = ${overdueCount}\n`;

    if (myActiveTasks.length > 0) {
      str += `- Your Active Tasks List (@${currentUser}):\n` +
        myActiveTasks.slice(0, 10).map((t) => {
          const dl = t.deadline ? t.deadline.split(' ')[0] : 'No deadline';
          const desc = t.description ? (t.description.length > 50 ? t.description.substring(0, 50) + '...' : t.description) : 'No description';
          return `  • #${t.id} "${t.project_name}" (Status: ${t.status}, Deadline: ${dl}, Category: ${t.category || 'General'}, Description: ${desc})`;
        }).join('\n') + '\n';
    } else {
      str += `- Your Active Tasks List (@${currentUser}): None\n`;
    }

    str += `IMPORTANT RULES FOR ANSWERING:\n`;
    str += `1. When the user asks "berapa tugas aku", "berapa task overdue", or about task counts, quote the exact numbers above: Active Tasks = ${activeCount}, Due Today = ${dueTodayCount}, Overdue = ${overdueCount}.\n`;
    str += `2. If asked "Proyek apa saja yang ada?", list ONLY the project names above (${projectList.join(', ')}). NEVER mention placeholder projects like Alpha, Beta, Gamma.\n`;
    str += `3. When answering about team members or workspace info, explicitly refer to the workspace by its exact name "${wsName}" (e.g. "di workspace ${wsName}"), NEVER say generically "di Alurku". Alurku is the app name, while "${wsName}" is the user's active workspace name.\n`;
    str += `4. When the user wants to UPDATE or EDIT an existing task (change status, deadline, assignee, category, title, or any detail), you MUST output "response_type": "update_task" as specified in your JSON SCHEMA. Use the task list above to extract the correct search_query. NEVER say you cannot update tasks — you have this capability.\n`;
    str += `5. EXACT USERNAME & ASSIGNEE MAPPING RULE: When assigning a task, setting a requester, or searching for assignees, you MUST ONLY use exact valid usernames from the User Directory list above (${teamMemberList.join(', ')}). Match display names or full names (e.g. "Budi Santoso") to their exact system username (e.g. "@budi_santoso"). DO NOT guess or generate fake/shortened usernames.\n`;
    return str;
  };

  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashQuery, setSlashQuery] = useState('');
  const chatEndRef = useRef(null);

  const slashCommands = [
    { cmd: '/generate', desc: language === 'id' ? 'Buat to-do list dari rencana kerjamu' : 'Generate tasks from your plan' },
    language === 'id'
      ? { cmd: '/cari', desc: 'Cari tugas atau task di database' }
      : { cmd: '/search', desc: 'Search for tasks in the database' },
    { cmd: '/chat', desc: language === 'id' ? 'Tanya jawab atau diskusi id' : 'Discuss and ask general questions' },
    { cmd: '/help', desc: language === 'id' ? 'Tampilkan panduan penggunaan asisten' : 'Show help instructions' }
  ];

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

  const renderChatText = (text) => {
    if (!text) return '';
    
    // Escape HTML to prevent injection
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Replace **bold** with <strong>bold</strong>
    const boldClass = isDarkMode ? 'font-black text-[#FACC15]' : 'font-black text-[#111E38]';
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, `<strong class="${boldClass}">$1</strong>`);
    
    // Replace bullets like "- Item" or "* Item" with bullet elements
    const bulletColor = isDarkMode ? 'text-[#FACC15]' : 'text-sky-500';
    escaped = escaped.replace(/(?:^|\n)[-*]\s+(.+)/g, `<div class="pl-4 py-0.5 flex items-start"><span class="${bulletColor} mr-2">•</span><span>$1</span></div>`);
    
    // Replace numbered lists like "1. Item" with list elements
    escaped = escaped.replace(/(?:^|\n)(\d+)\.\s+(.+)/g, `<div class="pl-4 py-0.5 flex items-start"><span class="${bulletColor} mr-2 font-bold">$1.</span><span>$2</span></div>`);
    
    return <div dangerouslySetInnerHTML={{ __html: escaped }} className="space-y-1 select-text" />;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (!isProcessing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isProcessing]);

  const [isClosing, close] = useCloseAnimation(() => {
    window.history.pushState({}, '', destRef.current);
    window.dispatchEvent(new CustomEvent('alurku-navigate'));
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

  const extractSearchQuery = (textStr) => {
    const textL = textStr.toLowerCase().trim();

    // EXCLUSION: Metadata/listing questions should NOT be intercepted as search
    // These should fall through to the AI prompt for intelligent handling
    const metadataPatterns = [
      'list project', 'daftar project', 'daftar proyek', 'proyek apa saja',
      'project apa saja', 'ada proyek apa', 'ada project apa', 'berapa project',
      'berapa proyek', 'berapa tugas', 'berapa task', 'jumlah tugas', 'jumlah task',
      'jumlah proyek', 'jumlah project', 'siapa saja', 'anggota tim', 'tim siapa',
      'team member', 'list task di', 'daftar tugas di', 'tugas di project',
      'task di project', 'tugas di proyek', 'task di proyek',
      'ada berapa', 'berapa banyak', 'how many', 'list all', 'show all',
      'tampilkan semua', 'lihat semua', 'semua project', 'semua proyek',
      'apa saja', 'what projects', 'which projects',
    ];
    if (metadataPatterns.some(p => textL.includes(p))) {
      return null;
    }
    
    const searchIndex = textL.indexOf('cari ');
    const slashCariIndex = textL.indexOf('/cari ');
    const searchIndexEn = textL.indexOf('search ');
    const slashSearchIndex = textL.indexOf('/search ');
    const findIndex = textL.indexOf('find ');
    
    let query = '';
    if (searchIndex !== -1) {
      query = textStr.substring(searchIndex + 5).trim();
    } else if (slashCariIndex !== -1) {
      query = textStr.substring(slashCariIndex + 6).trim();
    } else if (searchIndexEn !== -1) {
      query = textStr.substring(searchIndexEn + 7).trim();
    } else if (slashSearchIndex !== -1) {
      query = textStr.substring(slashSearchIndex + 8).trim();
    } else if (findIndex !== -1) {
      query = textStr.substring(findIndex + 5).trim();
    } else {
      return null;
    }
    
    // Clean prefixes
    query = query.replace(/^(?:task|tugas|namanya|tentang|yang|mengandung|kata)\s+/i, '').trim();
    
    // Exclude generic queries
    if (!query || ['task', 'tugas', 'project', 'proyek'].includes(query.toLowerCase())) {
      return null;
    }
    
    return query;
  };

  const isOffTopicQuery = (textStr) => {
    if (!textStr) return false;
    const t = textStr.toLowerCase().trim();
    
    const explicitOffTopicKeywords = [
      'resep', 'masak', 'makanan', 'memasak', 'kuliner', 'dadar gulung', 'nasi goreng', 'kue', 'bahan masakan',
      'resep makanan', 'menu makan', 'resep masakan',
      'joke', 'lelucon', 'humor', 'cerita lucu', 'tebak-tebakan',
      'ramalan', 'zodiak', 'horoskop', 'cuaca', 'prakiraan cuaca',
      'lirik', 'chord', 'lagu', 'puisi', 'pantun', 'novel', 'cerpen',
      'prediksi bola', 'skor pertandingan', 'sepak bola', 'klasemen'
    ];
    
    const professionalWorkDomains = [
      'marketing', 'seo', 'software', 'app', 'ui', 'ux', 'code', 'sistem', 'server', 
      'database', 'desain', 'design', 'bug', 'feature', 'bisnis', 'resto', 'restoran', 
      'toko', 'usaha', 'launching', 'outlet', 'cabang', 'operasional', 'supplier', 
      'inventaris', 'stok', 'event', 'promo', 'pemasaran', 'sop', 'audit'
    ];
    const hasProfessionalDomain = professionalWorkDomains.some(w => t.includes(w));
    
    if (hasProfessionalDomain) return false;
    return explicitOffTopicKeywords.some(kw => t.includes(kw));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    const userPrompt = prompt.trim();
    
    // Add user message to history
    setChatHistory((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: 'user', text: userPrompt }
    ]);
    
    setPrompt('');
    setIsSlashMenuOpen(false);

    // Intercept "show more" / "tampilkan lainnya" pagination request
    const showMorePatterns = [
      'show more', 'more results', 'tampilkan lainnya', 'lainnya', 'sisanya',
      'tampilkan sisanya', 'lihat lainnya', 'lihat sisanya', 'show the rest',
      'next page', 'halaman berikutnya', 'berikutnya', 'selanjutnya',
      'tampilkan lebih', 'tampilkan lebih banyak', 'yang lain',
    ];
    const userLower = userPrompt.toLowerCase().trim();
    if (showMorePatterns.some(p => userLower === p || userLower.includes(p))) {
      if (lastSearchResults && lastSearchDisplayed < lastSearchResults.length) {
        const PAGE_SIZE = 5;
        const nextPage = lastSearchResults.slice(lastSearchDisplayed, lastSearchDisplayed + PAGE_SIZE);
        const newDisplayed = lastSearchDisplayed + nextPage.length;
        setLastSearchDisplayed(newDisplayed);

        const remaining = lastSearchResults.length - newDisplayed;
        const moreText = remaining > 0
          ? tMsg(
              `Menampilkan ${nextPage.length} hasil lagi (${newDisplayed} dari ${lastSearchResults.length} total). Ketik "lainnya" untuk melihat sisanya.`,
              `Menampilkan ${nextPage.length} hasil lagi (${newDisplayed} dari ${lastSearchResults.length} total). Ketik "lainnya" untuk melihat sisanya.`
            )
          : tMsg(
              `Menampilkan ${nextPage.length} hasil terakhir (${newDisplayed} dari ${lastSearchResults.length} total). Semua hasil sudah ditampilkan.`,
              `Menampilkan ${nextPage.length} hasil terakhir (${newDisplayed} dari ${lastSearchResults.length} total). Semua hasil sudah ditampilkan.`
            );

        setChatHistory(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: moreText,
          searchResults: nextPage
        }]);
        return;
      } else {
        setChatHistory(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: tMsg(
            'Semua hasil pencarian sudah ditampilkan sebelumnya. Mau cari hal lain?',
            'Semua hasil pencarian sudah ditampilkan sebelumnya. Mau cari hal lain?'
          )
        }]);
        return;
      }
    }

    // Intercept off-topic questions (Strict Scope Guardrail)
    if (isOffTopicQuery(userPrompt)) {
      const refusalMsg = language === 'id'
        ? 'Maaf ya, Aku adalah asisten Alurku yang khusus membantu mengelola tugas, proyek, dan alur kerja timmu! 🚀\n\nYuk tanyakan hal seputar tugas, jadwal kerja, atau koordinasi proyekmu!'
        : 'Sorry, I am Luruka, an Alurku assistant specifically focused on helping you manage tasks, projects, and team workflows! 🚀\n\nFeel free to ask me anything about your tasks, work schedule, or project coordination!';
      
      setChatHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: 'ai', text: refusalMsg }
      ]);
      return;
    }

    // Intercept search intent
    const searchQuery = extractSearchQuery(userPrompt);
    if (searchQuery) {
      setIsProcessing(true);
      setLoadingText(tMsg('Searching database...', 'Mencari di database...'));
      try {
        let searchBoardId = (selectedBoard && selectedBoard.id !== 'global') ? selectedBoard.id : null;
        let matchedBoardObj = null;
        const textToCheck = (userPrompt + ' ' + searchQuery).toLowerCase();
        const foundBoard = (boards || []).find(b => {
          const cleanBName = b.name.toLowerCase();
          return textToCheck.includes(`#${cleanBName}`) || 
                 textToCheck.includes(`project ${cleanBName}`) ||
                 textToCheck.includes(`proyek ${cleanBName}`) ||
                 textToCheck.includes(`board ${cleanBName}`) ||
                 textToCheck.includes(`project name ${cleanBName}`) ||
                 textToCheck.includes(`di project ${cleanBName}`);
        });
        if (foundBoard) {
          matchedBoardObj = foundBoard;
          searchBoardId = foundBoard.id;
        }

        const boardParam = searchBoardId ? `&board_id=${searchBoardId}` : '';
        const res = await axios.get(`/api/tasks/search?q=${encodeURIComponent(searchQuery)}${boardParam}`);
        const results = res.data.results || [];
        
        // Store ALL results for pagination
        const allResults = results.map(t => {
          const boardName = boards?.find((b) => b.id === t.board_id)?.name || 'General';
          return {
            id: t.id,
            project_name: t.project_name,
            board_name: boardName,
            status: t.status,
            category: t.category,
            deadline: t.deadline
          };
        });

        const PAGE_SIZE = 5;
        const firstPage = allResults.slice(0, PAGE_SIZE);
        const hasMore = allResults.length > PAGE_SIZE;

        // Save full results for "show more" pagination
        setLastSearchResults(allResults.length > 0 ? allResults : null);
        setLastSearchDisplayed(allResults.length > 0 ? PAGE_SIZE : 0);

        const boardLabel = matchedBoardObj ? ` di project **"${matchedBoardObj.name}"**` : '';
        const botText = results.length === 0 
          ? tMsg(`Aku tidak menemukan tugas dengan kata kunci **"${searchQuery}"**${boardLabel} di database.`, `Aku tidak menemukan tugas dengan kata kunci **"${searchQuery}"**${boardLabel} di database.`)
          : hasMore
            ? tMsg(
                `Aku menemukan **${allResults.length} task**${boardLabel}. Menampilkan ${PAGE_SIZE} pertama. Ketik "lainnya" untuk melihat sisanya.`,
                `Aku menemukan **${allResults.length} task**${boardLabel}. Menampilkan ${PAGE_SIZE} pertama. Ketik "lainnya" untuk melihat sisanya.`
              )
            : tMsg(
                `Aku menemukan **${allResults.length} task**${boardLabel}. Ini hasilnya:`,
                `Aku menemukan **${allResults.length} task**${boardLabel}. Ini hasilnya:`
              );

        setChatHistory(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: botText,
          searchResults: firstPage
        }]);
      } catch (err) {
        setChatHistory(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'ai',
            text: tMsg('Failed to perform search. Please try again.', 'Gagal melakukan pencarian. Silakan coba lagi.')
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    setLoadingText(tMsg('Analyzing your request...', 'Menganalisis permintaan Anda...'));

    try {
      setLoadingText(tMsg('Structuring response...', 'Menyusun tanggapan...'));
      const currentYear = new Date().getFullYear();
      
      const recentHistory = chatHistory
        .slice(-6)
        .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const personaBase = getLurukaSystemPrompt({
        contextType: 'chat',
        currentUser: currentUser || 'User',
        todayStr: getLocalToday()
      });

      const aiPrompt = `${personaBase}
Your objective is to parse the user's request and output a strictly valid JSON object matching the JSON SCHEMA below.

DOMAIN KNOWLEDGE: You possess deep contextual understanding of the field mentioned in the request. Use this to accurately estimate time and break down complex workflows into clear, actionable, professional-grade steps.

Recent Conversation History:
${recentHistory}

INSTRUCTIONS:
1. Determine the intent of the user request.
2. If the user asks general questions about available projects/boards (e.g., "Proyek apa saja yang ada?", "Daftar project", "Ada project apa saja?"), questions about team members, or questions about task statistics/counts:
   - Return "response_type": "chat".
   - Answer directly, warmly, and conversationally in "chat_message" using ONLY the project names, team members, or stats listed in ACTUAL WORKSPACE DATA. Do NOT classify general metadata questions as "search".
3. If the user explicitly wants to SEARCH, FILTER, or FIND specific tasks (e.g. "tunjukkan tugas budi yang telat", "cari task mockup", "cari task overdue", "antrian task aku", "cari task category Design", "task High impact", "task deadline 2026-07-30", "tampilkan task di project #Design"):
   - Return "response_type": "search".
   - Construct a space-separated string of search keywords in "search_query".
   - CRITICAL BOARD EXTRACTION RULE: If the user specifies a project or board name (e.g. using '#BoardName', 'project X', 'project name X', 'board X', 'di project X'), you MUST populate "target_board_name" with the exact board name (e.g. "Design").
   - IMPORTANT QUERY MAPPING RULES:
     - Map personal pronouns ("tugas aku", "tugas saya", "my tasks", "my work") to the user's actual username "${currentUser}". Do NOT use "my", "saya", "aku", "me", "mine" in the search query.
     - Map "overdue", "telat", "terlambat" to a single word "overdue".
     - Map "today", "due today", "hari ini" to a single word "today".
     - Map "not overdue", "belum overdue", "belum terlambat" to a single word "not_overdue".
     - Map "pending", "active", "aktif", "belum selesai" to a single word "pending".
     - Map team member names ("budi", "siti") to exact system usernames (e.g. "budi_santoso").
     - Include category names (e.g., "Design", "Marketing"), status names (e.g., "Done", "In Progress"), or project/board names (e.g., "SEO") in "search_query" when specified.
     - Include date strings formatted as YYYY-MM-DD if user specifies an exact deadline date.
     - Keep the keywords short and clean. Strip filler words like "task", "tugas", "daftar", "list".
     - Example: If the user says "task sudah overdue", output "search_query": "overdue".
     - Example: If the user says "tugas aku", output "search_query": "${currentUser}".
     - Example: If the user says "task High impact category Design", output "search_query": "High Design".
   - Write a friendly and casual confirmation in "chat_message" explaining what you are searching for, adhering strictly to the "Aku/Kamu" persona.
   - Leave the "tasks" array empty.
4. If the user request is a general question, asks for advice, or is conversational in nature (and does NOT imply creating structured tasks immediately), return "response_type": "chat" and write your advice in "chat_message". Leave the "tasks" array empty.
5. If the user wants to UPDATE or EDIT EXISTING TASK(S) (e.g. "ubah status task X", "update task", "edit task", "ganti deadline", "tandai selesai", "mark as done", "change status", "update deadline", "pindah status", "set status to", "ubah semua task pending di board #Design jadi inprogress"):
   - Return "response_type": "update_task".
   - If the user specifies a board/project using '#BoardName' or 'di board X' or 'di project X', extract that board name into "target_board_name" (e.g. "Design" if user mentions "#Design" or "board Design"). DO NOT put board/project names inside search_query unless the task title itself contains that word!
   - If the user specifies a current status filter (e.g., "semua task pending", "task open"), extract it into "target_status_filter" ("Open", "Pending", "In Progress", "Done", "Rejected").
   - Set "search_query" to key words to match the task title/content if specific task names are mentioned. If user asks to update ALL tasks in a board or with a status, leave "search_query" clean or empty.
   - Put requested changes inside "updates" object: {"status": "Open/In Progress/Done/Rejected", "deadline": "YYYY-MM-DD", "project_name": "new title", "category": "new category", "requester": "new assignee", "description": "new description"}. Map informal status values ("inprogress", "in progress", "jalan", "dikerjakan") to standard status string "In Progress", "pending"/"open" to "Open", "done"/"selesai" to "Done".
   - Write a clear conversational confirmation in "chat_message" explaining what updates you are applying.
6. If the user request implies creating tasks, assigning work, setting up projects, or breaking down a plan, return "response_type": "tasks". In "chat_message", write a brief conversational summary introducing the PROPOSED DRAFT TASKS for the user to review.
   - CRITICAL DRAFT TASK MICROCOPY RULE: The generated tasks are ONLY draft suggestions placed in the user's review panel/inbox for their consideration. They are NOT automatically saved or added to the database board yet. You MUST explicitly invite the user to review, edit, or select which draft tasks to save (e.g. "Aku sudah siapkan draft tugasnya di bawah ini! Yuk tinjau dan tentukan mana saja yang mau kamu simpan ke board:"). NEVER say "Semua task ini sudah masuk ke board" or "Sudah saya simpan ke database" — that is factually false!
   - BROAD / GENERIC GOAL: If the user's request is generic or broad (e.g., "Paid search", "SEO", "marketing campaign", "website redesign") and does NOT explicitly mention a specific assignee (@name), a specific deadline/due date, a specific project name (#ProjectName), or any highly specific single action, you MUST logically break it down into multiple actionable tasks (minimum 3 tasks), regardless of how few words the user prompt is.
   - SPECIFIC TASK: If it is a single specific action, explicitly assigns work (@name), or specifies a distinct project (#ProjectName), generate EXACTLY ONE task per each action.
   - Naming Convention (project_name): Task titles MUST ALWAYS be in English, regardless of the prompt's language. The format MUST be "[Context/Brand] Task Title". Extract the unique context prefix (e.g. brand, activity, or game title). Prepend step numbers (e.g. "[Part 1] Task Title" or "1. Task Title") so the sequence and order of execution are clear.
7. If the user wants to INVITE or ADD A MEMBER to the workspace (e.g. "invite @budi ke workspace", "undang siti@email.com", "tambahkan @john ke tim", "invite member"):
   - Return "response_type": "invite_member".
   - Put target username or email in "username_or_email" (strip '@' prefix if present).
   - Put target role in "role" ("admin", "member", or "viewer", default "member").
   - Write a warm confirmation in "chat_message" explaining that the invitation is being sent.
8. Language Constraint: You MUST write the "chat_message" and task "description" and "subtasks" in the EXACT language used in the user's prompt (usually Indonesian or English). Make the description explanation simple enough for a layperson.
9. Formatting Constraint: In "chat_message", ALWAYS write multi-point advice, recommendations, steps, priorities, or suggestions as a clean, structured bulleted list (e.g. "- **Poin Utama** - Penjelasan singkat"). NEVER output dense essay-like paragraphs for advice, recommendations, or multi-step guidance. Use double linebreaks (\n\n) between paragraphs and bullet items so the response is structured, scannable, and easy to read at a glance.
10. Extract URLs: If there are any URLs or links (e.g. http://, https://) mentioned in the user's prompt, extract them into the "supporting_access" field (separated by newlines). DO NOT include or repeat these URLs inside the "description" field.
11. Scope Restriction: You are Luruka, a productivity and project management assistant. You MUST ONLY discuss topics related to work, task management, scheduling, project coordination, time estimation, business workflows, and productivity. If the user asks about unrelated topics (such as cooking recipes, general entertainment, fiction, gaming advice, etc.), you MUST politely decline the request in the prompt's language, explaining that your expertise is limited to managing tasks and productivity on alurku., and suggest how they can use you instead.
12. BRAND ICONOGRAPHY RULE: Use clean, professional Markdown typography (bolding, clean line breaks, bullet points, code blocks). Do NOT overuse raw OS emojis (such as 🚀, ✨, 🎉, 📌, ⚠️, 🔍) in every sentence. Keep output text clean, modern, and aligned with alurku.'s flat design identity.

JSON SCHEMA:
{
  "response_type": "chat" | "tasks" | "search" | "update_task" | "invite_member" | "create_subtasks",
  "chat_message": "Friendly, supportive, and conversational reply in the language used by the user. ALWAYS format advice, recommendations, or multi-point answers as clean Markdown bulleted lists (- **Point** - Explanation). NEVER output dense essay paragraphs.",
  "target_board_name": "Optional board/project name extracted from #BoardName or 'board X' if specified in prompt",
  "target_status_filter": "Optional current status filter (Open/In Progress/Done/Rejected) if user specifies updating tasks with a specific status",
  "search_query": "space-separated keywords representing target filters (e.g., 'budi overdue' or 'Design High') if response_type is 'search', 'update_task', or 'create_subtasks'. Otherwise leave empty.",
  "subtasks": ["subtask 1", "subtask 2"],
  "username_or_email": "Target username or email if response_type is 'invite_member'. Otherwise leave empty.",
  "role": "Target role (member/admin/viewer) if response_type is 'invite_member'. Default 'member'.",
  "updates": {
    "status": "Optional new status (Open/In Progress/Done/Rejected)",
    "deadline": "Optional YYYY-MM-DD",
    "project_name": "Optional new title",
    "category": "Optional new category",
    "requester": "Optional new assignee (@name)",
    "description": "Optional new description"
  },
  "tasks": [
    {
      "project_name": "[Context] Actionable Title in ENGLISH ONLY",
      "suggested_project": "Extract project name identified by '#' (e.g. '#Marketing'). Leave empty if none.",
      "requester": "If assigning TO someone, use '@username' (e.g. '@budi'). Default to '@${currentUser}' if unspecified.",
      "category": "Identify the best category (e.g. Development, Design, Marketing). If none fit, create a short new category name in English.",
      "impact": "High, Medium, or Low",
      "deadline": "YYYY-MM-DD. Ensure year is ${currentYear} or later. Must be >= ${getLocalToday()}. Extract ONLY if explicitly mentioned, otherwise leave empty.",
      "auto_nudge": "Boolean. Return true ONLY if the user explicitly asks to be reminded or notified.",
      "etc": "Estimate the REALISTIC time consumption in hours (e.g. 0.5, 1, 1.5, 2.5, 3.0, 4.0, 8.0). Base this heavily on task complexity.",
      "description": "Detailed and comprehensive brief in markdown format. DO NOT include @ or # routing tags here. DO NOT include any URLs here.",
      "supporting_access": "URLs/links found in the prompt (separated by newline). Leave empty if none.",
      "subtasks": ["Break down the task into 3-5 actionable sub-tasks as an array of strings."]
    }
  ]
}

USER REQUEST:
"""${userPrompt}"""${buildContextPromptSnippet()}`;

      const resAi = await axios.post('/api/ai/generate', { prompt: aiPrompt, provider: 'auto' });
      const rawText = resAi?.data?.text || '';
      let aiResponse = safeParseJSON(rawText);

      if (!aiResponse || typeof aiResponse !== 'object') {
        const cleanText = (rawText || '').trim();
        const isRawJson = cleanText.startsWith('{') || cleanText.includes('"response_type"') || cleanText.includes('"action"');
        aiResponse = {
          response_type: 'chat',
          chat_message: isRawJson 
            ? tMsg('Aku mengerti maksudmu, tapi bisakah kamu sebutkan detailnya satu per satu supaya aku bisa bantu dengan rapi? (ง •̀_•́)ง', 'Aku mengerti maksudmu, tapi bisakah kamu sebutkan detailnya satu per satu supaya aku bisa bantu dengan rapi? (ง •̀_•́)ง')
            : (rawText || tMsg('Sorry, I could not parse the response.', 'Maaf, aku tidak bisa memproses respons ini.')),
          tasks: []
        };
      }
      setIsProcessing(false);
      
      const replyText = aiResponse.chat_message || rawText || '';
      if (replyText) {
        setChatHistory((prev) => [
          ...prev,
          { id: Math.random().toString(), sender: 'ai', text: replyText }
        ]);
      }

      // Handle Invite Member Intent
      if (aiResponse.response_type === 'invite_member' && aiResponse.username_or_email && activeWorkspace?.id) {
        const inviteTarget = aiResponse.username_or_email.replace(/^@/, '').trim();
        const inviteRole = aiResponse.role || 'member';
        axios
          .post(`/api/workspaces/${activeWorkspace.id}/invite`, {
            username_or_email: inviteTarget,
            role: inviteRole,
          })
          .then(() => {
            showNotification(
              tMsg(`Successfully invited @${inviteTarget}!`, `Berhasil mengundang @${inviteTarget}!`),
              'success'
            );
          })
          .catch((err) => {
            showNotification(err.response?.data?.detail || tMsg('Failed to send invite', 'Gagal mengirim undangan'), 'error');
          });
      }

      if (aiResponse.response_type === 'search' && (aiResponse.search_query || aiResponse.target_board_name)) {
        setIsProcessing(true);
        setLoadingText(tMsg('Searching database...', 'Mencari di database...'));
        try {
          let targetBoardName = (aiResponse.target_board_name || '').trim();

          // Fallback: If target_board_name was not extracted by LLM, inspect user prompt
          if (!targetBoardName) {
            const textToCheck = (userPrompt + ' ' + (aiResponse.search_query || '')).toLowerCase();
            const foundBoard = (boards || []).find(b => {
              const bName = b.name.toLowerCase();
              return textToCheck.includes(`#${bName}`) || 
                     textToCheck.includes(`project ${bName}`) ||
                     textToCheck.includes(`proyek ${bName}`) ||
                     textToCheck.includes(`board ${bName}`) ||
                     textToCheck.includes(`project name ${bName}`) ||
                     textToCheck.includes(`di project ${bName}`) ||
                     textToCheck.includes(`di board ${bName}`);
            });
            if (foundBoard) {
              targetBoardName = foundBoard.name;
            }
          }

          let searchBoardId = (selectedBoard && selectedBoard.id !== 'global') ? selectedBoard.id : null;
          let matchedBoardObj = null;

          if (targetBoardName) {
            const targetClean = targetBoardName.toLowerCase().replace(/^#/, '').trim();
            matchedBoardObj = (boards || []).find(b => 
              b.name.toLowerCase() === targetClean || b.name.toLowerCase().includes(targetClean)
            );
            if (matchedBoardObj) searchBoardId = matchedBoardObj.id;
          }

          const boardParam = searchBoardId ? `&board_id=${searchBoardId}` : '';
          const queryToSearch = aiResponse.search_query || targetBoardName || '';
          const res = await axios.get(`/api/tasks/search?q=${encodeURIComponent(queryToSearch)}${boardParam}`);
          const results = res.data?.results || [];
          
          // Store ALL results for pagination
          const allResults = results.map(t => {
            const boardName = (boards || []).find((b) => b.id === t.board_id)?.name || 'General';
            return {
              id: t.id,
              project_name: t.project_name,
              board_name: boardName,
              status: t.status,
              category: t.category,
              deadline: t.deadline
            };
          });

          const PAGE_SIZE = 5;
          const firstPage = allResults.slice(0, PAGE_SIZE);
          const hasMore = allResults.length > PAGE_SIZE;

          // Save full results for "show more" pagination
          setLastSearchResults(allResults.length > 0 ? allResults : null);
          setLastSearchDisplayed(allResults.length > 0 ? PAGE_SIZE : 0);

          const boardLabel = matchedBoardObj ? ` di project **"${matchedBoardObj.name}"**` : '';
          const botText = results.length === 0 
            ? tMsg(`Aku tidak menemukan tugas${boardLabel} di database.`, `Aku tidak menemukan tugas${boardLabel} di database.`)
            : hasMore
              ? tMsg(
                  `Aku menemukan **${allResults.length} task**${boardLabel}. Menampilkan ${PAGE_SIZE} pertama. Ketik "lainnya" untuk melihat sisanya.`,
                  `Aku menemukan **${allResults.length} task**${boardLabel}. Menampilkan ${PAGE_SIZE} pertama. Ketik "lainnya" untuk melihat sisanya.`
                )
              : tMsg(
                  `Aku menemukan **${allResults.length} task**${boardLabel}. Ini hasilnya:`,
                  `Aku menemukan **${allResults.length} task**${boardLabel}. Ini hasilnya:`
                );

          setChatHistory(prev => [...prev, {
            id: Math.random().toString(),
            sender: 'ai',
            text: botText,
            searchResults: firstPage
          }]);
        } catch (err) {
          setChatHistory(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: 'ai',
              text: tMsg('Failed to perform search. Please try again.', 'Gagal melakukan pencarian. Silakan coba lagi.')
            }
          ]);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      if (aiResponse.response_type === 'update_task') {
        setIsProcessing(true);
        setLoadingText(tMsg('Locating tasks to update...', 'Mencari task untuk diperbarui...'));
        try {
          const searchQuery = (aiResponse.search_query || '').trim();
          const targetBoardName = (aiResponse.target_board_name || '').trim();
          const targetStatusFilter = (aiResponse.target_status_filter || '').trim();
          const updates = aiResponse.updates || {};

          // Standardize requested status string
          if (updates.status) {
            const stLower = updates.status.toLowerCase().replace(/[^a-z]/g, '');
            if (stLower === 'inprogress') updates.status = 'In Progress';
            else if (stLower === 'open' || stLower === 'pending') updates.status = 'Open';
            else if (stLower === 'done' || stLower === 'completed') updates.status = 'Done';
            else if (stLower === 'rejected') updates.status = 'Rejected';
          }

          // Resolve board ID if board name specified
          let matchedBoardId = null;
          if (targetBoardName) {
            const targetClean = targetBoardName.toLowerCase().replace(/^#/, '');
            const matchedBoard = (boards || []).find(b => b.name.toLowerCase() === targetClean || b.name.toLowerCase().includes(targetClean));
            if (matchedBoard) matchedBoardId = matchedBoard.id;
          } else if (selectedBoard && selectedBoard.id !== 'global') {
            matchedBoardId = selectedBoard.id;
          }

          let matchingTasks = [];
          if (matchedBoardId) {
            matchingTasks = (tasks || []).filter(t => parseInt(t.board_id) === parseInt(matchedBoardId));
          } else {
            matchingTasks = [...(tasks || [])];
          }

          // Filter by status if specified (e.g. pending/open)
          if (targetStatusFilter) {
            const filterLower = targetStatusFilter.toLowerCase().replace(/[^a-z]/g, '');
            matchingTasks = matchingTasks.filter(t => {
              const curStatus = (t.status || 'Open').toLowerCase().replace(/[^a-z]/g, '');
              if (filterLower === 'pending' || filterLower === 'open') return curStatus === 'open' || curStatus === 'pending';
              if (filterLower === 'inprogress') return curStatus === 'inprogress';
              return curStatus === filterLower;
            });
          }

          // Filter by title search query if present
          if (searchQuery) {
            const qLower = searchQuery.toLowerCase();
            matchingTasks = matchingTasks.filter(t => 
              (t.project_name || '').toLowerCase().includes(qLower) || 
              (t.category || '').toLowerCase().includes(qLower)
            );
          }

          if (matchingTasks.length === 0) {
            const targetLabel = targetBoardName ? ` board **#${targetBoardName}**` : '';
            setChatHistory(prev => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: 'ai',
                text: tMsg(
                  `I couldn't find any tasks matching your update criteria in${targetLabel}.`,
                  `Aku tidak menemukan task yang cocok dengan kriteria pembaruanmu di${targetLabel}.`
                )
              }
            ]);
          } else if (matchingTasks.length > 1) {
            // SAFETY: Reject bulk update softly — only 1 task at a time
            const taskListCards = matchingTasks.slice(0, 5).map(t => ({
              id: t.id,
              project_name: t.project_name,
              board_name: (boards || []).find((b) => b.id === t.board_id)?.name || 'General',
              status: t.status,
              category: t.category,
              deadline: t.deadline
            }));

            setChatHistory(prev => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: 'ai',
                text: tMsg(
                  `Demi keamanan datamu, aku hanya bisa update satu task dalam satu waktu ya. Aku menemukan **${matchingTasks.length} task** yang cocok — coba sebutkan judul task yang lebih spesifik, atau klik salah satu task di bawah ini untuk melihat detailnya:`,
                  `Demi keamanan datamu, aku hanya bisa update satu task dalam satu waktu ya. Aku menemukan **${matchingTasks.length} task** yang cocok — coba sebutkan judul task yang lebih spesifik, atau klik salah satu task di bawah ini untuk melihat detailnya:`
                ),
                searchResults: taskListCards
              }
            ]);
          } else {
            // Single task match — safe to update
            setLoadingText(tMsg('Applying update...', 'Menerapkan pembaruan...'));
            const targetTask = matchingTasks[0];

            let formattedDeadline = updates.deadline || targetTask.deadline || '';
            if (updates.deadline) {
              const d = new Date(updates.deadline);
              if (!isNaN(d.getTime())) {
                formattedDeadline = d.toISOString().split('T')[0];
              }
            }

            const promises = [];
            if (updates.status) {
              promises.push(axios.put(`/api/tasks/${targetTask.id}`, { status: updates.status }));
            }

            const detailsPayload = {
              project_name: updates.project_name || targetTask.project_name || '',
              requester: updates.requester || targetTask.requester || `@${currentUser}`,
              category: updates.category || targetTask.category || 'General',
              description: updates.description !== undefined ? updates.description : (targetTask.description || ''),
              supporting_access: targetTask.supporting_access || '',
              start_date: targetTask.start_date ? targetTask.start_date.split(' ')[0] : new Date().toISOString().split('T')[0],
              deadline: formattedDeadline,
              impact: targetTask.impact || 'Medium',
              etc: targetTask.etc || 2.0,
              auto_nudge: targetTask.auto_nudge || false,
              recurring: targetTask.recurring || 'none',
              status: updates.status || targetTask.status || 'Open',
              board_id: targetTask.board_id || null,
            };

            promises.push(axios.put(`/api/tasks/${targetTask.id}/details`, detailsPayload));
            await Promise.all(promises);
            if (fetchTasks) fetchTasks();

            const updateSummary = Object.entries(updates)
              .filter(([, v]) => v)
              .map(([k, v]) => `**${k}** → ${v}`)
              .join(', ');

            setChatHistory(prev => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: 'ai',
                text: tMsg(
                  `✅ Berhasil memperbarui task **"${targetTask.project_name}"** (${updateSummary})`,
                  `✅ Berhasil memperbarui task **"${targetTask.project_name}"** (${updateSummary})`
                )
              }
            ]);
          }
        } catch (err) {
          console.error(err);
          setChatHistory(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: 'ai',
              text: tMsg('Failed to update task(s). Please try again.', 'Gagal memperbarui task. Silakan coba lagi.')
            }
          ]);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      if (aiResponse.response_type === 'tasks' && Array.isArray(aiResponse.tasks) && aiResponse.tasks.length > 0) {
        setGeneratedTasks([]);
        const extractedTasks = aiResponse.tasks;
        
        for (let i = 0; i < extractedTasks.length; i++) {
          setLoadingText(
            tMsg(
              `Drafting task ${i + 1} of ${extractedTasks.length}...`,
              `Menyusun tugas ${i + 1} dari ${extractedTasks.length}...`
            )
          );
          const delay = 800 + Math.random() * 500;
          await new Promise((res) => setTimeout(res, delay));

          let matchedBoardId = targetBoard?.id || '';
          if (extractedTasks[i].suggested_project) {
            const sp = extractedTasks[i].suggested_project.replace('#', '').toLowerCase().trim();
            let matched = (boards || []).find((b) => b.name.toLowerCase() === sp);
            if (!matched) {
              matched = (boards || []).find((b) => b.name.toLowerCase().includes(sp));
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
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      const errorDetail = e.response?.data?.detail || e.message || 'Unknown error';
      setChatHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: language === 'id' 
            ? `Maaf, terjadi kesalahan: ${errorDetail}` 
            : `Sorry, I encountered an issue: ${errorDetail}`
        }
      ]);
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
    destRef.current = '/dashboard';
    if (isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0) {
      setCancelConfirmOpen(true);
    } else {
      close();
    }
  };

  const handleLogoClick = () => {
    handleNavClick('dashboard');
  };

  const handleNavClick = (destination) => {
    const dest = typeof destination === 'string' ? destination : 'dashboard';
    let destPath = '/dashboard';
    if (dest === 'workspace') {
      const slug = activeWorkspace?.name ? activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'main';
      destPath = `/workspace/${slug}`;
    }

    const navigateImmediately = () => {
      window.history.pushState({}, '', destPath);
      window.dispatchEvent(new CustomEvent('alurku-navigate'));
      setIsProactiveAIOpen(false);
    };

    if (isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0) {
      destRef.current = destPath;
      setCancelConfirmOpen(true);
    } else {
      navigateImmediately();
    }
  };

  const confirmSkipOrCancel = () => {
    setIsCancelling(true);
    setInboxTasks([]);
    setGeneratedTasks([]);
    setIsCartVisible(false);
    setIsCancelling(false);
    setCancelConfirmOpen(false);
    
    if (destRef.current === 'reset') {
      setPrompt('');
      setChatHistory([
        {
          id: 'welcome',
          sender: 'ai',
          text: language === 'id' 
            ? 'Halo! Aku Luruka, asisten cerdas pribadimu di alurku. 😊\n\nKamu bisa menuliskan rencana kerjamu untuk kujabarkan menjadi tugas terstruktur secara otomatis, atau tanyakan apapun untuk berdiskusi!'
            : 'Hello! I am Luruka, your personal smart assistant at alurku. 😊\n\nYou can describe your goals to automatically generate a to-do list, or ask me anything to discuss your work!'
        }
      ]);
    } else {
      window.history.pushState({}, '', destRef.current);
      window.dispatchEvent(new CustomEvent('alurku-navigate'));
      setIsProactiveAIOpen(false);
    }
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
      {/* Full-screen WebGL Shader Canvas Background (Dark Mode Only) */}
      {isDarkMode && (
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-colors duration-700 ease-in-out">
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          {/* Soft overlay to calm the colors */}
          <div className="absolute inset-0 bg-[#090D16]/40 transition-colors duration-700 ease-in-out" />
        </div>
      )}

      {/* Floating organic blurred flow blobs (Dark Mode Only) */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-40 transition-opacity duration-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-[#FACC15]/30 rounded-full blur-[120px] animate-pulse" style={{ animation: 'flow 15s infinite alternate ease-in-out' }}></div>
          <div className="absolute top-1/3 left-1/4 w-150 h-150 rounded-full blur-[100px] bg-[#001f3f]/50" style={{ animation: 'flow 20s infinite alternate-reverse ease-in-out' }}></div>
        </div>
      )}

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

      {/* Top Header Navigation Bar (Refactored to Shared Component) */}
      <HeaderNavigation
        currentPath={window.location.pathname}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        language={language}
        setLanguage={setLanguage}
        currentUser={currentUser}
        avatarsMap={avatarsMap}
        onLogoClick={handleLogoClick}
        onNavClick={handleNavClick}
      />

      {/* Main Workspace layout */}
      <div className="w-full relative min-h-screen lg:h-screen lg:overflow-hidden">
        {/* Sidebar History - Fixed to far left edge */}
        <div className={`fixed left-4 lg:left-6 top-28 bottom-8 z-30 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'} border-r ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} pr-4 hidden lg:flex`}>
          <button onClick={startNewChat} className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-4 transition-all shadow-sm ${isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-[#111E38] border border-neutral-200'}`}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            {language === 'id' ? 'Chat Baru' : 'New Chat'}
          </button>
          
          <div className="relative mb-4 shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-neutral-400">search</span>
            <input 
              type="text" 
              value={searchSessionQuery}
              onChange={e => setSearchSessionQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari riwayat...' : 'Search history...'}
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-colors ${isDarkMode ? 'bg-neutral-900 focus:bg-neutral-800 text-white placeholder-neutral-500' : 'bg-neutral-100 focus:bg-white border focus:border-sky-400 text-[#111E38]'}`}
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-1 pb-4 min-h-0">
            {chatSessions.filter(s => s.title.toLowerCase().includes(searchSessionQuery.toLowerCase())).map(session => (
              <div 
                key={session.id}
                onClick={() => loadSession(session)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${activeSessionId === session.id ? (isDarkMode ? 'bg-[#FACC15]/20 text-[#FACC15]' : 'bg-[#FACC15]/20 text-[#111E38] font-bold') : (isDarkMode ? 'hover:bg-neutral-800/50 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600')}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`material-symbols-outlined text-[14px] shrink-0 ${session.is_pinned ? 'text-[#FACC15]' : 'text-neutral-400'}`}>
                    {session.is_pinned ? 'push_pin' : 'chat_bubble'}
                  </span>
                  <span className="text-xs truncate">{session.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={(e) => togglePinSession(e, session)} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-[#FACC15] transition-colors">
                    <span className="material-symbols-outlined text-[14px]">push_pin</span>
                  </button>
                  <button onClick={(e) => deleteSession(e, session.id)} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
            {chatSessions.length === 0 && (
              <div className="text-center p-4 text-xs text-neutral-500">
                {language === 'id' ? 'Belum ada riwayat' : 'No history yet'}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area (Chat + Inbox) */}
        <div className={`w-full mx-auto flex flex-col lg:flex-row gap-8 items-stretch min-h-screen lg:h-screen pt-28 pb-8 px-6 transition-all duration-300 ${
          isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0
            ? 'max-w-370'
            : 'max-w-7xl'
        } ${
          isSidebarOpen ? 'lg:pl-72' : ''
        }`}>
          {/* Left Side: Input panel & AI task output */}
          <div
          className={`flex-1 flex flex-col transition-all duration-500 min-h-0 ${
            isCartVisible || inboxTasks.length > 0 || generatedTasks.length > 0
              ? 'lg:pr-8 lg:border-r border-neutral-200 dark:border-neutral-800'
              : ''
          }`}
        >
          <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 min-h-0 animate-elegant">
            <div className="shrink-0 mb-4">
              {/* Active Assistant badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm border ${
                isDarkMode 
                  ? 'bg-[#FACC15]/10 border-[#FACC15]/30 text-[#EAB308]' 
                  : 'bg-[#FACC15]/20 border-[#FACC15]/40 text-[#574500]'
              }`}>
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                AI Assistant Active
              </div>

              {/* Dynamic Headline */}
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none mb-2 ${
                isDarkMode ? 'text-white' : 'text-[#001f3f]'
              }`}>
                {tMsg('Hi there! How can alurku make your workday easier today?', 'Halo, bagaimana alurku bisa membantu pekerjaanmu hari ini?')}
              </h1>
            </div>

            {/* Dashboard Overview Shortcuts */}
            {(() => {
              const activeCount = (tasks || []).filter(t => 
                isUserAssigned(t, currentUser) && 
                t.status !== 'Done' && 
                t.status !== 'Rejected'
              ).length;
              const todayCount = (tasks || []).filter(t => {
                if (!isUserAssigned(t, currentUser)) return false;
                if (t.status === 'Done' || t.status === 'Rejected') return false;
                const todayStr = getLocalToday();
                return t.deadline && t.deadline.startsWith(todayStr);
              }).length;
              const overdueCount = (tasks || []).filter(t => {
                if (!isUserAssigned(t, currentUser)) return false;
                if (t.status === 'Done' || t.status === 'Rejected') return false;
                if (!t.deadline) return false;
                const todayStr = getLocalToday();
                const deadlineDateStr = t.deadline.split(' ')[0];
                return deadlineDateStr < todayStr;
              }).length;

              const navigateToGlobalKanban = (filterType) => {
                setSelectedBoard({
                  id: 'global',
                  name: language === 'id' ? 'Lihat Gambaran Besar' : 'See the Big Picture',
                  role: 'owner',
                  isVirtual: true
                });
                setViewMode('kanban');
                setShowMyTasks(true);
                setSearchQuery('');
                setFilterStatus('All');
                setFilterCategory('All');
                setFilterAssignee('All');

                if (filterType === 'active') {
                  setShowOverdueOnly(false);
                  setShowDueTodayOnly(false);
                } else if (filterType === 'today') {
                  setShowOverdueOnly(false);
                  setShowDueTodayOnly(true);
                } else if (filterType === 'overdue') {
                  setShowOverdueOnly(true);
                  setShowDueTodayOnly(false);
                }
                close();
              };

              return (
                <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
                  <div 
                    onClick={() => navigateToGlobalKanban('active')}
                    className={`p-3 rounded-2xl border flex flex-col justify-between shadow-sm cursor-pointer hover:border-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                      isDarkMode ? 'bg-neutral-800/40 border-white/5' : 'bg-white border-black/5'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-[#0b1c30]/40'}`}>
                      {tMsg('Active Tasks', 'Tugas Aktif')}
                    </span>
                    <span className={`text-xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
                      {activeCount}
                    </span>
                  </div>
                  <div 
                    onClick={() => navigateToGlobalKanban('today')}
                    className={`p-3 rounded-2xl border flex flex-col justify-between shadow-sm cursor-pointer hover:border-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                      isDarkMode ? 'bg-neutral-800/40 border-white/5' : 'bg-white border-black/5'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-[#0b1c30]/40'}`}>
                      {tMsg('Due Today', 'Hari Ini')}
                    </span>
                    <span className={`text-xl font-black mt-1 ${todayCount > 0 ? 'text-[#FACC15]' : isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
                      {todayCount}
                    </span>
                  </div>
                  <div 
                    onClick={() => navigateToGlobalKanban('overdue')}
                    className={`p-3 rounded-2xl border flex flex-col justify-between shadow-sm cursor-pointer hover:border-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                      isDarkMode ? 'bg-neutral-800/40 border-white/5' : 'bg-white border-black/5'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-[#0b1c30]/40'}`}>
                      {tMsg('Overdue', 'Terlambat')}
                    </span>
                    <span className={`text-xl font-black mt-1 ${overdueCount > 0 ? 'text-rose-500' : isDarkMode ? 'text-white' : 'text-[#001f3f]'}`}>
                      {overdueCount}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* MAIN WORKSPACE WORK AREA (TAKES ALL FLEX HEIGHT) */}
            <div className="flex-1 flex flex-col min-h-0 mb-4 overflow-hidden relative">
              
              {/* Case 1: Generated Task Drafts Editor List */}
              {generatedTasks.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0 animate-elegant">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-lg">
                      {tMsg('Generated Tasks', 'Tugas Dihasilkan')}
                    </h3>
                    <div className="flex items-center gap-3">
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
                      <span className="text-xs text-neutral-400">|</span>
                      <button
                        onClick={() => setGeneratedTasks([])}
                        className="text-xs font-bold text-neutral-400 hover:text-red-500 hover:underline"
                      >
                        {tMsg('Clear Draft', 'Hapus Draf')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0 custom-scrollbar pb-16">
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
                          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            {t.description}
                          </p>
                          {t.subtasks && t.subtasks.length > 0 && (
                            <div className="mt-3 space-y-1 pl-4 border-l-2 border-neutral-300 dark:border-neutral-700">
                              {t.subtasks.map((st, sIdx) => (
                                <div key={sIdx} className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                                  <span>{st}</span>
                                </div>
                              ))}
                            </div>
                          )}
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
                    <div ref={tasksEndRef} className="h-4 shrink-0" />
                  </div>

                  {/* Actions Bar Sticky to Task View Bottom */}
                  <div className="absolute bottom-2 right-2 shrink-0 z-20 pointer-events-none flex gap-2">
                    <button
                      onClick={handleSaveSelected}
                      disabled={isSaving || isProcessing || !generatedTasks.some((t) => t.selected)}
                      className="bg-[#111E38] dark:bg-white text-white dark:text-[#111E38] px-8 py-3 rounded-full font-bold text-xs shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 pointer-events-auto"
                    >
                      {isSaving ? <LoadingSpinner /> : '🚀'}
                      {isSaving
                        ? tMsg('Processing...', 'Memproses...')
                        : tMsg('Add to Inbox', 'Tambahkan ke Kotak Masuk')}
                    </button>
                  </div>
                </div>
              )}

              {/* Case 2: Conversational Chat bubble stream */}
              {generatedTasks.length === 0 && (
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 custom-scrollbar pb-4">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          chat.sender === 'user'
                            ? 'bg-[#FACC15] text-[#111E38] font-bold rounded-tr-none'
                            : isDarkMode
                            ? 'bg-neutral-800/80 border border-white/5 text-white rounded-tl-none'
                            : 'bg-white border border-neutral-200 text-[#111E38] rounded-tl-none'
                        }`}
                      >
                        {chat.sender === 'user' ? chat.text : renderChatText(chat.text)}
                        {chat.searchResults && chat.searchResults.length > 0 && (
                          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50 w-full min-w-70">
                            {chat.searchResults.map((task) => (
                              <div 
                                key={task.id} 
                                className="flex flex-col p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-sky-400 dark:hover:border-[#FACC15] transition-all cursor-pointer shadow-sm group/task text-left"
                                onClick={() => {
                                  if (setSelectedTask) {
                                    setSelectedTask(task);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-[#111E38] dark:text-slate-200 line-clamp-2 group-hover/task:text-sky-500 dark:group-hover/task:text-[#EAB308] transition-colors leading-snug">
                                    {task.project_name}
                                  </h4>
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                    task.status === 'Done' 
                                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                      : task.status === 'In Progress'
                                        ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                  }`}>
                                    {task.status || 'Open'}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-[9px] font-semibold text-neutral-500 dark:text-neutral-400">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75h22.5M2.25 6h22.5M2.25 19.5h22.5" />
                                    </svg>
                                    {task.board_name || 'General'}
                                  </span>
                                  {task.category && (
                                    <span className="flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-sky-400 dark:bg-[#FACC15]"></span>
                                      {task.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Bouncing Typing / Processing loader bubble inside Chat list */}
                  {isProcessing && (
                    <div className="flex justify-start animate-slide-up">
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm ${
                        isDarkMode
                          ? 'bg-neutral-800/80 border border-white/5 text-white rounded-tl-none'
                          : 'bg-white border border-neutral-200 text-[#111E38] rounded-tl-none'
                      }`}>
                        <div className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin shrink-0 ${
                          isDarkMode ? 'border-[#FACC15]' : 'border-sky-500'
                        }`}></div>
                        <span className={`text-xs font-bold uppercase tracking-wider animate-pulse ${
                          isDarkMode ? 'text-[#FACC15]' : 'text-sky-500'
                        }`}>
                          {loadingText}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Default prompt suggestions (only when greeting is the only message) */}
            {generatedTasks.length === 0 && chatHistory.length === 1 && !isProcessing && (
              <div className="flex flex-wrap gap-2 mb-4 animate-elegant shrink-0">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setPrompt(sug);
                    }}
                    className={`px-4 py-2 rounded-full border transition-all text-xs font-semibold ${
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

            {/* Input Form container */}
            <form onSubmit={handleSubmit} className="w-full relative z-20 animate-elegant mb-4 shrink-0">
              {/* Localized Aura glow in Light Mode */}
              {!isDarkMode && (
                <>
                  {/* Core glow */}
                  <div className="absolute inset-0 -m-2.5 bg-sky-400/35 rounded-[34px] blur-xl opacity-90 pointer-events-none -z-10 animate-pulse" />
                  {/* Wide ambient aura (spreads far in all directions) */}
                  <div className="absolute inset-0 -m-7.5 bg-sky-300/25 rounded-[38px] blur-3xl opacity-80 pointer-events-none -z-10" />
                </>
              )}
              {/* Slash commands autocomplete popup */}
              {isSlashMenuOpen && (
                <div className="absolute left-4 bottom-full mb-2 w-72 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-48 overflow-y-auto py-2 mac-animate">
                  {(() => {
                    const filtered = slashCommands.filter(c => c.cmd.includes(slashQuery));
                    if (filtered.length > 0) {
                      return filtered.map((c, idx) => (
                        <div
                          key={c.cmd}
                          ref={(el) => {
                            if (slashIndex === idx && el) {
                              el.scrollIntoView({ block: 'nearest' });
                            }
                          }}
                          className={`px-4 py-2 cursor-pointer text-sm font-semibold flex flex-col transition-colors ${
                            slashIndex === idx
                              ? 'bg-[#FACC15]/20 text-[#111E38] dark:text-white'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-300'
                          }`}
                          onClick={() => {
                            setPrompt(c.cmd + ' ');
                            setIsSlashMenuOpen(false);
                            textareaRef.current?.focus();
                          }}
                        >
                          <span className="font-bold text-[#FACC15]">{c.cmd}</span>
                          <span className="text-xs text-neutral-400 font-medium">{c.desc}</span>
                        </div>
                      ));
                    }
                    return <div className="px-4 py-3 text-sm text-neutral-500 italic">No commands found</div>;
                  })()}
                </div>
              )}

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
                      
                      // Handle slash command autocomplete
                      if (val.startsWith('/') && !val.includes(' ')) {
                        const q = val.substring(1).toLowerCase();
                        setSlashQuery(q);
                        setIsSlashMenuOpen(true);
                        setSlashIndex(0);
                        setIsMentioning(false);
                        setIsBoardMentioning(false);
                        return;
                      } else {
                        setIsSlashMenuOpen(false);
                      }

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
                      if (isSlashMenuOpen) {
                        const filtered = slashCommands.filter(c => c.cmd.includes(slashQuery));
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSlashIndex((prev) => (prev + 1) % (filtered.length || 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSlashIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
                        } else if (e.key === 'Enter' || e.key === 'Tab') {
                          if (filtered.length > 0) {
                            e.preventDefault();
                            setPrompt(filtered[slashIndex].cmd + ' ');
                            setIsSlashMenuOpen(false);
                          }
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsSlashMenuOpen(false);
                        }
                      } else if (isMentioning) {
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
                      'Describe your goal, ask questions, or type "/" for commands...',
                      'Ceritakan rencanamu, tanyakan sesuatu, atau ketik "/" untuk menu perintah...'
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
                <div className="absolute left-4 bottom-full mb-2 w-64 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2 mac-animate">
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
                          ref={(el) => {
                            if (mentionIndex === idx && el) {
                              el.scrollIntoView({ block: 'nearest' });
                            }
                          }}
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
                <div className="absolute left-4 bottom-full mb-2 w-64 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-50 max-h-40 overflow-y-auto py-2 mac-animate">
                  {(() => {
                    const boardOptions = boards.filter((b) => b.id !== 'global').map((b) => b.name);
                    const filtered = boardOptions.filter((m) => m.toLowerCase().includes(boardMentionQuery));
                    if (filtered.length > 0) {
                      return filtered.map((m, idx) => (
                        <div
                          key={m}
                          id={`board-item-${idx}`}
                          ref={(el) => {
                            if (boardMentionIndex === idx && el) {
                              el.scrollIntoView({ block: 'nearest' });
                            }
                          }}
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
