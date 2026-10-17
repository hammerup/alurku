import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import { DAY_WIDTH } from './constants';
import { getTaskAssignee, isUserAssigned } from './helpers';

export function useTimelinePan({
  setTasks,
  leaves,
  selectedBoard,
  currentUser,
  isSuperAdmin,
  groupBy,
  setPendingStatusChange,
  showNotification,
  fetchTasks,
  isTrashHovered,
  setIsTrashHovered,
  setIsDeleteConfirmOpen,
  setSelectedTask,
}) {
  const [timelineDrag, setTimelineDrag] = useState(null);
  const [hoveredTimelineRow, setHoveredTimelineRow] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollRef = useRef(null);
  const activeScrollRef = useRef(null);
  const mouseUpRef = useRef();

  const handleMouseDown = (e) => {
    if (
      e.target.closest('.task-card') ||
      e.target.closest('.board-col-header') ||
      e.target.closest('#floating-trash') ||
      e.target.closest('[data-rbd-drag-handle-context-id]') ||
      e.target.closest('[data-rpd-drag-handle-context-id]') ||
      e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.closest('select') ||
      e.target.closest('a') ||
      e.target.closest('.fixed') ||
      e.target.closest(
        'p, span, h1, h2, h3, h4, h5, h6, strong, em, b, i, blockquote, pre, code, td, th, tr, details, summary, label, li'
      )
    ) {
      return;
    }

    const scrollable = e.target.closest('.overflow-auto, .overflow-x-auto') || scrollRef.current;
    if (scrollable) {
      const rect = scrollable.getBoundingClientRect();
      const scrollbarHeight = scrollable.offsetHeight - scrollable.clientHeight;
      const scrollbarWidth = scrollable.offsetWidth - scrollable.clientWidth;
      if (
        (scrollbarHeight > 0 && e.clientY >= rect.bottom - scrollbarHeight) ||
        (scrollbarWidth > 0 && e.clientX >= rect.right - scrollbarWidth)
      ) {
        return;
      }

      activeScrollRef.current = scrollable;
      setIsPanning(true);
      setStartX(e.pageX - scrollable.offsetLeft);
      setScrollLeft(scrollable.scrollLeft);
    }
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
    activeScrollRef.current = null;
  };

  const updateTaskDates = (task, deltaDays, mode = 'end') => {
    const parseDateStr = (dStr) => {
      if (!dStr) return new Date();
      const d = new Date(dStr.replace(/-/g, '/'));
      d.setHours(0, 0, 0, 0);
      return d;
    };
    const formatDStr = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let sDate = parseDateStr(task.start_date || (task.timestamp ? task.timestamp.split(' ')[0] : ''));
    let eDate = task.deadline ? parseDateStr(task.deadline.split(' ')[0]) : parseDateStr();

    const snapToValidDay = (date, direction = 1) => {
      let d = new Date(date);
      while (true) {
        const dStr = formatDStr(d);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const isHoliday = (leaves || []).some(
          (l) => l.leave_date === dStr && (l.leave_type !== 'personal' || isUserAssigned(task, l.username))
        );
        if (isWeekend || isHoliday) {
          d.setDate(d.getDate() + direction);
        } else {
          break;
        }
      }
      return d;
    };

    if (mode === 'end') {
      eDate.setDate(eDate.getDate() + deltaDays);
      if (eDate < sDate) eDate = new Date(sDate);
      eDate = snapToValidDay(eDate, deltaDays >= 0 ? 1 : -1);
    } else if (mode === 'start') {
      sDate.setDate(sDate.getDate() + deltaDays);
      if (sDate > eDate) sDate = new Date(eDate);
      sDate = snapToValidDay(sDate, deltaDays >= 0 ? 1 : -1);
    } else if (mode === 'both') {
      sDate.setDate(sDate.getDate() + deltaDays);
      eDate.setDate(eDate.getDate() + deltaDays);
      sDate = snapToValidDay(sDate, deltaDays >= 0 ? 1 : -1);
      eDate = snapToValidDay(eDate, deltaDays >= 0 ? 1 : -1);
    }

    if (eDate < sDate) eDate = new Date(sDate);

    const newStartDate = formatDStr(sDate);
    const newDeadline = formatDStr(eDate) + ' 17:00:00';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((eDate - today) / (1000 * 60 * 24 * 60));
    let newPriorityLvl = 'normal';
    let newPriorityStr = 'NORMAL';
    if (diffDays <= 1) {
      newPriorityLvl = 'critical';
      newPriorityStr = 'CRITICAL';
    } else if (diffDays <= 3) {
      newPriorityLvl = 'warning';
      newPriorityStr = 'WARNING';
    }

    const updatedTask = {
      ...task,
      start_date: newStartDate,
      deadline: newDeadline,
      priority_lvl: newPriorityLvl,
      priority_str: newPriorityStr,
    };
    if (setTasks) setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

    const payload = {
      project_name: task.project_name,
      requester: task.requester,
      category: task.category,
      description: task.description || '',
      supporting_access: task.supporting_access || '',
      start_date: newStartDate,
      deadline: newDeadline,
      impact: task.impact || 'Medium',
      etc: task.etc || 2,
      auto_nudge: task.auto_nudge || false,
      recurring: task.recurring || 'none',
      status: task.status,
    };

    axios
      .put(`/api/tasks/${task.id}/details`, payload)
      .then(() => {
        if (showNotification) showNotification('Timeline dates updated', 'success');
        if (fetchTasks) fetchTasks();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update dates', 'error');
        if (fetchTasks) fetchTasks();
      });
  };

  const handleMouseUp = (e, forceDropPayload = null) => {
    setIsPanning(false);
    activeScrollRef.current = null;

    let droppedOnTrash = isTrashHovered;
    if (timelineDrag && e) {
      const trashEl = document.getElementById('floating-trash');
      if (trashEl) {
        const rect = trashEl.getBoundingClientRect();
        const padding = 40;
        if (
          e.clientX >= rect.left - padding &&
          e.clientX <= rect.right + padding &&
          e.clientY >= rect.top - padding &&
          e.clientY <= rect.bottom + padding
        ) {
          droppedOnTrash = true;
        }
      }
    }

    if (droppedOnTrash && timelineDrag) {
      const t = timelineDrag.task;
      if (setSelectedTask) setSelectedTask(t);
      if (setIsDeleteConfirmOpen) setIsDeleteConfirmOpen(true);
      setTimelineDrag(null);
      if (setIsTrashHovered) setIsTrashHovered(false);
      setHoveredTimelineRow(null);
      return;
    }

    const currentDrag = forceDropPayload ? forceDropPayload.dragged : timelineDrag;
    const currentRow = forceDropPayload ? forceDropPayload.hoveredRow : hoveredTimelineRow;

    if (currentDrag) {
      let requiresUpdate = false;
      const t = currentDrag.task;
      const payload = {
        project_name: t.project_name,
        requester: t.requester,
        category: t.category,
        description: t.description || '',
        supporting_access: t.supporting_access || '',
        start_date: t.start_date || '',
        deadline: t.deadline ? t.deadline.split(' ')[0] + ' 17:00:00' : '',
        impact: t.impact || 'Medium',
        etc: t.etc || 2,
        auto_nudge: t.auto_nudge || false,
        recurring: t.recurring || 'none',
        status: t.status,
        board_id: t.board_id,
      };
      const updatedTask = { ...t };

      if (currentDrag.mode === 'both' && currentRow && currentRow !== 'unknown') {
        if (groupBy === 'Assignee' && currentRow !== getTaskAssignee(t)) {
          updatedTask.requester = currentRow === 'Unassigned' ? '' : currentRow;
          payload.requester = updatedTask.requester;
          requiresUpdate = true;
        } else if (groupBy === 'Status' && currentRow !== t.status) {
          if (!forceDropPayload && currentRow === 'Done' && t.subtask_done < t.subtask_total) {
            if (setPendingStatusChange) {
              setPendingStatusChange({
                type: 'timeline',
                payload: { dragged: currentDrag, hoveredRow: currentRow },
              });
            }
            setTimelineDrag(null);
            setHoveredTimelineRow(null);
            return;
          }
          updatedTask.status = currentRow;
          payload.status = updatedTask.status;
          requiresUpdate = true;
        } else if (groupBy === 'Category' && currentRow !== (t.category || 'Uncategorized')) {
          updatedTask.category = currentRow === 'Uncategorized' ? '' : currentRow;
          payload.category = updatedTask.category;
          requiresUpdate = true;
        } else if (groupBy === 'Project' && String(currentRow) !== String(t.board_id || 'unknown')) {
          const newBoardId = parseInt(currentRow);
          if (!isNaN(newBoardId)) {
            updatedTask.board_id = newBoardId;
            payload.board_id = newBoardId;
            requiresUpdate = true;
          }
        }
      }

      if (requiresUpdate) {
        const isTaskAdmin =
          isSuperAdmin ||
          t.owner_username === currentUser ||
          (selectedBoard && selectedBoard.owner_username === currentUser) ||
          (t.requester &&
            new RegExp(`@${currentUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w.-])`, 'i').test(t.requester));
        if (isTaskAdmin) {
          if (setTasks) setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
          axios
            .put(`/api/tasks/${updatedTask.id}/details`, payload)
            .then(() => {
              if (showNotification) showNotification(`Task successfully reassigned!`, 'success');
              if (fetchTasks) fetchTasks();
            })
            .catch((err) => {
              if (showNotification) showNotification(err.response?.data?.detail || 'Failed to update task', 'error');
              if (fetchTasks) fetchTasks();
            });
        } else {
          if (showNotification) showNotification('Permission Denied: You cannot modify this task.', 'error');
        }
      }

      if (currentDrag.startOffsetDays !== 0) {
        updateTaskDates(currentDrag.task, currentDrag.startOffsetDays, currentDrag.mode);
        setTimeout(() => setTimelineDrag(null), 100);
      } else {
        setTimelineDrag(null);
      }
      setHoveredTimelineRow(null);
    }
  };

  useLayoutEffect(() => {
    mouseUpRef.current = handleMouseUp;
  });

  useEffect(() => {
    const onMouseUpGlobal = (e) => {
      if (mouseUpRef.current) mouseUpRef.current(e);
    };

    window.addEventListener('mouseup', onMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', onMouseUpGlobal);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (timelineDrag) {
      e.preventDefault();

      const dragWidth = timelineDrag.dragWidth || DAY_WIDTH;
      const deltaX = e.pageX - timelineDrag.startX;
      let deltaDays = Math.round(deltaX / dragWidth);

      if (timelineDrag.isCalendar) {
        const dragHeight = timelineDrag.dragHeight || 100;
        const deltaY = e.pageY - (timelineDrag.startY || e.pageY);
        const deltaWeeks = Math.round(deltaY / dragHeight);
        deltaDays += deltaWeeks * 7;
      }

      if (deltaDays !== timelineDrag.startOffsetDays) {
        setTimelineDrag((prev) => (prev ? { ...prev, startOffsetDays: deltaDays } : null));
      }
      return;
    }
    if (!isPanning || !activeScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - activeScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    activeScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return {
    timelineDrag,
    setTimelineDrag,
    hoveredTimelineRow,
    setHoveredTimelineRow,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    scrollRef,
  };
}
