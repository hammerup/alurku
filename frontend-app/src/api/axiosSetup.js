import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Setup Axios Interceptor untuk JWT Token
axios.interceptors.request.clear();
axios.interceptors.response.clear();

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('alurku_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  const workspaceId = localStorage.getItem('alurku_active_workspace_id');
  if (workspaceId) config.headers['X-Workspace-ID'] = workspaceId;
  
  return config;
});

// ---------- Silent Token Refresh Logic ----------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors that are NOT the refresh endpoint itself
    // and have not already been retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/refresh-token') &&
      !originalRequest.url?.includes('/api/login')
    ) {
      if (isRefreshing) {
        // If a refresh is already in flight, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem('alurku_token');
        if (!currentToken) {
          throw new Error('No token available');
        }

        const res = await axios.post('/api/refresh-token', null, {
          headers: { Authorization: `Bearer ${currentToken}` },
          _retry: true, // Prevent infinite loop
        });

        const newToken = res.data.token;
        localStorage.setItem('alurku_token', newToken);

        // Notify any queued requests
        processQueue(null, newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed — token is truly expired or user is invalid
        processQueue(refreshError, null);

        // Proceed with the existing logout flow
        localStorage.removeItem('alurku_auth');
        localStorage.removeItem('alurku_token');
        localStorage.removeItem('alurku_username');
        localStorage.removeItem('alurku_selected_board');
        window.dispatchEvent(new Event('auth_error'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors or already retried, just reject as normal
    return Promise.reject(error);
  }
);

/**
 * Proactively refresh the token if it's nearing expiry.
 * Call this before establishing WebSocket connections or periodically.
 * Returns the (possibly refreshed) token string.
 */
export async function ensureFreshToken() {
  const token = localStorage.getItem('alurku_token');
  if (!token) return null;

  try {
    // Decode JWT payload (no verification needed on client side)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to ms
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // If token expires in less than 7 days, proactively refresh
    if (exp - now < sevenDaysMs) {
      const res = await axios.post('/api/refresh-token');
      const newToken = res.data.token;
      localStorage.setItem('alurku_token', newToken);
      return newToken;
    }

    return token;
  } catch {
    // If anything fails, return existing token and let the normal flow handle it
    return token;
  }
}

export default axios;
