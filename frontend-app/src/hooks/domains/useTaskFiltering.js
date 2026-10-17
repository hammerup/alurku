import { useMemo } from 'react';
import { DEFAULT_COLUMNS, DEFAULT_CATEGORIES } from './constants';
import { isUserAssigned, getTaskAssignee, getLocalToday } from './helpers';

export function useTaskFiltering({
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
}) {
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    (tasks || []).forEach((t) => {
      let taskTags = [];
      if (Array.isArray(t.tags)) {
        taskTags = t.tags;
      } else if (typeof t.tags === 'string') {
        const trimmed = t.tags.trim();
        if (trimmed && trimmed !== '[]') {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) taskTags = parsed;
          } catch {
            taskTags = trimmed.split(',');
          }
        }
      }
      taskTags.forEach((tag) => {
        const s = String(tag || '').trim();
        if (s) tagSet.add(s);
      });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const filtered = (tasks || []).filter((task) => {
      if (selectedBoard && selectedBoard.id !== 'global') {
        if (task.board_id !== selectedBoard.id) {
          return false;
        }
      }

      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      const combinedSearchText = [
        task.project_name,
        task.requester,
        task.category,
        task.description,
        task.owner_username,
      ]
        .join(' ')
        .toLowerCase();
      let matchSearch = keywords.length === 0 || keywords.every((kw) => combinedSearchText.includes(kw));

      if (searchQuery && matchSearch && (task.status === 'Done' || task.status === 'Rejected')) {
        const completedTime = task.completed_time ? new Date(task.completed_time.replace(/-/g, '/')) : new Date(0);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (completedTime < ninetyDaysAgo) {
          matchSearch = false;
        }
      }

      const matchStatus = filterStatus === 'All' || task.status === filterStatus;
      const matchCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchAssignee = filterAssignee === 'All' || getTaskAssignee(task) === filterAssignee;
      const matchTag = (() => {
        if (!filterTag || filterTag === 'All') return true;
        let tTags = [];
        if (Array.isArray(task.tags)) {
          tTags = task.tags;
        } else if (typeof task.tags === 'string') {
          const trimmed = task.tags.trim();
          if (trimmed && trimmed !== '[]') {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) tTags = parsed;
            } catch {
              tTags = trimmed.split(',');
            }
          }
        }
        return tTags.some((t) => String(t).trim().toLowerCase() === String(filterTag).trim().toLowerCase());
      })();
      const matchMyTasks = !showMyTasks || isUserAssigned(task, currentUser);
      const matchUnread =
        !showUnreadOnly ||
        (notifications || []).some(
          (n) =>
            !n.is_read &&
            n.related_task_id === task.id &&
            (n.type === 'comment' || n.type === 'mention' || n.type === 'mention_no_email')
        );
      const matchHasSubtasks = !showHasSubtasks || (task.subtask_total && task.subtask_total > 0);
      const matchHideCompleted =
        !(
          hideCompleted &&
          (viewMode === 'kanban' || viewMode === 'list' || viewMode === 'timeline' || viewMode === 'calendar')
        ) ||
        (task.status !== 'Done' && task.status !== 'Rejected');
      const matchDateFilter = (() => {
        if (!showOverdueOnly && !showDueTodayOnly) return true;
        if (!task.deadline) return false;
        const status = (task.status || '').toLowerCase();
        if (status === 'done' || status === 'rejected') return false;

        const isOverdue = (() => {
          const end = new Date(task.deadline);
          const now = new Date();
          end.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          return end < now;
        })();

        const isDueToday = (() => {
          const todayStr = getLocalToday();
          const deadlineDateStr = task.deadline.split(' ')[0];
          return deadlineDateStr === todayStr;
        })();

        if (showOverdueOnly && showDueTodayOnly) {
          return isOverdue || isDueToday;
        }
        if (showOverdueOnly) return isOverdue;
        if (showDueTodayOnly) return isDueToday;
        return true;
      })();

      return (
        matchSearch &&
        matchStatus &&
        matchCategory &&
        matchAssignee &&
        matchTag &&
        matchMyTasks &&
        matchUnread &&
        matchHasSubtasks &&
        matchHideCompleted &&
        matchDateFilter
      );
    });

    const sorted = filtered.sort((a, b) => {
      let currentSort = sortBy;
      if (currentSort === 'Default') {
        const prioWeight = { critical: 1, warning: 2, normal: 3 };
        const wa = prioWeight[a.priority_lvl || 'normal'] || 3;
        const wb = prioWeight[b.priority_lvl || 'normal'] || 3;
        if (wa !== wb) return wa - wb;

        const impactWeight = { High: 1, Medium: 2, Low: 3 };
        const impA = impactWeight[a.impact || 'Medium'] || 2;
        const impB = impactWeight[b.impact || 'Medium'] || 2;
        if (impA !== impB) return impA - impB;

        const da = a.deadline
          ? new Date(a.deadline.replace(/-/g, '/')).getTime()
          : new Date(a.timestamp.replace(/-/g, '/')).getTime();
        const db = b.deadline
          ? new Date(b.deadline.replace(/-/g, '/')).getTime()
          : new Date(b.timestamp.replace(/-/g, '/')).getTime();
        if (da !== db) return da - db;
        return a.id - b.id;
      }
      if (currentSort === 'Impact') {
        const impactWeight = { High: 3, Medium: 2, Low: 1 };
        const wa = impactWeight[a.impact || 'Medium'] || 0;
        const wb = impactWeight[b.impact || 'Medium'] || 0;
        if (wa !== wb) return wb - wa;
        if (a.etc !== b.etc) return (b.etc || 2) - (a.etc || 2);
        const da = a.deadline ? new Date(a.deadline.replace(/-/g, '/')).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline.replace(/-/g, '/')).getTime() : Infinity;
        if (da !== db) return da - db;
        return a.id - b.id;
      }
      if (currentSort === 'Due Date') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        const da = new Date(a.deadline.replace(/-/g, '/')).getTime();
        const db = new Date(b.deadline.replace(/-/g, '/')).getTime();
        return da - db;
      }
      if (currentSort === 'Date Created') {
        const da = new Date(a.timestamp.replace(/-/g, '/')).getTime();
        const db = new Date(b.timestamp.replace(/-/g, '/')).getTime();
        return db - da;
      }
      return a.id - b.id;
    });

    return sorted;
  }, [
    tasks,
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
    sortBy,
    currentUser,
    notifications,
    hideCompleted,
    viewMode,
    selectedBoard,
  ]);

  const activeColumns = useMemo(() => {
    if (groupBy === 'Status') return columns || DEFAULT_COLUMNS;
    if (groupBy === 'Category') return categories || DEFAULT_CATEGORIES;
    if (groupBy === 'Assignee') return [...new Set((tasks || []).map((t) => getTaskAssignee(t)))];
    if (groupBy === 'Project') {
      const todoListBoard =
        (boards || []).find((b) => {
          const name = (b.name || '').toLowerCase();
          return (name === 'personal tasks' || name === 'to-do list' || name === 'tugas pribadi') && b.is_private === 1;
        }) ||
        (boards || []).find((b) => {
          const name = (b.name || '').toLowerCase();
          return name === 'personal tasks' || name === 'to-do list' || name === 'tugas pribadi';
        });
      const todoListName =
        todoListBoard && (!selectedBoard || selectedBoard.id === 'global' || selectedBoard.id === todoListBoard.id)
          ? todoListBoard.name
          : null;

      const projCols = [...new Set((tasks || []).map((t) => t.board_name || 'Unknown Project'))];
      const allCols = todoListName && !projCols.includes(todoListName) ? [todoListName, ...projCols] : projCols;

      return allCols.sort((a, b) => {
        const isTodoA = a.toLowerCase() === 'personal tasks' || a.toLowerCase() === 'to-do list';
        const isTodoB = b.toLowerCase() === 'personal tasks' || b.toLowerCase() === 'to-do list';
        if (isTodoA && !isTodoB) return -1;
        if (!isTodoA && isTodoB) return 1;
        return 0;
      });
    }
    return [];
  }, [groupBy, columns, categories, tasks, boards, selectedBoard]);

  const assigneeOptions = useMemo(() => [...new Set((tasks || []).map((t) => getTaskAssignee(t)))], [tasks]);

  return {
    availableTags,
    filteredTasks,
    activeColumns,
    assigneeOptions,
  };
}
