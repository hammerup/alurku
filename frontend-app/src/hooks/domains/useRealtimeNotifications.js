import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export function useRealtimeNotifications({
  isAuthenticated,
  currentUser,
  language,
  selectedBoard,
  fetchTasks,
  fetchBoards,
  setSelectedTask,
  setPreviewTask,
  setIsNotifOpen,
  inboxChats,
  getInboxChats,
  fetchDmConversations,
  fetchInboxChats,
}) {
  const [notification, setNotification] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('alurku_notify');
      if (saved) {
        sessionStorage.removeItem('alurku_notify');
        return { ...JSON.parse(saved), id: Date.now() };
      }
    }
    return null;
  });

  const [notifications, setNotifications] = useState([]);
  const [isNotifClosing, setIsNotifClosing] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);

  const [notifPosition, setNotifPosition] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_notif_pos') || 'bottom-right';
    return 'bottom-right';
  });
  const [notifSound, setNotifSound] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_notif_sound') !== 'false';
    return true;
  });
  const [notifPrivacy, setNotifPrivacy] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_notif_privacy') === 'true';
    return false;
  });
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_browser_notif') === 'true';
    return false;
  });

  const lastNotifIdRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== id));
    setNotification((prev) => (prev && prev.id === id ? null : prev));
  }, []);

  const showNotification = useCallback((message, type = 'info', opts = {}) => {
    let safeMessage = message;
    if (message && typeof message !== 'string') {
      try {
        safeMessage = JSON.stringify(message);
      } catch (e) {
        safeMessage = 'An unexpected error occurred.';
      }
    }
    const id = Date.now();
    const toast = { id, message: safeMessage, type, ...opts };

    setNotification(toast);
    setToastQueue((prev) => [...prev.slice(-2), toast]);
  }, []);

  useEffect(() => {
    const handleNotificationEvent = (e) => {
      if (e.detail && e.detail.message) {
        showNotification(e.detail.message, e.detail.type || 'info');
      }
    };
    window.addEventListener('show-notification', handleNotificationEvent);
    return () => window.removeEventListener('show-notification', handleNotificationEvent);
  }, [showNotification]);

  useEffect(() => {
    if (sessionStorage.getItem('alurku_trial_signup')) {
      sessionStorage.removeItem('alurku_trial_signup');
      setTimeout(() => {
        showNotification(
          language === 'id'
            ? 'Akun Uji Coba Berhasil Dibuat! Cek email Anda untuk mengatur kata sandi.'
            : 'Trial Account Created! Please check your email to set your password.',
          'success'
        );
      }, 1000);
    }
  }, [language, showNotification]);

  const fetchNotifications = useCallback(() => {
    if (!isAuthenticated) return;
    axios
      .get('/api/notifications')
      .then((res) => setNotifications(res.data.notifications || []))
      .catch((err) => {
        if (err.response?.status !== 401) console.error(err);
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (notifications.length > 0) {
      const maxId = Math.max(...notifications.map((n) => n.id));
      if (lastNotifIdRef.current === null) {
        lastNotifIdRef.current = maxId;
      } else if (maxId > lastNotifIdRef.current) {
        const newNotifs = notifications.filter((n) => n.id > lastNotifIdRef.current && !n.is_read);
        if (newNotifs.length > 0) {
          const singleMsg = newNotifs[0].message.replace(/(?:<!--|&lt;!--)\s*TASK_ID:\d+\s*(?:-->|--&gt;)/gi, '');
          const multiMsg =
            language === 'id'
              ? `Kamu memiliki ${newNotifs.length} notifikasi aktivitas baru.`
              : `You have ${newNotifs.length} new activity notifications.`;
          const displayMsg = newNotifs.length === 1 ? singleMsg : multiMsg;

          if (browserNotifEnabled && typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              try {
                new Notification('alurku.', {
                  body: displayMsg,
                  icon: '/icon-192.png',
                });
              } catch (e) {
                console.error('Error triggering browser notification:', e);
              }
            }
          }
          if (selectedBoard && fetchTasks) fetchTasks();
          if (fetchBoards) fetchBoards();
        }
        lastNotifIdRef.current = maxId;
      }
    }
  }, [notifications, browserNotifEnabled, language, selectedBoard, fetchTasks, fetchBoards]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) alurku.`;
    } else {
      document.title = 'alurku. | Task & Project Management';
    }
  }, [unreadCount, isAuthenticated]);

  const closeNotif = () => {
    setIsNotifClosing(true);
    setTimeout(() => {
      if (setIsNotifOpen) setIsNotifOpen(false);
      setIsNotifClosing(false);
    }, 200);
  };

  const handleReadNotification = (id) => {
    axios.put(`/api/notifications/${id}/read`).then(fetchNotifications).catch(console.error);
  };

  const handleDeleteNotification = (id) => {
    axios.delete(`/api/notifications/${id}`).then(fetchNotifications).catch(console.error);
  };

  const handleMarkAllInboxAsRead = async () => {
    try {
      await axios.put('/api/notifications/read_all');
      fetchNotifications();

      await axios.put('/api/dm/read-all');
      if (fetchDmConversations) fetchDmConversations();

      const chats = typeof getInboxChats === 'function' ? getInboxChats() : (inboxChats || []);
      (chats || []).forEach((chat) => {
        if (chat.latest_sender === currentUser) return;
        if (chat.is_dm) return;
        if (chat.is_project_chat) {
          localStorage.setItem(`alurku_last_read_board_${chat.board_id}_${currentUser}`, chat.timestamp);
        } else {
          localStorage.setItem(`alurku_last_read_task_${chat.task_id}_${currentUser}`, chat.timestamp);
        }
      });

      if (fetchInboxChats) fetchInboxChats();
    } catch (err) {
      console.error('Error marking all inbox chats as read:', err);
    }
  };

  const handleReadAllNotifications = () => {
    handleMarkAllInboxAsRead();
  };

  const handleNotificationTaskClick = (taskId) => {
    axios
      .get(`/api/tasks/${taskId}`)
      .then((res) => {
        const task = res.data?.task;
        if (!task) return;
        if (setSelectedTask) setSelectedTask(task);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          axios
            .get(`/api/tasks/preview/${taskId}`)
            .then((res) => {
              if (setPreviewTask) setPreviewTask(res.data.task);
            })
            .catch((err2) => {
              showNotification(err2.response?.data?.detail || 'Task not found or access denied', 'error');
            });
        } else {
          showNotification(err.response?.data?.detail || 'Task not found or access denied', 'error');
        }
      });
  };

  return {
    notification,
    setNotification,
    notifications,
    setNotifications,
    isNotifClosing,
    setIsNotifClosing,
    toastQueue,
    unreadCount,
    notifPosition,
    setNotifPosition,
    notifSound,
    setNotifSound,
    notifPrivacy,
    setNotifPrivacy,
    browserNotifEnabled,
    setBrowserNotifEnabled,
    dismissToast,
    showNotification,
    fetchNotifications,
    closeNotif,
    handleReadNotification,
    handleDeleteNotification,
    handleReadAllNotifications,
    handleMarkAllInboxAsRead,
    handleNotificationTaskClick,
  };
}
