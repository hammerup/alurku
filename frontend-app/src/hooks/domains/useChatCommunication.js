import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export function useChatCommunication({
  isAuthenticated,
  currentUser,
  selectedBoard,
  setSelectedBoard,
  selectedTask,
  boards,
  fetchTasks,
  fetchSubtasks,
  lastWsMessage,
  isProjectChatOpen,
  showNotification,
}) {
  const [chatBg, setChatBg] = useState('');
  const [projectChatMessages, setProjectChatMessages] = useState([]);
  const [newProjectChatMessage, setNewProjectChatMessage] = useState('');
  const [drawerTab, setDrawerTab] = useState('team');
  const [isProjectMentioning, setIsProjectMentioning] = useState(false);
  const [projectMentionQuery, setProjectMentionQuery] = useState('');
  const [projectMentionIndex, setProjectMentionIndex] = useState(0);
  const [hasNewProjectChat, setHasNewProjectChat] = useState(false);
  const [hasMoreProjectChat, setHasMoreProjectChat] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [dmConversations, setDmConversations] = useState([]);
  const [inboxChats, setInboxChats] = useState([]);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [latestMentionId, setLatestMentionId] = useState(null);
  const [dismissedMentionIds, setDismissedMentionIds] = useState(new Set());

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isCommentMentioning, setIsCommentMentioning] = useState(false);
  const [commentMentionQuery, setCommentMentionQuery] = useState('');
  const [commentMentionIndex, setCommentMentionIndex] = useState(0);

  const prevChatLenRef = useRef(0);
  const chatEndRef = useRef(null);
  const commentsLengthRef = useRef(0);
  const projectChatLengthRef = useRef(0);
  commentsLengthRef.current = comments.length;
  projectChatLengthRef.current = projectChatMessages.length;

  const isDmFetchingRef = useRef(false);
  const isInboxFetchingRef = useRef(false);

  useEffect(() => {
    if (currentUser) {
      setChatBg(localStorage.getItem(`alurku_chat_bg_${currentUser}`) || '');
    } else {
      setChatBg('');
    }
  }, [currentUser]);

  const handleChatBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (showNotification) showNotification('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatBg(reader.result);
        if (currentUser) {
          localStorage.setItem(`alurku_chat_bg_${currentUser}`, reader.result);
        }
        if (showNotification) showNotification('Chat background updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeChatBg = () => {
    setChatBg('');
    if (currentUser) {
      localStorage.removeItem(`alurku_chat_bg_${currentUser}`);
    }
    if (showNotification) showNotification('Chat background removed!', 'success');
  };

  const handleSelectDefaultBg = (bgStr) => {
    setChatBg(bgStr);
    if (currentUser) {
      localStorage.setItem(`alurku_chat_bg_${currentUser}`, bgStr);
    }
    if (showNotification) showNotification('Chat theme updated!', 'success');
  };

  const fetchDmConversations = useCallback(() => {
    if (!isAuthenticated || isDmFetchingRef.current) return;
    isDmFetchingRef.current = true;
    axios
      .get('/api/dm/conversations')
      .then((res) => setDmConversations(res.data.conversations || []))
      .catch(console.error)
      .finally(() => {
        setTimeout(() => {
          isDmFetchingRef.current = false;
        }, 500);
      });
  }, [isAuthenticated]);

  const fetchInboxChats = useCallback(() => {
    if (!isAuthenticated || isInboxFetchingRef.current) return;
    isInboxFetchingRef.current = true;
    axios
      .get('/api/my-chats')
      .then((res) => {
        setInboxChats(res.data.chats || []);
      })
      .catch(console.error)
      .finally(() => {
        setIsInboxLoading(false);
        setTimeout(() => {
          isInboxFetchingRef.current = false;
        }, 500);
      });
  }, [isAuthenticated]);

  const fetchComments = useCallback(
    (taskId, loadMore = false) => {
      let offset = loadMore ? commentsLengthRef.current : 0;
      let limit = loadMore ? 50 : Math.max(commentsLengthRef.current || 50, 50);
      axios
        .get(`/api/tasks/${taskId}/comments?offset=${offset}&limit=${limit}`)
        .then((res) => {
          let msgs = res.data.comments || [];
          msgs = msgs
            .map((c) => {
              const match = c.text ? c.text.match(/<!--PRIVATE:([\w.-]+)-->/) : null;
              if (match) {
                return {
                  ...c,
                  isPrivate: true,
                  privateUser: match[1],
                  text: c.text.replace(/<!--PRIVATE:[\w.-]+-->\s*/, ''),
                };
              }
              return c;
            })
            .filter((c) => c && (!c.isPrivate || c.privateUser === currentUser));

          if (loadMore) {
            setHasMoreComments(msgs.length === 50);
            setComments((prev) => [...msgs, ...prev]);
          } else {
            setHasMoreComments(msgs.length === limit);
            setComments(msgs);
          }
        })
        .catch((err) => console.error('Failed to load comments:', err));
    },
    [currentUser]
  );

  const loadMoreComments = () => {
    if (selectedTask) fetchComments(selectedTask.id, true);
  };

  useEffect(() => {
    if (!lastWsMessage || !selectedTask) return;

    if (lastWsMessage.type === 'chat_message') {
      if (lastWsMessage.chat_type === 'task' && String(lastWsMessage.target_id) === String(selectedTask.id)) {
        fetchComments(selectedTask.id);
      }
    } else if (lastWsMessage.type === 'task_update') {
      if (String(lastWsMessage.task_id) === String(selectedTask.id)) {
        if (fetchSubtasks) fetchSubtasks(selectedTask.id);
        fetchComments(selectedTask.id);
        if (fetchTasks) fetchTasks();
      }
    }
  }, [lastWsMessage, selectedTask?.id, fetchComments, fetchSubtasks, fetchTasks]);

  const handleCommentChange = (value) => {
    setNewComment(value);
    const match = value.match(/(?:^|\s)@([\w.-]*)$/);
    if (match) {
      setCommentMentionQuery(match[1].toLowerCase());
      setIsCommentMentioning(true);
      setCommentMentionIndex(0);
    } else {
      setIsCommentMentioning(false);
    }
  };

  const insertCommentMention = (username) => {
    const newVal = newComment.replace(/(?:^|\s)@([\w.-]*)$/, ` @${username} `);
    setNewComment(newVal);
    setIsCommentMentioning(false);
  };

  const handleAddComment = (e, textOverride = null, targetTaskId = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSubmit = typeof textOverride === 'string' ? textOverride : newComment;
    if (!textToSubmit.trim()) return;

    const finalTaskId = targetTaskId || (typeof e === 'number' || typeof e === 'string' ? e : selectedTask?.id);
    if (!finalTaskId) return;

    return axios
      .post(`/api/tasks/${finalTaskId}/comments`, { text: textToSubmit.trim() })
      .then(() => {
        setNewComment('');
        fetchComments(finalTaskId);
        if (setSelectedBoard) setSelectedBoard((prev) => (prev ? { ...prev, deletion_date: null } : null));
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to add comment!', 'error');
      });
  };

  const handleAskAITaskChat = (taskId, finalComment, userText, onSuccess, isPrivateAI = false) => {
    setIsAiReplying(true);

    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const localTimeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const tempId = Date.now();
    const optimisticComment = {
      id: tempId,
      username: currentUser,
      text: finalComment,
      timestamp: localTimeStr,
      reactions: {},
      isPrivate: isPrivateAI,
      privateUser: currentUser,
    };
    setComments((prev) => [...prev, optimisticComment]);
    if (onSuccess) onSuccess();

    const commentText = isPrivateAI ? `<!--PRIVATE:${currentUser}-->${finalComment}` : finalComment;
    const aiPromptText = isPrivateAI
      ? `${userText}\n\nIMPORTANT INSTRUCTION: You MUST start your entire response exactly with this string: <!--PRIVATE:${currentUser}-->`
      : userText;

    axios
      .post(`/api/tasks/${taskId}/comments`, { text: commentText })
      .then(() => {
        fetchComments(taskId);
        return axios.post(`/api/tasks/${taskId}/ai-reply`, { text: aiPromptText }, { timeout: 120000 });
      })
      .then(() => {
        fetchComments(taskId);
      })
      .catch((err) => {
        console.error('AI Task Chat Error:', err);
        if (showNotification) {
          showNotification(err.response?.data?.detail || err.message || 'AI failed to reply', 'error');
        }
      })
      .finally(() => {
        fetchComments(taskId);
        setIsAiReplying(false);
      });
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = () => {
    if (!commentToDelete || !selectedTask) return;
    axios
      .delete(`/api/tasks/${selectedTask.id}/comments/${commentToDelete}`)
      .then(() => {
        fetchComments(selectedTask.id);
        if (showNotification) showNotification('Comment deleted', 'success');
        setCommentToDelete(null);
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to delete comment', 'error');
      });
  };

  const fetchProjectChat = useCallback(
    (loadMore = false) => {
      if (!selectedBoard || selectedBoard.id === 'global') return;

      let offset = loadMore ? projectChatLengthRef.current : 0;
      let limit = loadMore ? 50 : Math.max(projectChatLengthRef.current || 50, 50);
      axios
        .get(`/api/boards/${selectedBoard.id}/chat?offset=${offset}&limit=${limit}`)
        .then((res) => {
          let msgs = res.data.messages || [];
          msgs = msgs
            .map((c) => {
              const match = c.text ? c.text.match(/<!--PRIVATE:([\w.-]+)-->/) : null;
              if (match) {
                return {
                  ...c,
                  isPrivate: true,
                  privateUser: match[1],
                  text: c.text.replace(/<!--PRIVATE:[\w.-]+-->\s*/, ''),
                };
              }
              return c;
            })
            .filter(
              (c) =>
                c &&
                c.username !== 'System' &&
                c.username?.toLowerCase() !== 'system' &&
                !c.text?.startsWith('[ACTIVITY]') &&
                !c.text?.includes('[ACTIVITY]') &&
                (!c.isPrivate || c.privateUser === currentUser)
            );

          if (loadMore) {
            setHasMoreProjectChat(msgs.length === 50);
            setProjectChatMessages((prev) => [...msgs, ...prev]);
          } else {
            setHasMoreProjectChat(msgs.length === limit);
            setProjectChatMessages(msgs);
            if (prevChatLenRef.current !== 0 && msgs.length > prevChatLenRef.current) {
              if (!isProjectChatOpen || drawerTab !== 'team') setHasNewProjectChat(true);
            }
            prevChatLenRef.current = msgs.length;
          }
        })
        .catch(console.error);
    },
    [selectedBoard, currentUser, isProjectChatOpen, drawerTab]
  );

  const loadMoreProjectChat = () => {
    fetchProjectChat(true);
  };

  const handleToggleReaction = (commentId, emoji, isProjectChat = false) => {
    const updateFn = isProjectChat ? setProjectChatMessages : setComments;
    updateFn((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const newRx = { ...(c.reactions || {}) };
          const isAlreadySelected = newRx[emoji] && newRx[emoji].includes(currentUser);

          Object.keys(newRx).forEach((key) => {
            newRx[key] = newRx[key].filter((u) => u !== currentUser);
            if (newRx[key].length === 0) delete newRx[key];
          });

          if (!isAlreadySelected) {
            if (!newRx[emoji]) newRx[emoji] = [];
            newRx[emoji].push(currentUser);
          }

          return { ...c, reactions: newRx };
        }
        return c;
      })
    );
    axios.post(`/api/comments/${commentId}/react`, { emoji }).catch(() => {
      if (isProjectChat) fetchProjectChat();
      else if (selectedTask) fetchComments(selectedTask.id);
    });
  };

  const sendProjectChatMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newProjectChatMessage.trim() || !selectedBoard || selectedBoard.id === 'global') return;
    axios
      .post(`/api/boards/${selectedBoard.id}/chat`, { text: newProjectChatMessage.trim() })
      .then(() => {
        setNewProjectChatMessage('');
        fetchProjectChat();
        if (setSelectedBoard) setSelectedBoard((prev) => (prev ? { ...prev, deletion_date: null } : null));
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to send message', 'error');
      });
  };

  const handleStartMeet = (boardId) => {
    if (!boardId || boardId === 'global') return;
    const targetBoard = (boards || []).find((b) => b.id === boardId) || selectedBoard;
    if (!targetBoard) return;

    const cleanName = targetBoard.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const roomName = `project-${boardId}-${cleanName}`;
    const meetLink = `https://meet.jit.si/alurku-${roomName}`;

    const popupFeatures =
      'width=1000,height=700,left=100,top=100,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';
    window.open(meetLink, 'MeetingPopup', popupFeatures);

    axios
      .post(`/api/boards/${boardId}/chat`, {
        text: `@team 🎥 I've started a video meeting for this project! Join here: ${meetLink}`,
      })
      .then(() => fetchProjectChat())
      .catch(console.error);
  };

  const handleChatScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBottom(scrollHeight - scrollTop > clientHeight + 150);
  };

  const dismissMention = (id) => {
    setDismissedMentionIds((prev) => new Set(prev).add(id));
    setLatestMentionId(null);
  };

  useEffect(() => {
    if (projectChatMessages.length > 0 && currentUser) {
      const mention = [...projectChatMessages]
        .reverse()
        .find(
          (m) => (m.text.includes(`@${currentUser}`) || m.text.includes('@team')) && !dismissedMentionIds.has(m.id)
        );
      if (mention) setLatestMentionId(mention.id);
      else setLatestMentionId(null);
    } else {
      setLatestMentionId(null);
    }
  }, [projectChatMessages, currentUser, dismissedMentionIds]);

  const handleProjectChatChange = (value) => {
    setNewProjectChatMessage(value);
    const match = value.match(/(?:^|\s)@([\w.-]*)$/);
    if (match) {
      setProjectMentionQuery(match[1].toLowerCase());
      setIsProjectMentioning(true);
      setProjectMentionIndex(0);
    } else {
      setIsProjectMentioning(false);
    }
  };

  const insertProjectMention = (username) => {
    const newVal = newProjectChatMessage.replace(/(?:^|\s)@([\w.-]*)$/, ` @${username} `);
    setNewProjectChatMessage(newVal);
    setIsProjectMentioning(false);
  };

  useEffect(() => {
    let interval;
    if (selectedBoard && selectedBoard.id !== 'global') {
      fetchProjectChat();
      interval = setInterval(
        () => {
          if (document.visibilityState === 'visible') fetchProjectChat();
        },
        isProjectChatOpen ? 10000 : 60000
      );
    }
    return () => clearInterval(interval);
  }, [isProjectChatOpen, selectedBoard, fetchProjectChat]);

  useEffect(() => {
    if (isProjectChatOpen && drawerTab === 'team') setHasNewProjectChat(false);
  }, [isProjectChatOpen, drawerTab]);

  useEffect(() => {
    prevChatLenRef.current = 0;
    setHasNewProjectChat(false);
  }, [selectedBoard]);

  return {
    chatBg,
    setChatBg,
    projectChatMessages,
    setProjectChatMessages,
    newProjectChatMessage,
    setNewProjectChatMessage,
    drawerTab,
    setDrawerTab,
    isProjectMentioning,
    setIsProjectMentioning,
    projectMentionQuery,
    setProjectMentionQuery,
    projectMentionIndex,
    setProjectMentionIndex,
    hasNewProjectChat,
    setHasNewProjectChat,
    hasMoreProjectChat,
    setHasMoreProjectChat,
    hasMoreComments,
    setHasMoreComments,
    chatSearchQuery,
    setChatSearchQuery,
    dmConversations,
    setDmConversations,
    inboxChats,
    setInboxChats,
    isInboxLoading,
    setIsInboxLoading,
    showScrollBottom,
    setShowScrollBottom,
    latestMentionId,
    setLatestMentionId,
    comments,
    setComments,
    newComment,
    setNewComment,
    isAiReplying,
    setIsAiReplying,
    commentToDelete,
    setCommentToDelete,
    isCommentMentioning,
    setIsCommentMentioning,
    commentMentionQuery,
    setCommentMentionQuery,
    commentMentionIndex,
    setCommentMentionIndex,
    chatEndRef,
    handleChatBgUpload,
    removeChatBg,
    handleSelectDefaultBg,
    fetchDmConversations,
    fetchInboxChats,
    fetchComments,
    loadMoreComments,
    handleCommentChange,
    insertCommentMention,
    handleAddComment,
    handleAskAITaskChat,
    handleDeleteComment,
    confirmDeleteComment,
    handleToggleReaction,
    fetchProjectChat,
    loadMoreProjectChat,
    sendProjectChatMessage,
    handleStartMeet,
    handleChatScroll,
    dismissMention,
    handleProjectChatChange,
    insertProjectMention,
  };
}
