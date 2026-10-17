import { useState, useCallback } from 'react';
import axios from 'axios';

export function useWorkspaceManagement({
  isAuthenticated,
  showNotification,
  language,
  setSelectedBoard,
  fetchBoards,
  fetchTasks,
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  const fetchWorkspaces = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve([]);
    return axios
      .get('/api/workspaces')
      .then((res) => {
        const list = res.data || [];
        setWorkspaces(list);

        if (list.length > 0) {
          const savedId = localStorage.getItem('alurku_active_workspace_id');
          const found = list.find((w) => String(w.id) === String(savedId));
          const active = found || list[0];

          setActiveWorkspace(active);
          localStorage.setItem('alurku_active_workspace_id', active.id);
          return list;
        }
        return [];
      })
      .catch((err) => {
        console.error('Error fetching workspaces:', err);
        return [];
      });
  }, [isAuthenticated]);

  const switchWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('alurku_active_workspace_id', workspace.id);

    // Hapus selected board dari workspace lama agar tidak bentrok
    localStorage.removeItem('alurku_selected_board');
    if (setSelectedBoard) setSelectedBoard(null);

    if (showNotification) {
      showNotification(
        language === 'id'
          ? `Berpindah ke workspace: ${workspace.name}`
          : `Switched to workspace: ${workspace.name}`,
        'info'
      );
    }

    // Muat ulang papan dan tugas untuk workspace yang baru
    setTimeout(() => {
      if (fetchBoards) fetchBoards();
      if (fetchTasks) fetchTasks(true);
    }, 50);
  };

  const createWorkspace = (name) => {
    if (!name.trim()) return;
    axios
      .post('/api/workspaces', { name: name.trim() })
      .then((res) => {
        if (showNotification) {
          showNotification(
            language === 'id' ? 'Workspace berhasil dibuat!' : 'Workspace created successfully!',
            'success'
          );
        }
        fetchWorkspaces().then((list) => {
          const newWs = list.find((w) => w.id === res.data.workspace.id);
          if (newWs) {
            switchWorkspace(newWs);
          }
        });
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to create workspace', 'error');
        }
      });
  };

  const renameWorkspace = (id, name) => {
    if (!name.trim()) return;
    axios
      .put(`/api/workspaces/${id}`, { name: name.trim() })
      .then(() => {
        if (showNotification) {
          showNotification(
            language === 'id' ? 'Workspace berhasil diubah namanya!' : 'Workspace renamed successfully!',
            'success'
          );
        }
        fetchWorkspaces().then((list) => {
          const updated = list.find((w) => w.id === id);
          if (updated) {
            setActiveWorkspace(updated);
          }
        });
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to rename workspace', 'error');
        }
      });
  };

  const deleteWorkspace = (id) => {
    if (!id) return Promise.reject();
    return axios
      .delete(`/api/workspaces/${id}`)
      .then((res) => {
        if (showNotification) {
          showNotification(
            res.data?.message || (language === 'id' ? 'Workspace berhasil dihapus!' : 'Workspace deleted successfully!'),
            'success'
          );
        }
        return fetchWorkspaces().then((list) => {
          if (list && list.length > 0) {
            setActiveWorkspace(list[0]);
          }
          return list;
        });
      })
      .catch((err) => {
        if (showNotification) {
          showNotification(err.response?.data?.detail || 'Failed to delete workspace', 'error');
        }
        throw err;
      });
  };

  return {
    workspaces,
    setWorkspaces,
    activeWorkspace,
    setActiveWorkspace,
    fetchWorkspaces,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    switchWorkspace,
  };
}
