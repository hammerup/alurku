import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { DEFAULT_COLUMNS, DEFAULT_CATEGORIES } from './constants';

export function useBoardWorkspace({
  isAuthenticated,
  showNotification,
  setIsLoading,
  setIsSubmitting,
  language,
  tMsg,
  tasks,
  setTasks,
  isFormOpen,
  setFormData,
  isEditing,
  setEditFormData,
  setIsCreateBoardOpen,
  fetchTasks,
}) {
  const [boards, setBoards] = useState([]);
  const [workspaceBoards, setWorkspaceBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('alurku_selected_board');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [newBoardName, setNewBoardName] = useState('');
  const [isPrivateBoard, setIsPrivateBoard] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [boardToArchive, setBoardToArchive] = useState(null);
  const [deleteBoardConfirmText, setDeleteBoardConfirmText] = useState('');
  const [isBoardsLoading, setIsBoardsLoading] = useState(false);
  const [isJoiningProject, setIsJoiningProject] = useState(false);

  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [colModal, setColModal] = useState({ isOpen: false, target: 'Status', mode: 'add', oldName: '', newName: '' });

  // Project Boards Preferences
  const [boardViewMode, setBoardViewMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_board_view') || 'grid';
    return 'grid';
  });
  const [boardSortBy, setBoardSortBy] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_board_sort') || 'active';
    return 'active';
  });
  const [favoriteBoards, setFavoriteBoards] = useState(() => {
    if (typeof window !== 'undefined') return JSON.parse(localStorage.getItem('alurku_fav_boards') || '[]');
    return [];
  });

  useEffect(() => localStorage.setItem('alurku_board_view', boardViewMode), [boardViewMode]);
  useEffect(() => localStorage.setItem('alurku_board_sort', boardSortBy), [boardSortBy]);
  useEffect(() => localStorage.setItem('alurku_fav_boards', JSON.stringify(favoriteBoards)), [favoriteBoards]);

  const currentBoardIdRef = useRef(null);

  useEffect(() => {
    if (selectedBoard) {
      if (currentBoardIdRef.current !== selectedBoard.id) {
        if (setTasks) setTasks([]);
        currentBoardIdRef.current = selectedBoard.id;

        if (selectedBoard.id !== 'global') {
          let dbCols = [],
            dbCats = [];
          try {
            dbCols = JSON.parse(selectedBoard.statuses || '[]');
          } catch (e) {}
          try {
            dbCats = JSON.parse(selectedBoard.categories || '[]');
          } catch (e) {}

          if (dbCols.length === 0) dbCols = DEFAULT_COLUMNS;
          if (dbCats.length === 0) dbCats = DEFAULT_CATEGORIES;

          const savedCols = localStorage.getItem(`alurku_columns_${selectedBoard.id}`);
          const savedCats = localStorage.getItem(`alurku_categories_${selectedBoard.id}`);
          let localCols = savedCols && savedCols !== 'null' && savedCols !== 'undefined' ? JSON.parse(savedCols) : [];
          let localCats = savedCats && savedCats !== 'null' && savedCats !== 'undefined' ? JSON.parse(savedCats) : [];

          const mergedCols = [
            ...localCols.filter((c) => dbCols.includes(c)),
            ...dbCols.filter((c) => !localCols.includes(c)),
          ];
          const mergedCats = [
            ...localCats.filter((c) => dbCats.includes(c)),
            ...dbCats.filter((c) => !localCats.includes(c)),
          ];

          setColumns(mergedCols.length > 0 ? mergedCols : DEFAULT_COLUMNS);
          setCategories(mergedCats.length > 0 ? mergedCats : DEFAULT_CATEGORIES);
        } else {
          setColumns(DEFAULT_COLUMNS);
          setCategories(DEFAULT_CATEGORIES);
        }
        if (fetchTasks) fetchTasks();
      }
    } else {
      setColumns(DEFAULT_COLUMNS);
      setCategories(DEFAULT_CATEGORIES);
      if (setTasks) setTasks([]);
      currentBoardIdRef.current = null;
      if (fetchTasks) fetchTasks();
    }
  }, [selectedBoard]);

  useEffect(() => {
    if (selectedBoard) {
      localStorage.setItem('alurku_selected_board', JSON.stringify(selectedBoard));
    } else {
      localStorage.removeItem('alurku_selected_board');
    }
  }, [selectedBoard]);

  const fetchBoards = useCallback(() => {
    if (!isAuthenticated) return;
    setIsBoardsLoading(true);
    axios
      .get('/api/boards')
      .then((res) => {
        setBoards(res.data.boards || []);
        setWorkspaceBoards(res.data.workspace_boards || res.data.boards || []);
      })
      .catch((err) => {
        if (err.response?.status !== 401) console.error(err);
      })
      .finally(() => setIsBoardsLoading(false));
  }, [isAuthenticated]);

  const syncBoardSettings = useCallback((newCols, newCats) => {
    if (!selectedBoard || selectedBoard.id === 'global') return;
    axios
      .put(`/api/boards/${selectedBoard.id}/settings`, {
        statuses: JSON.stringify(newCols),
        categories: JSON.stringify(newCats),
      })
      .then(() => {
        setSelectedBoard((prev) =>
          prev ? { ...prev, statuses: JSON.stringify(newCols), categories: JSON.stringify(newCats) } : null
        );
        setBoards((prev) =>
          prev.map((b) =>
            b.id === selectedBoard.id
              ? { ...b, statuses: JSON.stringify(newCols), categories: JSON.stringify(newCats) }
              : b
          )
        );
      })
      .catch(console.error);
  }, [selectedBoard]);

  useEffect(() => {
    if (tasks && tasks.length > 0 && selectedBoard) {
      if (selectedBoard.id !== 'global' && tasks[0].board_id !== selectedBoard.id) return;

      let colsChanged = false;
      let catsChanged = false;

      const deduplicate = (arr) => {
        const unique = [];
        const map = new Set();
        arr.forEach((item) => {
          const lower = item.toLowerCase();
          if (!map.has(lower)) {
            map.add(lower);
            unique.push(item);
          }
        });
        return unique;
      };

      let newCols = deduplicate(columns);
      if (newCols.length !== columns.length) colsChanged = true;

      let newCats = deduplicate(categories);

      const usedCatsLower = new Set(tasks.map((t) => (t.category || '').toLowerCase()).filter(Boolean));
      const defaultCatsLower = new Set(DEFAULT_CATEGORIES.map((c) => c.toLowerCase()));
      const preFilterLen = newCats.length;

      const emptyCatsKey = `alurku_empty_cats_${selectedBoard.id}`;
      let emptyCatsTimestamps = {};
      try {
        emptyCatsTimestamps = JSON.parse(localStorage.getItem(emptyCatsKey) || '{}');
      } catch (e) {}

      let timestampsChanged = false;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      newCats = newCats.filter((c) => {
        const lowerC = c.toLowerCase();
        if (defaultCatsLower.has(lowerC) || usedCatsLower.has(lowerC)) {
          if (emptyCatsTimestamps[lowerC]) {
            delete emptyCatsTimestamps[lowerC];
            timestampsChanged = true;
          }
          return true;
        }

        if (!emptyCatsTimestamps[lowerC]) {
          emptyCatsTimestamps[lowerC] = Date.now();
          timestampsChanged = true;
          return true;
        } else {
          const daysEmpty = Date.now() - emptyCatsTimestamps[lowerC];
          if (daysEmpty > sevenDaysMs) {
            delete emptyCatsTimestamps[lowerC];
            timestampsChanged = true;
            return false;
          }
          return true;
        }
      });

      if (timestampsChanged) {
        localStorage.setItem(emptyCatsKey, JSON.stringify(emptyCatsTimestamps));
      }

      if (newCats.length !== preFilterLen || newCats.length !== categories.length) catsChanged = true;

      const taskStatuses = [...new Set(tasks.map((t) => t.status))];
      const missingCols = taskStatuses.filter((s) => !newCols.some((c) => c.toLowerCase() === s.toLowerCase()));
      if (missingCols.length > 0) {
        newCols = [...newCols, ...missingCols];
        colsChanged = true;
      }

      const taskCats = [...new Set(tasks.map((t) => t.category))].filter(Boolean);
      const missingCats = taskCats.filter((c) => !newCats.some((nc) => nc.toLowerCase() === c.toLowerCase()));
      if (missingCats.length > 0) {
        newCats = [...newCats, ...missingCats];
        catsChanged = true;
      }

      let tasksToUpdate = [];
      const updatedTasks = tasks.map((t) => {
        let updated = false;
        let tStatus = t.status;
        let tCat = t.category;

        const matchedCol = newCols.find((c) => c.toLowerCase() === t.status.toLowerCase());
        if (matchedCol && matchedCol !== t.status) {
          tStatus = matchedCol;
          updated = true;
        }

        if (t.category) {
          const matchedCat = newCats.find((c) => c.toLowerCase() === t.category.toLowerCase());
          if (matchedCat && matchedCat !== t.category) {
            tCat = matchedCat;
            updated = true;
          }
        }

        if (updated) {
          const uTask = { ...t, status: tStatus, category: tCat };
          tasksToUpdate.push(uTask);
          return uTask;
        }
        return t;
      });

      if (tasksToUpdate.length > 0) {
        if (setTasks) setTasks(updatedTasks);
        tasksToUpdate.forEach((t) => {
          const payload = {
            project_name: t.project_name,
            requester: t.requester,
            category: t.category,
            description: t.description || '',
            supporting_access: t.supporting_access || '',
            start_date: t.start_date || (t.timestamp ? t.timestamp.split(' ')[0] : ''),
            deadline: t.deadline ? t.deadline.split(' ')[0] + ' 17:00:00' : '',
            impact: t.impact || 'Medium',
            etc: t.etc || 2,
            auto_nudge: t.auto_nudge || false,
            recurring: t.recurring || 'none',
            status: t.status,
          };
          axios.put(`/api/tasks/${t.id}/details`, payload).catch(console.error);
        });
      }

      if (selectedBoard.id !== 'global') {
        if (colsChanged) {
          localStorage.setItem(`alurku_columns_${selectedBoard.id}`, JSON.stringify(newCols));
          setColumns(newCols);
        }
        if (catsChanged) {
          localStorage.setItem(`alurku_categories_${selectedBoard.id}`, JSON.stringify(newCats));
          setCategories(newCats);
        }
        if (colsChanged || catsChanged) {
          syncBoardSettings(newCols, newCats);
        }
      }
    }
  }, [tasks, columns, categories, selectedBoard, syncBoardSettings]);

  const handleOpenAddBoard = (target) => {
    const maxLimit = 50;
    const currentLen = target === 'Status' ? columns.length : categories.length;
    const limitName = target === 'Status' ? 'columns' : 'categories';
    if (currentLen >= maxLimit) {
      if (showNotification) showNotification(`System limit reached. Maximum ${maxLimit} ${limitName} allowed.`, 'error');
      return;
    }
    setColModal({ isOpen: true, target, mode: 'add', oldName: '', newName: '' });
  };

  const handleOpenRenameBoard = (target, oldName) => {
    setColModal({ isOpen: true, target, mode: 'rename', oldName, newName: oldName });
  };

  const handleOpenDeleteBoard = (target, oldName) => {
    const currentTasks = tasks || [];
    const hasTasks =
      target === 'Status' ? currentTasks.some((t) => t.status === oldName) : currentTasks.some((t) => t.category === oldName);
    if (hasTasks) {
      if (showNotification) showNotification(`Cannot remove "${oldName}" because it currently contains tasks.`, 'error');
      return;
    }
    setColModal({ isOpen: true, target, mode: 'delete', oldName, newName: '' });
  };

  const handleColSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { mode, oldName, newName, target } = colModal;
    const list = target === 'Status' ? columns : categories;
    const setList = target === 'Status' ? setColumns : setCategories;
    const storageKey =
      target === 'Status' ? `alurku_columns_${selectedBoard?.id}` : `alurku_categories_${selectedBoard?.id}`;

    if (mode === 'add') {
      const name = newName.trim();
      if (!name) return;
      if (list.some((c) => c.toLowerCase() === name.toLowerCase())) {
        if (showNotification) showNotification(`${target} already exists!`, 'error');
        return;
      }
      const newList = [...list, name];
      setList(newList);
      if (selectedBoard && selectedBoard.id !== 'global') {
        localStorage.setItem(storageKey, JSON.stringify(newList));
        if (target === 'Status') syncBoardSettings(newList, categories);
        else syncBoardSettings(columns, newList);
      }
      if (target === 'Category') {
        if (isFormOpen && setFormData) setFormData((prev) => ({ ...prev, category: name }));
        const editing = typeof isEditing === 'function' ? isEditing() : isEditing;
        if (editing && setEditFormData) setEditFormData((prev) => ({ ...prev, category: name }));
      }
      if (showNotification) showNotification(`${target} added!`, 'success');
    } else if (mode === 'rename') {
      const name = newName.trim();
      if (!name || name.toLowerCase() === oldName.toLowerCase()) {
        setColModal({ ...colModal, isOpen: false });
        return;
      }
      if (list.some((c) => c.toLowerCase() === name.toLowerCase())) {
        if (showNotification) showNotification(`${target} name already exists!`, 'error');
        return;
      }

      const newList = list.map((c) => (c === oldName ? name : c));
      setList(newList);
      if (selectedBoard && selectedBoard.id !== 'global') {
        localStorage.setItem(storageKey, JSON.stringify(newList));
        if (target === 'Status') syncBoardSettings(newList, categories);
        else syncBoardSettings(columns, newList);
      }

      if (target === 'Status') {
        const updatedTasks = (tasks || []).map((t) => (t.status === oldName ? { ...t, status: name } : t));
        if (setTasks) setTasks(updatedTasks);
        const tasksToUpdate = (tasks || []).filter((t) => t.status === oldName);
        tasksToUpdate.forEach((t) => axios.put(`/api/tasks/${t.id}`, { status: name }).catch(console.error));
      } else {
        const updatedTasks = (tasks || []).map((t) => (t.category === oldName ? { ...t, category: name } : t));
        if (setTasks) setTasks(updatedTasks);
        const tasksToUpdate = (tasks || []).filter((t) => t.category === oldName);
        tasksToUpdate.forEach((t) => {
          const payload = {
            project_name: t.project_name,
            requester: t.requester,
            category: name,
            description: t.description || '',
            supporting_access: t.supporting_access || '',
            start_date: t.start_date || t.timestamp.split(' ')[0],
            deadline: t.deadline ? t.deadline.split(' ')[0] + ' 17:00:00' : '',
            impact: t.impact || 'Medium',
            etc: t.etc || 2,
            auto_nudge: t.auto_nudge || false,
            recurring: t.recurring || 'none',
            status: t.status,
          };
          axios.put(`/api/tasks/${t.id}/details`, payload).catch(console.error);
        });
      }

      if (showNotification) showNotification(`${target} renamed!`, 'success');
    } else if (mode === 'delete') {
      const newList = list.filter((c) => c !== oldName);
      setList(newList);
      if (selectedBoard && selectedBoard.id !== 'global') {
        localStorage.setItem(storageKey, JSON.stringify(newList));
        if (target === 'Status') syncBoardSettings(newList, categories);
        else syncBoardSettings(columns, newList);
      }
      if (showNotification) showNotification(`${target} deleted!`, 'success');
    }

    setColModal({ isOpen: false, target: 'Status', mode: 'add', oldName: '', newName: '' });
  };

  const renameProject = (id, name, description = null) => {
    if (!name.trim()) return;
    const payload = { name: name.trim() };
    if (description !== null) {
      payload.description = description.trim();
    }
    axios
      .put(`/api/boards/${id}`, payload)
      .then(() => {
        if (showNotification) {
          showNotification(
            language === 'id' ? 'Proyek berhasil diperbarui!' : 'Project updated successfully!',
            'success'
          );
        }
        fetchBoards();
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to update project', 'error');
        }
      });
  };

  const handleJoinProject = (boardId) => {
    const targetId = boardId || selectedBoard?.id;
    if (!targetId) return;
    setIsJoiningProject(true);
    axios
      .post(`/api/boards/${targetId}/join`)
      .then(() => {
        if (showNotification) {
          showNotification(
            tMsg(
              `Successfully joined project "${selectedBoard?.name || 'Project'}"!`,
              `Berhasil bergabung dengan proyek "${selectedBoard?.name || 'Proyek'}"!`
            ),
            'success'
          );
        }
        fetchBoards();
        if (selectedBoard && fetchTasks) {
          fetchTasks(true);
        }
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to join project!', 'error');
        }
      })
      .finally(() => setIsJoiningProject(false));
  };

  const handleCreateBoard = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newBoardName.trim()) return;
    if (setIsSubmitting) setIsSubmitting(true);
    axios
      .post('/api/boards', { name: newBoardName.trim(), is_private: isPrivateBoard ? 1 : 0 })
      .then(() => {
        if (setIsCreateBoardOpen) setIsCreateBoardOpen(false);
        setNewBoardName('');
        setIsPrivateBoard(false);
        fetchBoards();
        if (showNotification) showNotification('Project created successfully!', 'success');
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to create project', 'error');
        }
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  const confirmDeleteBoard = () => {
    if (!boardToDelete) return;
    if (setIsSubmitting) setIsSubmitting(true);
    axios
      .delete(`/api/boards/${boardToDelete.id}`)
      .then(() => {
        if (showNotification) showNotification('Project deleted!', 'success');
        fetchBoards();
        setBoardToDelete(null);
        setDeleteBoardConfirmText('');
        if (selectedBoard?.id === boardToDelete.id) setSelectedBoard(null);
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to delete project', 'error');
        }
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  const archiveBoard = (board) => {
    setBoardToArchive(board);
  };

  const confirmArchiveBoard = () => {
    if (!boardToArchive) return;
    if (setIsSubmitting) setIsSubmitting(true);
    axios
      .patch(`/api/boards/${boardToArchive.id}/archive`)
      .then(() => {
        if (showNotification) showNotification('Project archived!', 'success');
        fetchBoards();
        if (selectedBoard?.id === boardToArchive.id) setSelectedBoard(null);
        setBoardToArchive(null);
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to archive project', 'error');
        }
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  return {
    boards,
    setBoards,
    workspaceBoards,
    setWorkspaceBoards,
    selectedBoard,
    setSelectedBoard,
    newBoardName,
    setNewBoardName,
    isPrivateBoard,
    setIsPrivateBoard,
    boardToDelete,
    setBoardToDelete,
    boardToArchive,
    setBoardToArchive,
    confirmArchiveBoard,
    deleteBoardConfirmText,
    setDeleteBoardConfirmText,
    boardViewMode,
    setBoardViewMode,
    boardSortBy,
    setBoardSortBy,
    favoriteBoards,
    setFavoriteBoards,
    colModal,
    setColModal,
    columns,
    setColumns,
    categories,
    setCategories,
    isBoardsLoading,
    setIsBoardsLoading,
    isJoiningProject,
    setIsJoiningProject,
    fetchBoards,
    syncBoardSettings,
    handleOpenAddBoard,
    handleOpenRenameBoard,
    handleOpenDeleteBoard,
    handleColSubmit,
    renameProject,
    archiveBoard,
    handleJoinProject,
    handleCreateBoard,
    confirmDeleteBoard,
  };
}
