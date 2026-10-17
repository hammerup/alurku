import { useState, useEffect } from 'react';
import axios from 'axios';

export function useSubtaskManagement({
  selectedTask,
  setSelectedTask,
  currentUser,
  notifications,
  fetchNotifications,
  fetchComments,
  fetchTasks,
  showNotification,
  accountStatus,
}) {
  const [subtasks, setSubtasks] = useState([]);
  const [isSubtasksLoading, setIsSubtasksLoading] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState('');

  const [formSubtasks, setFormSubtasks] = useState([]);
  const [formSubtaskInput, setFormSubtaskInput] = useState('');
  const [formSubtaskAssignee, setFormSubtaskAssignee] = useState('');

  const fetchSubtasks = (taskId) => {
    setIsSubtasksLoading(true);
    axios
      .get(`/api/tasks/${taskId}/subtasks`)
      .then((res) => setSubtasks(res.data.subtasks || []))
      .catch((err) => console.error('Failed to load sub-tasks:', err))
      .finally(() => setIsSubtasksLoading(false));
  };

  useEffect(() => {
    if (selectedTask?.id) {
      fetchSubtasks(selectedTask.id);
      if (fetchComments) fetchComments(selectedTask.id);

      if (selectedTask.queue_global_number === undefined || selectedTask.recurring === undefined) {
        axios
          .get(`/api/tasks/${selectedTask.id}`)
          .then((res) => {
            if (res.data?.task) {
              setSelectedTask(res.data.task);
            }
          })
          .catch((err) => console.error('Failed to load full task details:', err));
      }

      const unreadForTask = (notifications || []).filter((n) => !n.is_read && n.related_task_id === selectedTask?.id);
      if (unreadForTask.length > 0) {
        Promise.all(unreadForTask.map((n) => axios.put(`/api/notifications/${n.id}/read`)))
          .then(() => {
            if (fetchNotifications) fetchNotifications();
          })
          .catch(console.error);
      }

      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      localStorage.setItem(`innocean_last_read_task_${selectedTask.id}_${currentUser}`, nowStr);
    } else {
      setSubtasks([]);
    }
  }, [selectedTask?.id, currentUser]);

  const handleAddSubtask = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newSubtaskName.trim() || !selectedTask) return;
    axios
      .post(`/api/tasks/${selectedTask.id}/subtasks`, {
        task_name: newSubtaskName,
        assignee: newSubtaskAssignee || null,
      })
      .then(() => {
        setNewSubtaskName('');
        setNewSubtaskAssignee('');
        fetchSubtasks(selectedTask.id);
        if (fetchComments) fetchComments(selectedTask.id);
        fetchTasks();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to add sub-task!', 'error');
      });
  };

  const handleToggleSubtask = (subtaskId, currentStatus, currentAssignee) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const prevSubtasks = subtasks;
    setSubtasks((prev) => prev.map((st) => (st.id === subtaskId ? { ...st, is_done: newStatus } : st)));
    axios
      .put(`/api/subtasks/${subtaskId}`, { is_done: newStatus, assignee: currentAssignee })
      .then(() => {
        if (selectedTask) {
          fetchSubtasks(selectedTask.id);
          if (fetchComments) fetchComments(selectedTask.id);
        }
        fetchTasks();
      })
      .catch((err) => {
        setSubtasks(prevSubtasks);
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update sub-task!', 'error');
      });
  };

  const handleUpdateSubtaskAssignee = (subtaskId, currentIsDone, newAssignee) => {
    const keepStatus = currentIsDone === 1 ? 1 : 0;
    const prevSubtasks = subtasks;
    setSubtasks((prev) => prev.map((st) => (st.id === subtaskId ? { ...st, assignee: newAssignee } : st)));
    axios
      .put(`/api/subtasks/${subtaskId}`, { is_done: keepStatus, assignee: newAssignee })
      .then(() => {
        if (selectedTask) {
          fetchSubtasks(selectedTask.id);
          if (fetchComments) fetchComments(selectedTask.id);
        }
        fetchTasks();
      })
      .catch((err) => {
        setSubtasks(prevSubtasks);
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update sub-task assignee!', 'error');
      });
  };

  const handleDeleteSubtask = (subtaskId) => {
    if (!selectedTask) return;
    axios
      .delete(`/api/subtasks/${subtaskId}`)
      .then(() => {
        fetchSubtasks(selectedTask.id);
        if (fetchComments) fetchComments(selectedTask.id);
        fetchTasks();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to delete sub-task!', 'error');
      });
  };

  const handleSubtaskDragEnd = (result) => {
    if (!result.destination || accountStatus === 'suspended' || !selectedTask) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newSubtasks = Array.from(subtasks);
    const [removed] = newSubtasks.splice(sourceIndex, 1);
    newSubtasks.splice(destinationIndex, 0, removed);
    setSubtasks(newSubtasks);

    const orderedIds = newSubtasks.map((s) => s.id);
    axios.put(`/api/tasks/${selectedTask.id}/subtasks/reorder`, { ordered_ids: orderedIds }).catch(() => {
      if (showNotification) showNotification('Failed to save subtask order!', 'error');
      fetchSubtasks(selectedTask.id);
    });
  };

  const handleAddFormSubtask = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formSubtaskInput.trim()) return;
    setFormSubtasks([...formSubtasks, { task_name: formSubtaskInput.trim(), assignee: formSubtaskAssignee || null }]);
    setFormSubtaskInput('');
    setFormSubtaskAssignee('');
  };

  const handleRemoveFormSubtask = (index) => {
    setFormSubtasks(formSubtasks.filter((_, i) => i !== index));
  };

  return {
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
  };
}
