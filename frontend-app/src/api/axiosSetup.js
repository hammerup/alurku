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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('alurku_auth');
      localStorage.removeItem('alurku_token');
      localStorage.removeItem('alurku_username');
      localStorage.removeItem('alurku_selected_board');
      window.dispatchEvent(new Event('auth_error')); // Mencegah infinite reload loop
    }
    return Promise.reject(error);
  }
);

export default axios;
