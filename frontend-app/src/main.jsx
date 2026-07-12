// Shadow localStorage for alurku_auth, alurku_token, alurku_username if Remember Me is unchecked
(() => {
  if (typeof window !== 'undefined') {
    const originalGet = localStorage.getItem.bind(localStorage);
    const originalSet = localStorage.setItem.bind(localStorage);
    const originalRemove = localStorage.removeItem.bind(localStorage);

    const AUTH_KEYS = ['alurku_auth', 'alurku_token', 'alurku_username'];

    localStorage.getItem = function(key) {
      if (AUTH_KEYS.includes(key)) {
        const rememberMe = originalGet('alurku_remember_me') || sessionStorage.getItem('alurku_remember_me');
        if (rememberMe === 'false') {
          return sessionStorage.getItem(key);
        }
      }
      return originalGet(key);
    };

    localStorage.setItem = function(key, value) {
      if (AUTH_KEYS.includes(key)) {
        const rememberMe = originalGet('alurku_remember_me') || sessionStorage.getItem('alurku_remember_me');
        if (rememberMe === 'false') {
          return sessionStorage.setItem(key, value);
        }
      }
      return originalSet(key, value);
    };

    localStorage.removeItem = function(key) {
      if (AUTH_KEYS.includes(key)) {
        sessionStorage.removeItem(key);
      }
      return originalRemove(key);
    };
  }
})();

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './contexts/AppContext';

// Membungkam peringatan palsu dari @hello-pangea/dnd terkait Orthogonal Scroll di Kanban Board
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('unsupported nested scroll container detected')) {
    return;
  }
  originalWarn(...args);
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
