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

export default function WorkspaceChatPage() {
  const context = useAppContext();
  const {
    currentUser,
    boards,
    tasks,
    avatarsMap,
    language,
    notifications,
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
    insertMention,
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

  const handleOpenTaskPreview = useCallback((taskId) => {
    const targetId = (taskId && String(taskId) !== 'undefined' && String(taskId) !== 'null')
      ? taskId
      : (activeChat?.type === 'task' ? (activeChat.id || activeChat.task_id) : null);

    if (!targetId) {
      setActiveTaskPreview(null);
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
      endpoint = `/api/boards/${activeChat.id}/comments`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/messages/${activeChat.partner}`;
    }

    if (isLoadMore && messages.length > 0) {
      params.before_id = messages[0].id;
    }

    axios
      .get(endpoint, { params })
      .then((res) => {
        const fetched = res.data.comments || res.data.messages || res.data || [];
        if (isLoadMore) {
          setMessages((prev) => [...fetched, ...prev]);
          setHasMoreMessages(fetched.length >= 30);
        } else {
          setMessages(fetched);
          setHasMoreMessages(fetched.length >= 30);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isInitial) setIsLoadingMessages(false);
      });
  };

  useEffect(() => {
    if (activeChat?.id && activeChat?.type !== 'inbox') {
      fetchMessages(true);
    }
  }, [activeChat?.id, activeChat?.type]);

  const sendMessage = (e) => {
    e.preventDefault();
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

    let endpoint = '';
    let body = { comment: finalComment };
    if (activeChat.type === 'project') {
      endpoint = `/api/boards/${activeChat.id}/comments`;
    } else if (activeChat.type === 'task') {
      endpoint = `/api/tasks/${activeChat.id}/comments`;
    } else if (activeChat.type === 'dm') {
      endpoint = `/api/dm/send`;
      body = { receiver: activeChat.partner, message: finalComment };
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

  return (
    <div
      ref={wrapperRef}
      className="flex-1 flex flex-col md:flex-row h-[calc(100vh-1.5rem)] max-h-[calc(100vh-1.5rem)] bg-[#F3F4F6] dark:bg-[#0d0f11] text-[#111E38] dark:text-white rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-xs m-2 md:m-3 relative"
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
            className={`w-[2px] h-8 rounded-full transition-colors ${
              isResizingLeft ? 'bg-[#111E38]' : 'bg-neutral-300 dark:bg-neutral-700 group-hover:bg-[#111E38]'
            }`}
          />
        </div>
      )}

      {/* Main Chat Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#121B2D] border-l border-neutral-200/60 dark:border-neutral-800/60">
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
          handleMeetNow={() => {}}
          handleNotificationTaskClick={handleOpenTaskPreview}
          activeTaskPreview={activeTaskPreview}
          setActiveTaskPreview={setActiveTaskPreview}
          handleOpenTaskPreview={handleOpenTaskPreview}
        />

        {/* Message List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          <ChatMessageList
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            hasMoreMessages={hasMoreMessages}
            loadMoreMessages={() => fetchMessages(false, true)}
            activeChat={activeChat}
            currentUser={currentUser}
            avatarsMap={avatarsMap}
            formatDateMMM={formatDateMMM}
            setReplyingTo={setReplyingTo}
            handleToggleReaction={handleToggleReaction}
            setMsgToDelete={setMsgToDelete}
            tMsg={tMsg}
            firstUnreadId={firstUnreadId}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Input Area (Always Visible for Active Chat) */}
        <ChatInputArea
          activeChat={activeChat}
          boards={boards}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
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
          tMsg={tMsg}
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
              className={`w-[2px] h-8 rounded-full transition-colors ${
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
              setSelectedTask={setSelectedTask}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleDirectStatusChange={handleDirectStatusChange}
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
              comments={comments}
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
              handleToggleAutoNudge={handleToggleAutoNudge}
            />
          </div>
        </>
      )}
    </div>
  );
}
