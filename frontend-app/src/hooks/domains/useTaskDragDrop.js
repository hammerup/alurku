import { useState } from 'react';
import axios from 'axios';

export function useTaskDragDrop({
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
  pendingStatusChange: externalPendingStatusChange,
  setPendingStatusChange: externalSetPendingStatusChange,
}) {
  const [isKanbanDragging, setIsKanbanDragging] = useState(false);
  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [internalPendingStatusChange, setInternalPendingStatusChange] = useState(null);

  const pendingStatusChange =
    externalPendingStatusChange !== undefined ? externalPendingStatusChange : internalPendingStatusChange;
  const setPendingStatusChange =
    externalSetPendingStatusChange !== undefined ? externalSetPendingStatusChange : setInternalPendingStatusChange;

  const onDragEnd = (result, force = false) => {
    if (!result.destination) return;
    const { source, destination, draggableId, type } = result;

    if (type === 'column') {
      return;
    }

    if (destination.droppableId === 'trash') {
      const draggedTask = tasks.find((t) => t.id.toString() === draggableId);
      if (draggedTask) {
        const isTaskAdmin =
          isSuperAdmin ||
          draggedTask.owner_username === currentUser ||
          (selectedBoard && selectedBoard.owner_username === currentUser) ||
          (draggedTask.requester &&
            new RegExp(`@${currentUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w.-])`, 'i').test(
              draggedTask.requester
            ));
        if (isTaskAdmin) {
          setSelectedTask(draggedTask);
          if (setIsDeleteConfirmOpen) setIsDeleteConfirmOpen(true);
        } else {
          if (showNotification) {
            showNotification(
              tMsg(
                'Permission Denied: Only Task Admins can delete this task.',
                'Izin Ditolak: Hanya Admin Tugas yang dapat menghapus tugas ini.'
              ),
              'error'
            );
          }
        }
      }
      return;
    }

    if (source.droppableId === destination.droppableId) return;

    const draggedTask = tasks.find((t) => t.id.toString() === draggableId);
    if (!draggedTask) return;

    const isTaskAdmin =
      isSuperAdmin ||
      draggedTask.owner_username === currentUser ||
      (selectedBoard && selectedBoard.owner_username === currentUser) ||
      (draggedTask.requester &&
        new RegExp(`@${currentUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w.-])`, 'i').test(
          draggedTask.requester
        ));

    if (!isTaskAdmin) {
      if (showNotification) {
        showNotification(
          tMsg(
            'Permission Denied: Only Task Admins can move this task.',
            'Izin Ditolak: Hanya Admin Tugas yang dapat memindahkannya.'
          ),
          'error'
        );
      }
      return;
    }

    const updatedTasks = tasks.map((t) => {
      if (t.id.toString() === draggableId) {
        if (groupBy === 'Status') {
          let compTime;
          if (destination.droppableId === 'Done' || destination.droppableId === 'Rejected') {
            const now = new Date();
            compTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
              now.getDate()
            ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
              2,
              '0'
            )}:${String(now.getSeconds()).padStart(2, '0')}`;
          } else {
            compTime = null;
          }
          let newRecurring = t.recurring;
          if (destination.droppableId === 'Done' && t.status !== 'Done') {
            newRecurring = 'none';
          }
          return { ...t, status: destination.droppableId, completed_time: compTime, recurring: newRecurring };
        }
        if (groupBy === 'Category') return { ...t, category: destination.droppableId };
        if (groupBy === 'Assignee')
          return { ...t, requester: destination.droppableId === 'Unassigned' ? '' : destination.droppableId };
        if (groupBy === 'Project') {
          const targetBoard = (boards || []).find((b) => b.name === destination.droppableId);
          return {
            ...t,
            board_name: destination.droppableId,
            board_id: targetBoard ? targetBoard.id : t.board_id,
          };
        }
      }
      return t;
    });

    if (!force && groupBy === 'Status' && destination.droppableId === 'Done') {
      if (draggedTask.subtask_done < draggedTask.subtask_total) {
        setTasks(updatedTasks);
        setPendingStatusChange({ type: 'drag', payload: result, previousTasks: tasks });
        return;
      }
    }

    setTasks(updatedTasks);

    if (groupBy === 'Status') {
      axios
        .put(`/api/tasks/${draggableId}`, { status: destination.droppableId })
        .then((res) => {
          if (res.data?.cloned_task_id) {
            setClonedTaskIds((prev) => new Set(prev).add(Number(res.data.cloned_task_id)));
          }
          fetchTasks();
        })
        .catch((err) => {
          if (showNotification) showNotification(err.response?.data?.detail || 'Failed to save status to database!', 'error');
          fetchTasks();
        });
    } else {
      const payload = {
        project_name: draggedTask.project_name,
        requester:
          groupBy === 'Assignee'
            ? destination.droppableId === 'Unassigned'
              ? ''
              : destination.droppableId
            : draggedTask.requester,
        category: groupBy === 'Category' ? destination.droppableId : draggedTask.category,
        description: draggedTask.description || '',
        supporting_access: draggedTask.supporting_access || '',
        start_date: draggedTask.start_date || '',
        deadline: draggedTask.deadline ? draggedTask.deadline.split(' ')[0] + ' 17:00:00' : '',
        impact: draggedTask.impact || 'Medium',
        etc: draggedTask.etc || 2,
        auto_nudge: draggedTask.auto_nudge || false,
        recurring: draggedTask.recurring || 'none',
        status: draggedTask.status,
      };
      if (groupBy === 'Project') {
        const targetBoard = (boards || []).find((b) => b.name === destination.droppableId);
        if (targetBoard) {
          payload.board_id = targetBoard.id;
        }
      }
      axios
        .put(`/api/tasks/${draggableId}/details`, payload)
        .then(() => {
          if (
            payload.status === 'Done' &&
            draggedTask.status !== 'Done' &&
            draggedTask.recurring &&
            draggedTask.recurring !== 'none'
          ) {
            fetchTasks();
          }
        })
        .catch((err) => {
          if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update task details!', 'error');
          fetchTasks();
        });
    }
  };

  const confirmPendingStatusChange = () => {
    if (!pendingStatusChange) return;
    const { type, payload, targetTaskId } = pendingStatusChange;
    if (type === 'drag') {
      onDragEnd(payload, true);
    } else if (type === 'direct') {
      if (handleDirectStatusChange) handleDirectStatusChange(payload, true, targetTaskId);
    } else if (type === 'edit') {
      if (handleEditSubmit) handleEditSubmit(null, true);
    } else if (type === 'timeline') {
      if (handleMouseUp) handleMouseUp(null, payload);
    }
    setPendingStatusChange(null);
  };

  const cancelPendingStatusChange = () => {
    if (pendingStatusChange?.previousTasks) {
      setTasks(pendingStatusChange.previousTasks);
    }
    setPendingStatusChange(null);
  };

  return {
    isKanbanDragging,
    setIsKanbanDragging,
    isTrashHovered,
    setIsTrashHovered,
    pendingStatusChange,
    setPendingStatusChange,
    onDragEnd,
    confirmPendingStatusChange,
    cancelPendingStatusChange,
  };
}
