import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  parseLocalZero,
  getLocalToday,
  isUserAssigned,
  getTaskAssignee,
  handleRequesterChange,
  insertMention,
} from './helpers';
import { useSubtaskManagement } from './useSubtaskManagement';
import { useTaskFiltering } from './useTaskFiltering';
import { useTaskDragDrop } from './useTaskDragDrop';

export function useTaskManagement({
  isAuthenticated,
  currentUser,
  selectedBoard,
  setSelectedBoard,
  boards,
  columns,
  categories,
  showNotification,
  isSubmitting,
  setIsSubmitting,
  language,
  tMsg,
  notifications,
  isSuperAdmin,
  accountStatus,
  setIsFormOpen,
  setIsDeleteConfirmOpen,
  fetchComments,
  fetchNotifications,
  driverRef,
  handleMouseUp,
  tasks: externalTasks,
  setTasks: externalSetTasks,
}) {
  const [internalTasks, internalSetTasks] = useState([]);
  const tasks = externalTasks !== undefined ? externalTasks : internalTasks;
  const setTasks = externalSetTasks !== undefined ? externalSetTasks : internalSetTasks;
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showDueTodayOnly, setShowDueTodayOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showHasSubtasks, setShowHasSubtasks] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_hide_completed') === 'true';
    return false;
  });

  const [calDate, setCalDate] = useState(new Date());
  const [clonedTaskIds, setClonedTaskIds] = useState(new Set());

  const [formData, setFormData] = useState({
    project_name: '',
    requester: '',
    category: 'Development',
    description: '',
    supporting_access: '',
    start_date: getLocalToday(),
    deadline: getLocalToday(),
    impact: 'Medium',
    etc: 2,
    auto_nudge: false,
    recurring: 'none',
    tags: [],
  });

  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [previewTask, setPreviewTask] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('Status');
  const [sortBy, setSortBy] = useState('Date Created');
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alurku_view_mode') || 'overview';
    }
    return 'overview';
  });

  useEffect(() => {
    localStorage.setItem('alurku_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'kanban' || viewMode === 'timeline') {
      setSortBy('Default');
    } else if (viewMode === 'list') {
      setSortBy('Date Created');
    }
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('alurku_hide_completed', hideCompleted);
  }, [hideCompleted]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      const path = window.location.pathname;
      if (path.startsWith('/task/')) {
        const taskId = parseInt(path.replace('/task/', '').split('-')[0], 10);
        if (!isNaN(taskId)) {
          axios
            .get(`/api/tasks/preview/${taskId}`)
            .then((res) => {
              setPreviewTask(res.data.task);
            })
            .catch((err) => {
              console.error('Preview error', err);
              alert(
                language === 'id'
                  ? 'Gagal memuat pratinjau. Tugas mungkin telah dihapus, bersifat privat, atau server sedang sibuk (Cold Start).'
                  : 'Failed to load preview. The task might be deleted, private, or the server is busy.'
              );
            });
        }
      }
    }
  }, [isAuthenticated, language]);

  const fetchTasks = () => {
    if (!isAuthenticated) return;

    if (!selectedBoard || selectedBoard.id === 'global') {
      setIsTasksLoading(true);
      axios
        .get('/api/tasks/all')
        .then((res) => {
          setTasks(res.data.tasks || []);
        })
        .catch((err) => {
          if (err.response?.status !== 401) console.error(err);
        })
        .finally(() => setIsTasksLoading(false));
      return;
    }

    axios
      .get(`/api/boards/${selectedBoard.id}/tasks`)
      .then((res) => {
        setTasks(res.data.tasks || []);
      })
      .catch((err) => {
        if (err.response?.status === 403 || err.response?.status === 404) {
          if (setSelectedBoard) setSelectedBoard(null);
        }
        if (err.response?.status !== 401) console.error(err);
      })
      .finally(() => setIsTasksLoading(false));
  };

  useEffect(() => {
    if (selectedBoard && selectedBoard.id !== 'global') {
      fetchTasks();
    }
  }, [groupBy]);

  const subtasksMgr = useSubtaskManagement({
    selectedTask,
    setSelectedTask,
    currentUser,
    notifications,
    fetchNotifications,
    fetchComments,
    fetchTasks,
    showNotification,
    accountStatus,
  });

  const {
    subtasks,
    setSubtasks,
    isSubtasksLoading,
    setIsSubtasksLoading,
    newSubtaskName,
    setNewSubtaskName,
    newSubtaskAssignee,
    setNewSubtaskAssignee,
    formSubtasks,
    setFormSubtasks,
    formSubtaskInput,
    setFormSubtaskInput,
    formSubtaskAssignee,
    setFormSubtaskAssignee,
    fetchSubtasks,
    handleAddSubtask,
    handleToggleSubtask,
    handleUpdateSubtaskAssignee,
    handleDeleteSubtask,
    handleSubtaskDragEnd,
    handleAddFormSubtask,
    handleRemoveFormSubtask,
  } = subtasksMgr;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.project_name || !formData.requester || !formData.start_date || !formData.deadline) {
      if (showNotification) showNotification('Project Name, Requester, Start Date, and Deadline are required!', 'error');
      return;
    }

    const startDate = parseLocalZero(formData.start_date);
    const deadlineDate = parseLocalZero(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < startDate) {
      if (showNotification) {
        showNotification(
          language === 'id'
            ? 'Tenggat Waktu tidak boleh lebih awal dari Tanggal Mulai!'
            : 'Deadline cannot be earlier than Start Date!',
          'error'
        );
      }
      return;
    }

    if (deadlineDate < today) {
      if (showNotification) {
        showNotification(
          language === 'id'
            ? 'Tenggat Waktu tidak boleh lebih awal dari Hari Ini!'
            : 'Deadline cannot be earlier than Today!',
          'error'
        );
      }
      return;
    }

    const targetBoardId =
      formData.board_id ||
      (selectedBoard && selectedBoard.id !== 'global' ? selectedBoard.id : null) ||
      (boards || []).find((b) => b.id !== 'global')?.id ||
      (boards || [])[0]?.id;

    if (!targetBoardId) {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Pilih proyek tujuan terlebih dahulu ya!' : 'Please select a target project first!',
          'error'
        );
      }
      return;
    }

    if (setIsSubmitting) setIsSubmitting(true);
    const formattedData = {
      ...formData,
      category: formData.category || categories[0] || 'Other',
      deadline: `${formData.deadline} 17:00:00`,
      etc: formData.etc || 2,
      recurring: formData.recurring || 'none',
      subtasks: formSubtasks,
    };

    axios
      .post(`/api/boards/${targetBoardId}/tasks`, formattedData)
      .then(() => {
        if (setIsFormOpen) setIsFormOpen(false);
        setFormData({
          project_name: '',
          requester: '',
          category: 'Development',
          description: '',
          supporting_access: '',
          start_date: getLocalToday(),
          deadline: getLocalToday(),
          recurring: 'none',
          tags: [],
        });
        setFormSubtasks([]);
        setFormSubtaskInput('');
        setFormSubtaskAssignee('');
        fetchTasks();
        if (showNotification) {
          showNotification(language === 'id' ? 'Tugas baru berhasil ditambahkan!' : 'New task added successfully!', 'success');
        }
        if (setSelectedBoard) setSelectedBoard((prev) => (prev ? { ...prev, deletion_date: null } : null));
      })
      .catch((err) => {
        console.error('Failed to create task:', err);
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to save task to database!', 'error');
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  const handleQuickAddTask = (taskData) => {
    if (!taskData.project_name.trim() || !selectedBoard || selectedBoard.id === 'global') return;
    const nowStr = getLocalToday();
    const deadlineStr = taskData.deadline;

    if (deadlineStr) {
      const deadlineDate = parseLocalZero(deadlineStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadlineDate < today) {
        if (showNotification) {
          showNotification(
            language === 'id'
              ? 'Tenggat Waktu tidak boleh lebih awal dari Hari Ini!'
              : 'Deadline cannot be earlier than Today!',
            'error'
          );
        }
        return;
      }
    }

    const formattedData = {
      project_name: taskData.project_name.trim(),
      requester: taskData.requester || currentUser,
      category: taskData.category || categories[0] || 'Other',
      description: '',
      supporting_access: '',
      start_date: nowStr,
      deadline: deadlineStr ? `${deadlineStr} 17:00:00` : '',
      impact: taskData.impact || 'Medium',
      etc: taskData.etc || 2,
      recurring: 'none',
      subtasks: [],
    };
    return axios.post(`/api/boards/${selectedBoard.id}/tasks`, formattedData);
  };

  const handleQuickLinkAdd = (taskId, newLink) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const currentLinks = task.supporting_access ? task.supporting_access.split('\n').filter((l) => l.trim()) : [];
    currentLinks.push(newLink.trim());
    const updatedLinks = currentLinks.join('\n');

    const payload = {
      project_name: task.project_name,
      requester: task.requester,
      category: task.category,
      description: task.description || '',
      supporting_access: updatedLinks,
      start_date: (task.start_date || task.timestamp).split(' ')[0],
      deadline: task.deadline ? task.deadline.split(' ')[0] + ' 17:00:00' : '',
      impact: task.impact || 'Medium',
      etc: task.etc || 2,
      auto_nudge: task.auto_nudge || false,
      recurring: task.recurring || 'none',
      status: task.status,
    };

    const updatedTask = { ...task, supporting_access: updatedLinks };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask);
    }

    axios.put(`/api/tasks/${taskId}/details`, payload).catch(() => {
      if (showNotification) showNotification('Failed to add link', 'error');
      fetchTasks();
    });
  };

  const handleQuickLinkRemove = (taskId, linkToRemove) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const currentLinks = task.supporting_access ? task.supporting_access.split('\n').filter((l) => l.trim()) : [];
    const updatedLinks = currentLinks.filter((l) => l !== linkToRemove).join('\n');

    const payload = {
      project_name: task.project_name,
      requester: task.requester,
      category: task.category,
      description: task.description || '',
      supporting_access: updatedLinks,
      start_date: (task.start_date || task.timestamp).split(' ')[0],
      deadline: task.deadline ? task.deadline.split(' ')[0] + ' 17:00:00' : '',
      impact: task.impact || 'Medium',
      etc: task.etc || 2,
      auto_nudge: task.auto_nudge || false,
      recurring: task.recurring || 'none',
      status: task.status,
    };

    const updatedTask = { ...task, supporting_access: updatedLinks };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask);
    }

    axios.put(`/api/tasks/${taskId}/details`, payload).catch(() => {
      if (showNotification) showNotification('Failed to remove link', 'error');
      fetchTasks();
    });
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    if (setIsSubmitting) setIsSubmitting(true);
    axios
      .delete(`/api/tasks/${selectedTask.id}`)
      .then(() => {
        if (setIsDeleteConfirmOpen) setIsDeleteConfirmOpen(false);
        setSelectedTask(null);
        fetchTasks();
        if (showNotification) showNotification('Task deleted successfully!', 'success');
      })
      .catch((err) => {
        console.error('Failed to delete task:', err);
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to delete task from database!', 'error');
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  const startEditing = (taskToEdit = null) => {
    const targetTask = taskToEdit || selectedTask;
    if (!targetTask) return;
    if (!selectedTask || selectedTask.id !== targetTask.id) {
      setSelectedTask(targetTask);
    }
    setEditFormData({
      project_name: targetTask.project_name || '',
      requester: targetTask.requester || '',
      category: targetTask.category || '',
      description: targetTask.description || '',
      supporting_access: targetTask.supporting_access || '',
      start_date: (targetTask.start_date || targetTask.timestamp || '').split(' ')[0],
      deadline: targetTask.deadline ? targetTask.deadline.split(' ')[0] : '',
      impact: targetTask.impact || 'Medium',
      etc: targetTask.etc || 2,
      auto_nudge: targetTask.auto_nudge || false,
      recurring: targetTask.recurring || 'none',
      status: targetTask.status || 'Pending',
      board_id: targetTask.board_id,
      tags: Array.isArray(targetTask.tags)
        ? targetTask.tags
        : typeof targetTask.tags === 'string' && targetTask.tags.trim() && targetTask.tags !== '[]'
        ? (() => {
            try {
              const p = JSON.parse(targetTask.tags);
              return Array.isArray(p) ? p : [targetTask.tags];
            } catch {
              return targetTask.tags
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean);
            }
          })()
        : [],
    });
    setIsEditing(true);
  };

  const handleToggleAutoNudge = (taskId, newValue) => {
    const isEnabled = !!newValue;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, auto_nudge: isEnabled } : t)));
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, auto_nudge: isEnabled } : prev));

    axios
      .put(`/api/tasks/${taskId}/auto-nudge`, { auto_nudge: isEnabled })
      .then(() => {
        if (showNotification) showNotification(isEnabled ? 'Auto Nudge enabled for this task' : 'Auto Nudge disabled', 'success');
      })
      .catch(() => {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, auto_nudge: !isEnabled } : t)));
        setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, auto_nudge: !isEnabled } : prev));
        if (showNotification) showNotification('Failed to toggle Auto Nudge', 'error');
      });
  };

  const handleEditSubmit = (e, force = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const startDate = parseLocalZero(editFormData.start_date);
    const deadlineDate = parseLocalZero(editFormData.deadline);
    const createdDate = parseLocalZero(selectedTask?.timestamp);

    if (deadlineDate < startDate) {
      if (showNotification) {
        showNotification(
          language === 'id'
            ? 'Tenggat Waktu tidak boleh lebih awal dari Tanggal Mulai!'
            : 'Deadline cannot be earlier than Start Date!',
          'error'
        );
      }
      return;
    }

    if (deadlineDate < createdDate) {
      if (showNotification) {
        showNotification(
          language === 'id'
            ? 'Tenggat Waktu tidak boleh lebih awal dari Tanggal Dibuat!'
            : 'Deadline cannot be earlier than Created Date!',
          'error'
        );
      }
      return;
    }

    if (!force && editFormData.status === 'Done') {
      const freshTask = tasks.find((t) => t.id === selectedTask?.id) || selectedTask;
      const hasIncomplete = isSubtasksLoading
        ? freshTask.subtask_done < freshTask.subtask_total
        : subtasks.some((st) => st.is_done === 0);

      if (hasIncomplete) {
        setPendingStatusChange({ type: 'edit', payload: null });
        return;
      }
    }

    if (setIsSubmitting) setIsSubmitting(true);
    const validDeadline = editFormData.deadline || getLocalToday();
    const payload = { ...editFormData, deadline: `${validDeadline.trim()} 17:00:00` };

    if (payload.etc === '' || isNaN(payload.etc)) {
      payload.etc = 2.0;
    } else {
      payload.etc = parseFloat(payload.etc);
    }

    const updatedTask = { ...selectedTask, ...payload };
    if (payload.board_id !== selectedTask?.board_id) {
      const targetBoard = (boards || []).find((b) => b.id === payload.board_id);
      if (targetBoard) updatedTask.board_name = targetBoard.name;
    }
    setTasks((prev) => prev.map((t) => (t.id === selectedTask?.id ? updatedTask : t)));

    axios
      .put(`/api/tasks/${selectedTask?.id}/details`, payload)
      .then((res) => {
        if (res.data?.cloned_task_id) {
          setClonedTaskIds((prev) => new Set(prev).add(res.data.cloned_task_id));
        }
        setIsEditing(false);
        setSelectedTask(updatedTask);
        fetchTasks();
        if (fetchComments && selectedTask) fetchComments(selectedTask.id);
        if (showNotification) showNotification('Task details updated successfully!', 'success');
        if (setSelectedBoard) setSelectedBoard((prev) => (prev ? { ...prev, deletion_date: null } : null));
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update task!', 'error');
        fetchTasks();
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  const handleDirectStatusChange = (newStatus, force = false, targetTaskId = null) => {
    const activeId = targetTaskId || selectedTask?.id;
    if (!activeId || activeId === 'undefined' || activeId === 'null') {
      console.warn('handleDirectStatusChange called without valid taskId', { newStatus, activeId, selectedTask });
      return;
    }

    const currentTask = (tasks || []).find((t) => String(t.id) === String(activeId)) || selectedTask;
    if (!currentTask) return;

    if (!force && newStatus === 'Done') {
      const freshTask = currentTask;
      const hasIncomplete = isSubtasksLoading
        ? freshTask.subtask_done < freshTask.subtask_total
        : subtasks.some((st) => st.is_done === 0);

      if (hasIncomplete) {
        setPendingStatusChange({ type: 'direct', payload: newStatus, targetTaskId: activeId });
        return;
      }
    }

    const updatedTask = { ...currentTask, status: newStatus };
    if (newStatus === 'Done' || newStatus === 'Rejected') {
      const now = new Date();
      updatedTask.completed_time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')}`;
    } else {
      updatedTask.completed_time = null;
    }
    if (newStatus === 'Done' && updatedTask.recurring !== 'none') {
      updatedTask.recurring = 'none';
    }
    setSelectedTask(updatedTask);
    setTasks((prev) => prev.map((t) => (String(t.id) === String(activeId) ? updatedTask : t)));

    axios
      .put(`/api/tasks/${activeId}`, { status: newStatus })
      .then((res) => {
        if (res.data?.cloned_task_id) {
          setClonedTaskIds((prev) => new Set(prev).add(Number(res.data.cloned_task_id)));
        }
        fetchTasks();
        if (fetchComments) fetchComments(activeId);
        if (showNotification) showNotification(`Task marked as ${newStatus}`, 'success');
        if (setSelectedBoard) setSelectedBoard((prev) => (prev ? { ...prev, deletion_date: null } : null));
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update status!', 'error');
        fetchTasks();
        setSelectedTask((tasks || []).find((t) => String(t.id) === String(activeId)) || selectedTask);
      });
  };

  const dragDrop = useTaskDragDrop({
    tasks,
    setTasks,
    selectedBoard,
    isSuperAdmin,
    currentUser,
    tMsg,
    showNotification,
    setSelectedTask,
    setIsDeleteConfirmOpen,
    groupBy,
    boards,
    fetchTasks,
    setClonedTaskIds,
    handleDirectStatusChange,
    handleEditSubmit,
    handleMouseUp,
    isSubtasksLoading,
    subtasks,
    pendingStatusChange,
    setPendingStatusChange,
  });

  const {
    isKanbanDragging,
    setIsKanbanDragging,
    isTrashHovered,
    setIsTrashHovered,
    onDragEnd,
    confirmPendingStatusChange,
    cancelPendingStatusChange,
  } = dragDrop;

  const handleOpenNewTaskForm = () => {
    if (setIsFormOpen) setIsFormOpen(true);
    if (driverRef?.current && driverRef.current.isAtNewTask) {
      setTimeout(() => {
        if (driverRef.current) driverRef.current.moveNext();
      }, 400);
    }
  };

  const taskFiltering = useTaskFiltering({
    tasks,
    selectedBoard,
    searchQuery,
    filterStatus,
    filterCategory,
    filterAssignee,
    filterTag,
    showMyTasks,
    showOverdueOnly,
    showDueTodayOnly,
    showUnreadOnly,
    showHasSubtasks,
    hideCompleted,
    viewMode,
    sortBy,
    groupBy,
    currentUser,
    notifications,
    columns,
    categories,
    boards,
  });

  const {
    filteredTasks,
    activeColumns,
    assigneeOptions,
  } = taskFiltering;

  return {
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
    isEditing,
    setIsEditing,
    editFormData,
    setEditFormData,
    formData,
    setFormData,
    formSubtasks,
    setFormSubtasks,
    formSubtaskInput,
    setFormSubtaskInput,
    formSubtaskAssignee,
    setFormSubtaskAssignee,
    subtasks,
    setSubtasks,
    isSubtasksLoading,
    setIsSubtasksLoading,
    newSubtaskName,
    setNewSubtaskName,
    newSubtaskAssignee,
    setNewSubtaskAssignee,
    clonedTaskIds,
    setClonedTaskIds,
    pendingStatusChange,
    setPendingStatusChange,
    previewTask,
    setPreviewTask,
    isTasksLoading,
    setIsTasksLoading,
    isSubmitting,
    setIsSubmitting,
    isKanbanDragging,
    setIsKanbanDragging,
    isTrashHovered,
    setIsTrashHovered,
    calDate,
    setCalDate,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterAssignee,
    setFilterAssignee,
    filterTag,
    setFilterTag,
    showMyTasks,
    setShowMyTasks,
    showOverdueOnly,
    setShowOverdueOnly,
    showDueTodayOnly,
    setShowDueTodayOnly,
    showUnreadOnly,
    setShowUnreadOnly,
    showHasSubtasks,
    setShowHasSubtasks,
    hideCompleted,
    setHideCompleted,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    filteredTasks,
    activeColumns,
    assigneeOptions,
    fetchTasks,
    fetchSubtasks,
    handleSubmit,
    handleQuickAddTask,
    handleEditSubmit,
    handleDelete,
    startEditing,
    handleDirectStatusChange,
    onDragEnd,
    confirmPendingStatusChange,
    cancelPendingStatusChange,
    handleAddSubtask,
    handleToggleSubtask,
    handleUpdateSubtaskAssignee,
    handleDeleteSubtask,
    handleSubtaskDragEnd,
    handleAddFormSubtask,
    handleRemoveFormSubtask,
    handleQuickLinkAdd,
    handleQuickLinkRemove,
    handleToggleAutoNudge,
    handleRequesterChange,
    insertMention,
    handleOpenNewTaskForm,
  };
}
