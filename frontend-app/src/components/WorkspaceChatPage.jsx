import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, IconPlus } from '../SharedUI';
import { HighlightText, stripHtml } from '../Utils';
import ChatMessage from '../ChatMessage';
import ChatSidebar from './ChatWorkspace/ChatSidebar';
import ChatHeader from './ChatWorkspace/ChatHeader';
import ChatMessageList from './ChatWorkspace/ChatMessageList';
import ChatInputArea from './ChatWorkspace/ChatInputArea';
import TaskDetailModal from '../TaskDetailModal';
import StartMeetingModal from './StartMeetingModal';

export default function WorkspaceChatPage() {
  const context = useAppContext();
  const {
    currentUser,
    boards,
    tasks,
    avatarsMap,
    language,
    notifications,
    handleReadNotification,
    userDirectory,
    dmConversations,
    setDmConversations,
    fetchDmConversations,
    workspaceChatTarget,
    setWorkspaceChatTarget,
    inboxChats,
    isInboxLoading,
    fetchInboxChats,
    handleMarkAllInboxAsRead,
    showNotification,
    formatDateMMM,
    accountStatus,
    isSuperAdmin,
    setSelectedTask,
    handleAskAITaskChat,
    handleToggleReaction,
    handleDeleteComment,
    deleteProjectChatMessage,
    handleNotificationTaskClick,
    activeWorkspace,
    selectedBoard,
    setSelectedBoard,
    isEditing,
    setIsEditing,
    handleDirectStatusChange,
    columns,
    editFormData,
    setEditFormData,
    handleRequesterChange,
    isMentioning: ctxIsMentioning,
    teamMembers,
    mentionQuery: ctxMentionQuery,
    insertMention: ctxInsertMention,
    categories,
    handleOpenAddBoard,
    handleOpenRenameBoard,
    handleOpenDeleteBoard,
    handleEditSubmit,
    subtasks,
    handleToggleSubtask,
    handleUpdateSubtaskAssignee,
    handleDeleteSubtask,
    handleSubtaskDragEnd,
    newSubtaskName,
    setNewSubtaskName,
    newSubtaskAssignee,
    setNewSubtaskAssignee,
    handleAddSubtask,
    comments,
    newComment,
    isAiReplying,
    handleCommentChange,
    insertCommentMention,
    handleAddComment,
    setIsDeleteConfirmOpen,
    startEditing,
    mentionIndex: ctxMentionIndex,
    setMentionIndex: ctxSetMentionIndex,
    setIsMentioning: ctxSetIsMentioning,
    isCommentMentioning,
    commentMentionQuery,
    commentMentionIndex,
    setCommentMentionIndex,
    setIsCommentMentioning,
    handleQuickLinkAdd,
    handleQuickLinkRemove,
    isSubtasksLoading,
    hasMoreComments,
    loadMoreComments,
    chatBg,
    isSubmitting,
    handleToggleAutoNudge,
    onlineUsers,
    lastWsMessage,
  } = context;

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [expandedBoards, setExpandedBoards] = useState({});
  const [boardTasks, setBoardTasks] = useState({});
  const [activeChat, setActiveChat] = useState(() => {
    if (workspaceChatTarget) return workspaceChatTarget;
    if (boards && boards.length > 0) {
      const b = boards.find(item => item.id !== 'global') || boards[0];
      return { type: 'project', id: b.id, name: `${b.name} (General)`, board_id: b.id };
    }
    return null;
  });

  useEffect(() => {
    if (workspaceChatTarget) {
      setActiveChat(workspaceChatTarget);
      setWorkspaceChatTarget(null);
    } else if (!activeChat || activeChat.type === 'inbox') {
      if (boards && boards.length > 0) {
        const b = boards.find(item => item.id !== 'global') || boards[0];
        if (b) {
          setActiveChat({ type: 'project', id: b.id, name: `${b.name} (General)`, board_id: b.id });
        }
      }
    }
  }, [workspaceChatTarget, setWorkspaceChatTarget, boards]);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Task Preview Sidebar Drawer State
  const [activeTaskPreview, setActiveTaskPreview] = useState(null);
  const [taskPreviewComments, setTaskPreviewComments] = useState([]);

  const handleOpenTaskPreview = useCallback((taskId) => {
    const targetId = (taskId && String(taskId) !== 'undefined' && String(taskId) !== 'null')
      ? taskId
      : (activeChat?.type === 'task' ? (activeChat.id || activeChat.task_id) : null);

    if (!targetId) {
      setActiveTaskPreview(null);
      setTaskPreviewComments([]);
      return;
    }

    const found = (tasks || []).find((t) => String(t.id) === String(targetId));
    if (found) {
      setActiveTaskPreview(found);
    }

    axios.get(`/api/tasks/${targetId}`)
      .then((res) => {
        const taskData = res.data?.task || res.data;
        if (taskData && typeof taskData === 'object') {
          setActiveTaskPreview(taskData);
        }
      })
      .catch(() => {
        if (!found && handleNotificationTaskClick) {
          handleNotificationTaskClick(targetId);
        }
      });

    axios.get(`/api/tasks/${targetId}/comments`)
      .then((res) => {
        const rawComments = res.data?.comments || res.data || [];
        setTaskPreviewComments(Array.isArray(rawComments) ? rawComments : []);
      })
      .catch(console.error);
  }, [tasks, activeChat, handleNotificationTaskClick]);

  useEffect(() => {
    if (activeChat?.type === 'task' && activeChat.id) {
      handleOpenTaskPreview(activeChat.id);
    } else {
      setActiveTaskPreview(null);
    }
  }, [activeChat?.id, activeChat?.type]);

  // Real-Time WebSocket Event Listener
  useEffect(() => {
    if (!lastWsMessage) return;

    if (lastWsMessage.type === 'chat_message') {
      if (fetchInboxChats) fetchInboxChats();
      if (fetchDmConversations && lastWsMessage.chat_type === 'dm') fetchDmConversations();

      const isMatchingChat =
        (activeChat?.type === 'dm' && lastWsMessage.chat_type === 'dm' && (String(lastWsMessage.target_id) === String(activeChat.partner) || String(lastWsMessage.sender) === String(activeChat.partner))) ||
        (activeChat?.type === 'project' && lastWsMessage.chat_type === 'project' && String(lastWsMessage.target_id) === String(activeChat.id)) ||
        (activeChat?.type === 'task' && lastWsMessage.chat_type === 'task' && String(lastWsMessage.target_id) === String(activeChat.id));

      if (isMatchingChat) {
        fetchMessages();
      }
    } else if (lastWsMessage.type === 'task_update') {
      if (activeTaskPreview && String(lastWsMessage.task_id) === String(activeTaskPreview.id || activeTaskPreview.task?.id)) {
        handleOpenTaskPreview(lastWsMessage.task_id);
      }
    } else if (lastWsMessage.type === 'activity') {
      if (fetchInboxChats) fetchInboxChats();
    }
  }, [lastWsMessage]);

  // Advanced Chat Features
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [activeBoardMembers, setActiveBoardMembers] = useState([]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewMessage(val);
    const match = val.match(/(?:^|\s)@([\w.-]*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
      setIsMentioning(true);
      setMentionIndex(0);
    } else {
      setIsMentioning(false);
    }
  };

  const insertMention = (username) => {
    const newVal = newMessage.replace(/(?:^|\s)@([\w.-]*)$/, ` @${username} `);
    setNewMessage(newVal);
    setIsMentioning(false);
  };

  // Filters State
  const [showMyTasksFilter, setShowMyTasksFilter] = useState(false);
  const [showUnreadFilter, setShowUnreadFilter] = useState(false);

  // DM State
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);
  const [newDmSearch, setNewDmSearch] = useState('');
  const [newDmSearchIndex, setNewDmSearchIndex] = useState(0);
  const [dmConvToDelete, setDmConvToDelete] = useState(null);

  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(!activeChat);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  useEffect(() => {
    fetchDmConversations();
    fetchInboxChats();
  }, []);

  useEffect(() => {
    if (activeChat?.type === 'inbox') {
      fetchInboxChats();
    }
  }, [activeChat?.type]);

  useEffect(() => {
    if (activeChat && activeChat.board_id && activeChat.board_id !== 'global') {
      axios
        .get(`/api/boards/${activeChat.board_id}/members`)
        .then((res) => setActiveBoardMembers(res.data.members || []))
        .catch(console.error);
    }
  }, [activeChat?.board_id]);

  const padTime = (n) => String(n).padStart(2, '0');
  const getLocalTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${padTime(now.getMonth() + 1)}-${padTime(now.getDate())} ${padTime(
      now.getHours()
    )}:${padTime(now.getMinutes())}:${padTime(now.getSeconds())}`;
  };

  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [latestMentionId, setLatestMentionId] = useState(null);
  const [dismissedMentions, setDismissedMentions] = useState(new Set());
  const sessionLastReadRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const lastMsgIdRef = useRef(null);

  React.useEffect(() => {
    initialScrollDoneRef.current = false;
    setFirstUnreadId(null);
    lastMsgIdRef.current = null;
    if (activeChat) {
      const storageKey =
        activeChat.type === 'project'
          ? `alurku_last_read_board_${activeChat.id}_${currentUser}`
          : `alurku_last_read_task_${activeChat.id}_${currentUser}`;
      sessionLastReadRef.current = localStorage.getItem(storageKey);
    }
  }, [activeChat?.id, activeChat?.type, currentUser]);

  // Unread Line, Auto Scroll, and Mentions Tracking
  useEffect(() => {
    if (messages.length > 0 && activeChat) {
      const lastRead = sessionLastReadRef.current;
      let targetId = firstUnreadId;
      const latestMsgId = messages[messages.length - 1].id;
      const isFirstLoad = lastMsgIdRef.current === null;
      const isNewMessageAtBottom = !isFirstLoad && lastMsgIdRef.current !== latestMsgId;
      lastMsgIdRef.current = latestMsgId;

      if (!targetId && lastRead && isFirstLoad) {
        const unreadMsg = messages.find((c) => c.timestamp > lastRead && c.username !== currentUser);
        if (unreadMsg) {
          targetId = unreadMsg.id;
          setFirstUnreadId(targetId);
          initialScrollDoneRef.current = false;
        }
      }

      const storageKey =
        activeChat.type === 'project'
          ? `alurku_last_read_board_${activeChat.id}_${currentUser}`
          : `alurku_last_read_task_${activeChat.id}_${currentUser}`;

      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        if (targetId) {
          let attempts = 0;
          const interval = setInterval(() => {
            const el = document.getElementById(`cw-msg-${targetId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'auto', block: 'center' });
              setShowScrollBottom(true);
              clearInterval(interval);
            } else {
              attempts++;
              if (attempts >= 10) {
                clearInterval(interval);
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                setShowScrollBottom(false);
              }
            }
          }, 100);
        } else {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            setShowScrollBottom(false);
            localStorage.setItem(storageKey, messages[messages.length - 1].timestamp);
          }, 150);
        }
      } else if (isNewMessageAtBottom) {
        const container = scrollContainerRef.current;
        if (container) {
          const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
          const isMyMessage = messages[messages.length - 1].username === currentUser;
          if (isNearBottom || isMyMessage) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShowScrollBottom(false);
            localStorage.setItem(storageKey, messages[messages.length - 1].timestamp);
          } else {
            setShowScrollBottom(true);
          }
        }
      }

      // Mention tracking
      const mention = [...messages]
        .reverse()
        .find(
          (m) =>
            (m.text.toLowerCase().includes(`@${currentUser.toLowerCase()}`) || m.text.includes('@team') || m.text.includes('@all')) &&
            m.username !== currentUser &&
            !dismissedMentions.has(m.id)
        );
      if (mention) setLatestMentionId(mention.id);
      else setLatestMentionId(null);
    }
  }, [messages, activeChat, currentUser, firstUnreadId, dismissedMentions]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isBottom);
  };

  const wrapperRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [taskDetailWidth, setTaskDetailWidth] = useState(480);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const startResizingLeft = useCallback((e) => {
    e.preventDefault();
    setIsResizingLeft(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  const startResizingRight = useCallback((e) => {
    e.preventDefault();
    setIsResizingRight(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  const resizeLeft = useCallback(
    (e) => {
      if (isResizingLeft && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        if (newWidth >= 200 && newWidth <= 460) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizingLeft]
  );

  const resizeRight = useCallback(
    (e) => {
      if (isResizingRight && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const newWidth = rect.right - e.clientX;
        if (newWidth >= 320 && newWidth <= 800) {
          setTaskDetailWidth(newWidth);
        }
      }
    },
    [isResizingRight]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingLeft) resizeLeft(e);
      if (isResizingRight) resizeRight(e);
    };

    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingLeft, isResizingRight, resizeLeft, resizeRight, stopResizing]);

  const toggleBoard = (boardId) => {
    setExpandedBoards((prev) => {
      const nextState = !prev[boardId];
      if (nextState && !boardTasks[boardId] && boardId !== 'global') {
        axios
          .get(`/api/boards/${boardId}/tasks/light`)
          .then((res) => {
            setBoardTasks((prevTasks) => ({ ...prevTasks, [boardId]: res.data.tasks || [] }));
          })
          .catch(console.error);
      }
      return { ...prev, [boardId]: nextState };
    });
  };

  const handleExpandAll = () => {
    const allExpanded = {};
    boards.forEach((b) => {
      allExpanded[b.id] = true;
      if (!boardTasks[b.id] && b.id !== 'global') {
        axios
          .get(`/api/boards/${b.id}/tasks/light`)
          .then((res) => {
            setBoardTasks((prevTasks) => ({ ...prevTasks, [b.id]: res.data.tasks || [] }));
          })
          .catch(console.error);
      }
    });
    setExpandedBoards(allExpanded);
  };

  const handleCollapseAll = () => setExpandedBoards({});

  const fetchMessages = (isInitial = false, isLoadMore = false) => {
    if (!activeChat || activeChat.type === 'inbox') return;
    if (isInitial) setIsLoadingMessages(true);

    let endpoint = '';
    let params = {};
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/chat`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/${activeChat.partner}`;
    }

    axios
      .get(endpoint, { params })
      .then((res) => {
        const rawMsgs = res.data.messages || res.data.comments || [];
        setMessages(Array.isArray(rawMsgs) ? rawMsgs : []);
        if (isInitial) setIsLoadingMessages(false);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
        if (isInitial) setIsLoadingMessages(false);
      });
  };

  useEffect(() => {
    if (activeChat?.id && activeChat?.type !== 'inbox') {
      fetchMessages(true);
    }
  }, [activeChat?.id, activeChat?.type]);

  // Clear unread badges for active chat and sync notifications with guard
  const lastReadNotifChatRef = useRef(null);
  useEffect(() => {
    if (!activeChat?.id || !notifications || !handleReadNotification) return;
    const currentChatKey = `${activeChat.type}_${activeChat.id}`;
    if (lastReadNotifChatRef.current === currentChatKey) return;

    const targetIdStr = String(activeChat.id);
    const unreadForThis = notifications.filter((n) => {
      if (n.is_read) return false;
      if (activeChat.type === 'project') {
        return (
          String(n.board_id) === targetIdStr ||
          String(n.related_task_id) === targetIdStr
        );
      }
      return (
        String(n.related_task_id) === targetIdStr ||
        String(n.task_id) === targetIdStr
      );
    });

    if (unreadForThis.length > 0) {
      lastReadNotifChatRef.current = currentChatKey;
      unreadForThis.forEach((n) => handleReadNotification(n.id));
      if (fetchInboxChats) fetchInboxChats();
    }
  }, [activeChat?.id, activeChat?.type, notifications]);

  // Update local storage last read timestamp when chat is opened or new messages arrive
  useEffect(() => {
    if (!activeChat?.id) return;
    const nowIso = new Date().toISOString();
    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    const readTimestamp = lastMsg?.timestamp && lastMsg.timestamp > nowIso ? lastMsg.timestamp : nowIso;

    const storageKey =
      activeChat.type === 'project'
        ? `alurku_last_read_board_${activeChat.id}_${currentUser}`
        : `alurku_last_read_task_${activeChat.id}_${currentUser}`;
    localStorage.setItem(storageKey, readTimestamp);
  }, [activeChat?.id, activeChat?.type, messages?.length, currentUser]);

  // Clear DM Unread on chat selection once
  const lastDmReadPartnerRef = useRef(null);
  useEffect(() => {
    if (activeChat?.type === 'dm') {
      const partner = activeChat.partner || activeChat.id;
      if (!partner || lastDmReadPartnerRef.current === partner) return;
      lastDmReadPartnerRef.current = partner;
      axios.put(`/api/dm/${partner}/read`).catch(console.error);
    }
  }, [activeChat?.id, activeChat?.type, activeChat?.partner]);

  const prevAiReplying = useRef(isAiReplying);
  useEffect(() => {
    if (prevAiReplying.current && !isAiReplying && activeChat) {
      fetchMessages();
    }
    prevAiReplying.current = isAiReplying;
  }, [isAiReplying, activeChat]);

  const sendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newMessage.trim() || !activeChat || activeChat.type === 'inbox') return;

    let finalComment = newMessage.trim();
    if (replyingTo) {
      const cleanPreview = replyingTo.text
        .replace(/^> .*?\n/gm, '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
      const truncated = cleanPreview.length > 80 ? cleanPreview.substring(0, 80) + '...' : cleanPreview;
      finalComment = `> **@${replyingTo.username}**: ${truncated}\n${finalComment}`;
    }

    const lowerComment = newMessage.toLowerCase();
    const isPrivateAI = lowerComment.includes('@ai (private)') || lowerComment.includes('🕵️') || lowerComment.includes('@ai (privat)');

    if (activeChat.type === 'task' && (lowerComment.includes('@smart assistant') || lowerComment.includes('@ai') || lowerComment.includes('@luruka'))) {
      if (handleAskAITaskChat && !isAiReplying) {
        // Optimistic UI for immediate feedback
        const tempId = Date.now();
        setMessages((prev) => [
          ...prev,
          {
            id: tempId,
            username: currentUser,
            text: finalComment,
            timestamp: new Date().toISOString(),
            reactions: {},
            isPrivate: isPrivateAI,
            privateUser: currentUser,
          },
        ]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        handleAskAITaskChat(
          activeChat.id,
          finalComment,
          newMessage.trim(),
          () => {
            setNewMessage('');
            setReplyingTo(null);
          },
          isPrivateAI
        );
        return;
      }
    }

    let endpoint = '';
    let body = { text: finalComment, comment: finalComment };
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/chat`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/${activeChat.partner}`;
    }

    axios
      .post(endpoint, body)
      .then(() => {
        setNewMessage('');
        setReplyingTo(null);
        fetchMessages();
        if (activeChat.type === 'dm') fetchDmConversations();
      })
      .catch(console.error);
  };

  const filteredUsers = useMemo(() => {
    if (!newDmSearch.trim()) return userDirectory || [];
    return (userDirectory || []).filter(
      (u) =>
        u.username.toLowerCase().includes(newDmSearch.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(newDmSearch.toLowerCase()))
    );
  }, [userDirectory, newDmSearch]);

  const handleNewDmSelect = (targetUser) => {
    setActiveChat({
      type: 'dm',
      id: targetUser.username,
      name: targetUser.username,
      partner: targetUser.username,
    });
    setIsNewDmOpen(false);
    setNewDmSearch('');
  };

  const deleteWorkspaceMessage = (msgId) => {
    if (!activeChat || !msgId) return;
    let endpoint = '';
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/chat/${msgId}`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments/${msgId}`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/${msgId}`;
    }

    if (!endpoint) return;

    axios
      .delete(endpoint)
      .then(() => {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        if (showNotification) {
          showNotification(tMsg('Message deleted', 'Pesan berhasil dihapus'), 'success');
        }
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(
            err.response?.data?.detail || tMsg('Failed to delete message', 'Gagal menghapus pesan'),
            'error'
          );
        }
      });
  };

  const handleStatusChangeInPreview = (newStatus, force = false, targetTaskId = null) => {
    let taskId = targetTaskId || activeTaskPreview?.task?.id || activeTaskPreview?.id || selectedTask?.id;
    if (taskId === 'undefined' || taskId === 'null') taskId = null;
    if (!taskId) return;

    // Optimistically update preview state immediately so UI updates instantly without refresh
    setActiveTaskPreview((prev) => {
      if (!prev) return prev;
      if (prev.task) {
        return { ...prev, task: { ...prev.task, status: newStatus } };
      }
      return { ...prev, status: newStatus };
    });

    // Call the global logic handler
    handleDirectStatusChange(newStatus, force, taskId);

    // Re-fetch comments & activities for this task after a short delay so the new activity log appears immediately
    setTimeout(() => {
      axios
        .get(`/api/tasks/${taskId}/comments`)
        .then((res) => {
          const rawComments = res.data?.comments || res.data || [];
          if (Array.isArray(rawComments)) {
            setTaskPreviewComments(rawComments);
            if (activeChat?.type === 'task' && String(activeChat.id) === String(taskId)) {
              setMessages(rawComments);
            }
          }
        })
        .catch(console.error);
    }, 400);
  };

  const meetingInfo = useMemo(() => {
    if (!activeChat) return { title: 'Meeting', roomName: 'meeting', targetMention: '@all' };
    if (activeChat.type === 'dm') {
      const partner = activeChat.partner || activeChat.id;
      const sortedUsers = [currentUser, partner].sort().join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        title: `DM with @${partner}`,
        roomName: `dm-${sortedUsers}`,
        targetMention: `@${partner}`,
      };
    } else if (activeChat.type === 'project') {
      const boardObj = boards?.find((b) => String(b.id) === String(activeChat.id));
      const cleanName = (boardObj?.name || activeChat.name || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return {
        title: boardObj?.name || activeChat.name || 'Project Chat',
        roomName: `project-${activeChat.id}-${cleanName}`,
        targetMention: '@team',
      };
    } else {
      const cleanName = (activeChat.name || 'task')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return {
        title: activeChat.name || 'Task Discussion',
        roomName: `task-${activeChat.id}-${cleanName}`,
        targetMention: '@all',
      };
    }
  }, [activeChat, currentUser, boards]);

  const handleMeetNow = () => {
    if (!activeChat) return;
    setIsMeetingModalOpen(true);
  };

  const handleSendMeetingLink = (link, serviceName = 'Video Meeting') => {
    if (!activeChat) return;
    const targetName = meetingInfo.targetMention || '@all';

    const invitationMessage = `${targetName} 🎥 ${tMsg("I've started a video meeting! Join here:", "Saya telah memulai pertemuan video! Bergabung di sini:")} ${link}`;

    let endpoint = '';
    let body = { text: invitationMessage, comment: invitationMessage };
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/chat`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/${activeChat.partner || activeChat.id}`;
    }

    if (endpoint) {
      axios
        .post(endpoint, body)
        .then(() => {
          fetchMessages();
          if (activeChat.type === 'dm' && fetchDmConversations) fetchDmConversations();
        })
        .catch(console.error);
    }
  };

  const handleConfirmDeleteDmConversation = () => {
    if (!dmConvToDelete) return;
    const partner = dmConvToDelete;
    axios
      .delete(`/api/dm/conversations/${partner}`)
      .then(() => {
        if (activeChat?.type === 'dm' && (activeChat.partner === partner || activeChat.id === partner)) {
          if (boards && boards.length > 0) {
            const b = boards.find((item) => item.id !== 'global') || boards[0];
            setActiveChat({ type: 'project', id: b.id, name: `${b.name} (General)`, board_id: b.id });
          } else {
            setActiveChat(null);
          }
        }
        setDmConvToDelete(null);
        if (fetchDmConversations) fetchDmConversations();
        if (showNotification) showNotification(tMsg('Conversation deleted', 'Percakapan berhasil dihapus'), 'success');
      })
      .catch((err) => {
        setDmConvToDelete(null);
        if (showNotification) {
          showNotification(
            err.response?.data?.detail || tMsg('Failed to delete conversation', 'Gagal menghapus percakapan'),
            'error'
          );
        }
      });
  };

  return (
    <div
      ref={wrapperRef}
      className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#F3F4F6] dark:bg-[#0d0f11] text-[#111E38] dark:text-white rounded-none border-0 md:border-t md:border-neutral-200/80 md:dark:border-neutral-800/80 overflow-hidden relative"
    >
      {/* Sidebar Channels & DMs */}
      <ChatSidebar
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        isDesktopSidebarOpen={isDesktopSidebarOpen}
        sidebarWidth={sidebarWidth}
        boards={boards}
        boardSearchQuery={boardSearchQuery}
        setBoardSearchQuery={setBoardSearchQuery}
        expandedBoards={expandedBoards}
        toggleBoard={toggleBoard}
        unreadBoardTotal={0}
        notifications={notifications}
        showUnreadFilter={showUnreadFilter}
        setShowUnreadFilter={setShowUnreadFilter}
        showMyTasksFilter={showMyTasksFilter}
        setShowMyTasksFilter={setShowMyTasksFilter}
        handleExpandAll={handleExpandAll}
        handleCollapseAll={handleCollapseAll}
        boardTasks={boardTasks}
        dmConversations={dmConversations}
        isNewDmOpen={isNewDmOpen}
        setIsNewDmOpen={setIsNewDmOpen}
        newDmSearch={newDmSearch}
        setNewDmSearch={setNewDmSearch}
        filteredUsers={filteredUsers}
        newDmSearchIndex={newDmSearchIndex}
        handleNewDmSelect={handleNewDmSelect}
        setDmConvToDelete={setDmConvToDelete}
        avatarsMap={avatarsMap}
        tMsg={tMsg}
        inboxChats={inboxChats}
        currentUser={currentUser}
        tasks={tasks}
        onlineUsers={onlineUsers}
      />

      {/* Left Sidebar Resize Handle */}
      {isDesktopSidebarOpen && (
        <div
          onMouseDown={startResizingLeft}
          className={`w-3 -mx-1.5 cursor-col-resize hidden md:flex items-center justify-center z-30 select-none group transition-colors ${
            isResizingLeft ? 'bg-[#FACC15]' : 'hover:bg-[#FACC15]/80 bg-transparent'
          }`}
          title={tMsg('Drag to resize sidebar', 'Geser untuk mengubah ukuran sidebar')}
        >
          <div
            className={`w-0.5 h-8 rounded-full transition-colors ${
              isResizingLeft ? 'bg-[#111E38]' : 'bg-neutral-300 dark:bg-neutral-700 group-hover:bg-[#111E38]'
            }`}
          />
        </div>
      )}

      {/* Main Chat Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-[#FAFAFA] dark:bg-[#121B2D] border-l border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden">
        <ChatHeader
          activeChat={activeChat}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          setIsDesktopSidebarOpen={setIsDesktopSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          chatSearchQuery={chatSearchQuery}
          setChatSearchQuery={setChatSearchQuery}
          messages={messages}
          avatarsMap={avatarsMap}
          tMsg={tMsg}
          formatDateMMM={formatDateMMM}
          handleMeetNow={handleMeetNow}
          handleNotificationTaskClick={handleOpenTaskPreview}
          activeTaskPreview={activeTaskPreview}
          setActiveTaskPreview={setActiveTaskPreview}
          handleOpenTaskPreview={handleOpenTaskPreview}
          onlineUsers={onlineUsers}
        />

        {/* Message List */}
        <ChatMessageList
          scrollContainerRef={scrollContainerRef}
          handleScroll={handleScroll}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          hasMoreMessages={hasMoreMessages}
          loadMoreMessages={() => fetchMessages(false, true)}
          activeChat={activeChat}
          currentUser={currentUser}
          avatarsMap={avatarsMap}
          formatDateMMM={formatDateMMM}
          setReplyingTo={setReplyingTo}
          deleteWorkspaceMessage={deleteWorkspaceMessage}
          showNotification={showNotification}
          toggleWorkspaceReaction={handleToggleReaction}
          isSuperAdmin={isSuperAdmin}
          accountStatus={accountStatus}
          tMsg={tMsg}
          firstUnreadId={firstUnreadId}
          messagesEndRef={messagesEndRef}
          isAiReplying={isAiReplying}
        />

        {/* Floating Jump to Bottom & Mention Action Buttons */}
        <div className="absolute right-6 bottom-24 z-30 flex flex-col gap-2 pointer-events-auto">
          {latestMentionId && !dismissedMentions.has(latestMentionId) && (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(`cw-msg-${latestMentionId}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('ring-2', 'ring-[#FACC15]', 'bg-[#FACC15]/20');
                  setTimeout(() => el.classList.remove('ring-2', 'ring-[#FACC15]', 'bg-[#FACC15]/20'), 2500);
                }
                setDismissedMentions((prev) => new Set(prev).add(latestMentionId));
              }}
              className="bg-[#FACC15] text-[#111E38] font-black text-xs px-3.5 py-2 rounded-full shadow-xl flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer border border-[#EAB308]"
            >
              <span className="font-black text-sm">@</span>
              <span>{tMsg('Mentioned you', 'Kamu di-mention')}</span>
            </button>
          )}
          {showScrollBottom && (
            <button
              type="button"
              onClick={() => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({
                    top: scrollContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
                }
              }}
              className="bg-[#111E38] dark:bg-white text-white dark:text-[#111E38] p-3 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer border border-neutral-700/50 flex items-center justify-center self-end"
              title={tMsg('Jump to bottom', 'Ke pesan terbaru')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Input Area (Always Visible for Active Chat) */}
        <ChatInputArea
          activeChat={activeChat}
          boards={boards}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleInputChange={handleInputChange}
          insertMention={insertMention}
          sendMessage={sendMessage}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          isMentioning={isMentioning}
          setIsMentioning={setIsMentioning}
          mentionQuery={mentionQuery}
          mentionIndex={mentionIndex}
          setMentionIndex={setMentionIndex}
          activeBoardMembers={activeBoardMembers}
          userDirectory={userDirectory}
          currentUser={currentUser}
          handleAskAITaskChat={handleAskAITaskChat}
          tMsg={tMsg}
          isAiReplying={isAiReplying}
          setMessages={setMessages}
          messagesEndRef={messagesEndRef}
          accountStatus={accountStatus}
          isSuperAdmin={isSuperAdmin}
          chatBg={chatBg}
          getLocalTimestamp={getLocalTimestamp}
        />
      </div>

      {/* Right Side Task Details Sidebar Drawer (1:1 TaskDetailModal Inline View with Resizer) */}
      {activeTaskPreview && (
        <>
          {/* Right Sidebar Resize Handle */}
          <div
            onMouseDown={startResizingRight}
            className={`w-3 -mx-1.5 cursor-col-resize hidden md:flex items-center justify-center z-30 select-none group transition-colors ${
              isResizingRight ? 'bg-[#FACC15]' : 'hover:bg-[#FACC15]/80 bg-transparent'
            }`}
            title={tMsg('Drag to resize Task Details', 'Geser untuk mengubah ukuran Detail Tugas')}
          >
            <div
              className={`w-0.5 h-8 rounded-full transition-colors ${
                isResizingRight ? 'bg-[#111E38]' : 'bg-neutral-300 dark:bg-neutral-700 group-hover:bg-[#111E38]'
              }`}
            />
          </div>

          <div
            style={{ width: `${taskDetailWidth}px` }}
            className="w-full md:w-auto bg-white dark:bg-[#121B2D] border-l border-neutral-200/80 dark:border-neutral-800/80 flex flex-col h-full shrink-0 z-30 shadow-xl animate-fadeIn overflow-hidden text-xs"
          >
            <TaskDetailModal
              isInline={true}
              onCloseInline={() => setActiveTaskPreview(null)}
              selectedTask={activeTaskPreview?.task || activeTaskPreview}
              tasks={tasks}
              handleDirectStatusChange={handleStatusChangeInPreview}
              columns={columns}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              formatDateMMM={formatDateMMM}
              handleRequesterChange={handleRequesterChange}
              isMentioning={isMentioning}
              teamMembers={teamMembers}
              mentionQuery={mentionQuery}
              insertMention={insertMention}
              categories={categories}
              handleOpenAddBoard={handleOpenAddBoard}
              handleOpenRenameBoard={handleOpenRenameBoard}
              handleOpenDeleteBoard={handleOpenDeleteBoard}
              handleEditSubmit={handleEditSubmit}
              isSuperAdmin={isSuperAdmin}
              currentUser={currentUser}
              selectedBoard={selectedBoard}
              accountStatus={accountStatus}
              subtasks={subtasks}
              handleToggleSubtask={handleToggleSubtask}
              handleUpdateSubtaskAssignee={handleUpdateSubtaskAssignee}
              handleDeleteSubtask={handleDeleteSubtask}
              handleSubtaskDragEnd={handleSubtaskDragEnd}
              newSubtaskName={newSubtaskName}
              setNewSubtaskName={setNewSubtaskName}
              newSubtaskAssignee={newSubtaskAssignee}
              setNewSubtaskAssignee={setNewSubtaskAssignee}
              handleAddSubtask={handleAddSubtask}
              comments={activeChat?.type === 'task' ? messages : taskPreviewComments}
              avatarsMap={avatarsMap}
              handleDeleteComment={handleDeleteComment}
              newComment={newComment}
              isAiReplying={isAiReplying}
              handleAskAITaskChat={handleAskAITaskChat}
              handleCommentChange={handleCommentChange}
              insertCommentMention={insertCommentMention}
              handleAddComment={handleAddComment}
              setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
              startEditing={startEditing}
              mentionIndex={mentionIndex}
              setMentionIndex={setMentionIndex}
              setIsMentioning={setIsMentioning}
              isCommentMentioning={isCommentMentioning}
              commentMentionQuery={commentMentionQuery}
              userDirectory={userDirectory}
              commentMentionIndex={commentMentionIndex}
              setCommentMentionIndex={setCommentMentionIndex}
              setIsCommentMentioning={setIsCommentMentioning}
              boards={boards}
              setSelectedBoard={setSelectedBoard}
              handleQuickLinkAdd={handleQuickLinkAdd}
              handleQuickLinkRemove={handleQuickLinkRemove}
              isSubtasksLoading={isSubtasksLoading}
              hasMoreComments={hasMoreComments}
              loadMoreComments={loadMoreComments}
              chatBg={chatBg}
              handleToggleReaction={handleToggleReaction}
              language={language}
              showNotification={showNotification}
              isSubmitting={isSubmitting}
              handleToggleAutoNudge={(taskId, val) => {
                if (typeof handleToggleAutoNudge === 'function') handleToggleAutoNudge(taskId, val);
                if (activeTaskPreview) {
                  const taskObj = activeTaskPreview.task || activeTaskPreview;
                  if (String(taskObj.id) === String(taskId)) {
                    setActiveTaskPreview((prev) => {
                      if (prev.task) return { ...prev, task: { ...prev.task, auto_nudge: val } };
                      return { ...prev, auto_nudge: val };
                    });
                  }
                }
              }}
            />
          </div>
        </>
      )}

      {/* Delete DM Conversation Confirmation Modal */}
      {dmConvToDelete && (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-70 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-950 p-6 sm:p-8 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm border border-red-200 dark:border-red-800/50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-black dark:text-white mb-2 uppercase tracking-tighter">
              {tMsg('Delete Conversation?', 'Hapus Percakapan?')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-xs leading-relaxed">
              {tMsg(
                `Are you sure you want to delete all messages with @${dmConvToDelete}? This action cannot be undone.`,
                `Apakah Anda yakin ingin menghapus semua pesan dengan @${dmConvToDelete}? Tindakan ini tidak dapat dibatalkan.`
              )}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDmConvToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs transition-colors uppercase tracking-wider"
              >
                {tMsg('Cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDmConversation}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md text-xs transition-all uppercase tracking-wider hover:-translate-y-0.5"
              >
                {tMsg('Delete', 'Hapus')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Meeting Smart Modal */}
      <StartMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        title={meetingInfo.title}
        roomName={meetingInfo.roomName}
        targetMention={meetingInfo.targetMention}
        onSendMeetingLink={handleSendMeetingLink}
        language={language}
        showNotification={showNotification}
      />
    </div>
  );
}
