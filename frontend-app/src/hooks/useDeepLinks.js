import { useEffect, useRef } from 'react';

const slugify = (text) => text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';

export function useDeepLinks({ isAuthenticated, boards, setSelectedBoard, currentUser, showNotification, handleNotificationTaskClick, tMsg }) {
  const deepLinkProcessedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !deepLinkProcessedRef.current && boards.length > 0) {
      deepLinkProcessedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      let taskIdParam = params.get('task');
      const path = window.location.pathname;

      if (path.startsWith('/task/')) {
        taskIdParam = path.replace('/task/', '');
      }

      // Format path: /workspace/:workspaceName/:workspaceId/project/:projectName/:projectId
      const parts = path.split('/');
      let boardIdParam = null;
      if (path.includes('/project/')) {
        if (parts[5] === 'overall-project' || parts[5] === 'todo-list') {
          boardIdParam = parts[5];
        } else {
          boardIdParam = parts[6]; // Grabs the project ID
        }
      }

      if (taskIdParam) {
        const taskId = parseInt(taskIdParam.split('-')[0], 10);
        if (!isNaN(taskId) && handleNotificationTaskClick) handleNotificationTaskClick(taskId);
        const url = new URL(window.location);
        url.searchParams.delete('task');
        if (!path.includes('/project/')) {
          url.pathname = '/dashboard';
        }
        window.history.pushState({}, '', url);
      } else if (boardIdParam) {
        if (boardIdParam === 'overall-project') {
          setSelectedBoard({
            id: 'global',
            name: tMsg ? tMsg('See the Big Picture', 'Lihat Gambaran Besar') : 'See the Big Picture',
            owner_username: currentUser,
            role: 'owner',
            isVirtual: true,
          });
        } else if (boardIdParam === 'todo-list') {
          const todoBoard = boards.find((b) => b.name.toLowerCase() === 'to-do list' && b.is_private);
          if (todoBoard) {
            setSelectedBoard(todoBoard);
          }
        } else {
          const boardId = parseInt(boardIdParam, 10);
          const targetBoard = !isNaN(boardId) ? boards.find((b) => b.id === boardId) : null;
          
          if (targetBoard) {
            setSelectedBoard(targetBoard);
          } else {
            if (showNotification) {
              showNotification(
                tMsg ? tMsg('Project not found or access denied.', 'Proyek tidak ditemukan atau akses ditolak.') : 'Project not found or access denied.',
                'error'
              );
            }
          }
        }
        const url = new URL(window.location);
        if (url.searchParams.has('board')) {
          url.searchParams.delete('board');
          window.history.pushState({}, '', url);
        }
      }
    }
  }, [isAuthenticated, boards, setSelectedBoard, currentUser, showNotification, handleNotificationTaskClick, tMsg]);
}
