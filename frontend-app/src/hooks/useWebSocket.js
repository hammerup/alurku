import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export function useWebSocket(workspaceId, token, currentUser) {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activityFeed, setActivityFeed] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(1000); // Start with 1s

  // Fetch initial activity logs via REST & set up 15s polling fallback
  useEffect(() => {
    if (!workspaceId) return;

    const fetchLatestActivities = () => {
      axios
        .get(`/api/workspaces/${workspaceId}/activity?limit=10`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setActivityFeed(res.data.slice(0, 10));
          }
        })
        .catch((err) => {
          console.error('Error fetching activity log:', err);
        });
    };

    fetchLatestActivities();
    const interval = setInterval(fetchLatestActivities, 15000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || !token) return;

    function connect() {
      // Clean up existing socket
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Build WebSocket URL
      let wsBase;
      const apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl) {
        if (apiUrl.startsWith('https://')) {
          wsBase = apiUrl.replace('https://', 'wss://').replace(/\/api$/, '').replace(/\/api\/$/, '');
        } else if (apiUrl.startsWith('http://')) {
          wsBase = apiUrl.replace('http://', 'ws://').replace(/\/api$/, '').replace(/\/api\/$/, '');
        } else {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          wsBase = `${protocol}//${window.location.host}${apiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '')}`;
        }
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsBase = `${protocol}//${window.location.host}`;
      }
      const wsUrl = `${wsBase}/ws/workspace/${workspaceId}?token=${encodeURIComponent(token)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectDelayRef.current = 1000; // Reset reconnect delay on success
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'online_users_list') {
            setOnlineUsers(new Set(data.users || []));
          } else if (data.type === 'user_online') {
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.add(data.username);
              return next;
            });
          } else if (data.type === 'user_offline') {
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.delete(data.username);
              return next;
            });
          } else if (data.type === 'activity') {
            setActivityFeed((prev) => {
              const newFeed = [
                {
                  id: data.id || Date.now(),
                  username: data.username,
                  action: data.action,
                  target_title: data.target_title,
                  extra_data: data.extra_data || {},
                  created_at: data.timestamp,
                },
                ...prev.filter((item) => item.id !== data.id),
              ];
              return newFeed.slice(0, 10);
            });
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onclose = (e) => {
        setIsConnected(false);
        wsRef.current = null;
        
        // Auto-reconnect with exponential backoff if not closed cleanly/manually
        if (e.code !== 1000 && e.code !== 1001) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
            connect();
          }, reconnectDelayRef.current);
        }
      };

      ws.onerror = (err) => {
        console.error('WS Error:', err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [workspaceId, token]);

  return {
    onlineUsers,
    activityFeed,
    isConnected,
  };
}
