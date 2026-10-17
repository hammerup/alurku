import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

export function useAuthSession({
  showNotification,
  setIsLoading,
  language,
  tMsg,
  setSelectedBoard,
  setIsLogoutConfirmOpen,
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('token')) {
      localStorage.removeItem('alurku_auth');
      localStorage.removeItem('alurku_token');
      localStorage.removeItem('alurku_username');
      return false;
    }
    return localStorage.getItem('alurku_auth') === 'true';
  });

  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('token')) return '';
    return localStorage.getItem('alurku_username') || '';
  });

  const [isLoginMode, setIsLoginMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/daftar') return false;
    }
    return true;
  });

  const [showAuthForm, setShowAuthForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      if (
        params.get('token') ||
        params.get('verify') ||
        params.get('task') ||
        params.get('board') ||
        path.startsWith('/task/') ||
        path.startsWith('/project/') ||
        ['/masuk', '/daftar', '/lupa-sandi'].includes(path)
      )
        return true;
    }
    return false;
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountStatus, setAccountStatus] = useState('active');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Hitung mundur lockout timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setLoginError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const [resetToken, setResetToken] = useState(() => {
    if (typeof window !== 'undefined') return new URLSearchParams(window.location.search).get('token');
    return null;
  });
  const [isResetMode, setIsResetMode] = useState(!!resetToken);
  const [isForgotMode, setIsForgotMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/lupa-sandi') return true;
    }
    return false;
  });
  const [forgotEmail, setForgotEmail] = useState('');

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (setIsLoading) setIsLoading(true);
      axios
        .post('/api/google-login', { token: tokenResponse.access_token }, { timeout: 30000 })
        .then((res) => {
          localStorage.setItem('alurku_auth', 'true');
          localStorage.setItem('alurku_token', res.data.token);
          localStorage.setItem('alurku_username', res.data.username);
          sessionStorage.setItem('alurku_just_logged_in', 'true');
          window.location.href = '/';
        })
        .catch((err) => {
          if (setIsLoading) setIsLoading(false);
          if (showNotification) {
            showNotification(
              err.response?.data?.detail || (language === 'id' ? 'Gagal masuk dengan Google.' : 'Google Login failed.'),
              'error'
            );
          }
        });
    },
    onError: () => {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Masuk dengan Google dibatalkan.' : 'Google Login failed or cancelled.',
          'error'
        );
      }
    },
  });

  const handleLogout = () => {
    if (setIsLogoutConfirmOpen) setIsLogoutConfirmOpen(false);
    if (setIsLoading) setIsLoading(true);
    window.isLoggingOut = true;

    setShowAuthForm(false);
    setIsAuthenticated(false);
    setCurrentUser('');
    if (setSelectedBoard) setSelectedBoard(null);

    setTimeout(() => {
      localStorage.removeItem('alurku_auth');
      localStorage.removeItem('alurku_token');
      localStorage.removeItem('alurku_username');
      localStorage.removeItem('alurku_selected_board');
      localStorage.removeItem('alurku_proactive_ai_open');
      localStorage.removeItem('alurku_docs_open');
      localStorage.removeItem('alurku_chat_ws_open');
      localStorage.removeItem('alurku_changelog_open');

      window.location.href = '/';
    }, 1000);
  };

  const handleLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Nama pengguna dan kata sandi wajib diisi!' : 'Username and Password are required!',
          'error'
        );
      }
      return;
    }
    if (setIsLoading) setIsLoading(true);

    axios
      .post('/api/login', { username: loginUsername.trim(), password: loginPassword }, { timeout: 30000 })
      .then((res) => {
        setLoginError(null);
        setLockoutRemaining(0);
        localStorage.setItem('alurku_auth', 'true');
        localStorage.setItem('alurku_token', res.data.token);
        localStorage.setItem('alurku_username', loginUsername.trim());

        sessionStorage.setItem('alurku_just_logged_in', 'true');
        window.location.href = '/';
      })
      .catch((err) => {
        if (setIsLoading) setIsLoading(false);
        const detail = err.response?.data?.detail;
        let errorMsg = language === 'id' ? 'Nama pengguna atau kata sandi salah!' : 'Invalid username or password!';

        if (detail && typeof detail === 'object') {
          if (detail.lockout) {
            setLockoutRemaining(detail.remaining_seconds || 900);
            setLoginError({
              type: 'lockout',
              remainingSeconds: detail.remaining_seconds || 900,
              remainingMinutes: detail.remaining_minutes || 15,
            });
            errorMsg =
              language === 'id'
                ? `Terlalu banyak percobaan gagal. Akun dikunci selama ${detail.remaining_minutes || 15} menit.`
                : `Too many failed attempts. Account locked for ${detail.remaining_minutes || 15} minutes.`;
          } else if (typeof detail.remaining_attempts === 'number') {
            setLoginError({
              type: 'wrong_password',
              remainingAttempts: detail.remaining_attempts,
            });
            errorMsg =
              language === 'id'
                ? `Kata sandi salah. Sisa percobaan: ${detail.remaining_attempts} kali sebelum akun dikunci.`
                : `Incorrect password. Remaining attempts: ${detail.remaining_attempts} before account lockout.`;
          } else if (detail.message) {
            errorMsg = detail.message;
          }
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (err.response?.data) {
          errorMsg = typeof err.response.data === 'string' ? `Server Error: ${err.response.data}` : 'Server Error';
        } else if (err.message) {
          errorMsg = `Connection Error: ${err.message}. Is the backend running?`;
        }
        if (showNotification) showNotification(errorMsg, 'error');
      });
  };

  const handleRegister = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim() || !regFullName.trim() || !regEmail.trim()) {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Semua kolom formulir wajib diisi!' : 'All form fields are required!',
          'error'
        );
      }
      return;
    }
    if (loginPassword !== regConfirmPassword) {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Konfirmasi kata sandi tidak cocok!' : 'Passwords do not match!',
          'error'
        );
      }
      return;
    }
    if (setIsLoading) setIsLoading(true);

    axios
      .post(
        '/api/register',
        {
          full_name: regFullName.trim(),
          email: regEmail.trim(),
          username: loginUsername.trim(),
          password: loginPassword,
        },
        { timeout: 30000 }
      )
      .then(() => {
        setTimeout(() => {
          if (setIsLoading) setIsLoading(false);
          if (showNotification) {
            showNotification(
              language === 'id'
                ? 'Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi akun sebelum masuk.'
                : 'Registration successful! Please check your email to verify your account before logging in.',
              'success'
            );
          }
          setIsLoginMode(true);
          setLoginPassword('');
          setRegConfirmPassword('');
        }, 800);
      })
      .catch((err) => {
        setTimeout(() => {
          if (setIsLoading) setIsLoading(false);
          let errorMsg = language === 'id' ? 'Pendaftaran gagal!' : 'Registration failed!';
          if (err.response?.data?.detail) {
            errorMsg =
              typeof err.response.data.detail === 'string'
                ? err.response.data.detail
                : language === 'id'
                ? 'Validasi gagal, silakan periksa data input kamu.'
                : 'Validation error, please check your input.';
          } else if (err.response?.data) {
            errorMsg =
              typeof err.response.data === 'string'
                ? err.response.data
                : language === 'id'
                ? 'Terjadi kesalahan sistem.'
                : 'Server Error';
          } else if (err.message) {
            errorMsg = language === 'id' ? 'Gagal terhubung ke server.' : `Connection Error: ${err.message}`;
          }
          if (showNotification) showNotification(errorMsg, 'error');
        }, 500);
      });
  };

  const handleForgotPassword = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!forgotEmail.trim()) {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Silakan masukkan alamat email kamu.' : 'Please enter your email.',
          'error'
        );
      }
      return;
    }
    if (setIsLoading) setIsLoading(true);

    axios
      .post('/api/forgot-password', { email: forgotEmail.trim(), origin: window.location.origin }, { timeout: 30000 })
      .then(() => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) {
          showNotification(
            language === 'id'
              ? 'Tautan atur ulang kata sandi telah dikirim ke email kamu jika terdaftar.'
              : 'If your email is registered, a password reset link has been sent.',
            'success'
          );
        }
        setIsForgotMode(false);
        setForgotEmail('');
      })
      .catch(() => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) {
          showNotification(
            language === 'id' ? 'Gagal mengirim tautan atur ulang kata sandi.' : 'Failed to send reset link.',
            'error'
          );
        }
      });
  };

  const handleResetPassword = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loginPassword !== regConfirmPassword) {
      if (showNotification) {
        showNotification(
          language === 'id' ? 'Konfirmasi kata sandi tidak cocok!' : 'Passwords do not match!',
          'error'
        );
      }
      return;
    }
    if (setIsLoading) setIsLoading(true);

    axios
      .post('/api/reset-password', { token: resetToken, new_password: loginPassword }, { timeout: 30000 })
      .then(() => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) {
          showNotification(
            language === 'id'
              ? 'Kata sandi berhasil diperbarui! Kamu sudah bisa masuk sekarang.'
              : 'Password successfully reset! You can now login.',
            'success'
          );
        }
        setIsResetMode(false);
        setResetToken(null);
        setLoginPassword('');
        setRegConfirmPassword('');

        const url = new URL(window.location);
        url.searchParams.delete('token');
        window.history.pushState({}, '', url);
      })
      .catch((err) => {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) {
          showNotification(
            err.response?.data?.detail ||
              (language === 'id' ? 'Token tidak valid atau telah kedaluwarsa.' : 'Invalid or expired token.'),
            'error'
          );
        }
      });
  };

  useEffect(() => {
    const sessionExpired = sessionStorage.getItem('alurku_session_expired');
    if (sessionExpired) {
      sessionStorage.removeItem('alurku_session_expired');
      if (showNotification) showNotification('Session expired. Please login again.', 'error');
    }
  }, []);

  useEffect(() => {
    const handleAuthError = () => {
      if (window.isLoggingOut) return;

      localStorage.removeItem('alurku_auth');
      localStorage.removeItem('alurku_token');
      localStorage.removeItem('alurku_username');
      localStorage.removeItem('alurku_selected_board');
      localStorage.removeItem('alurku_proactive_ai_open');
      localStorage.removeItem('alurku_docs_open');
      localStorage.removeItem('alurku_chat_ws_open');
      localStorage.removeItem('alurku_changelog_open');

      sessionStorage.setItem('alurku_session_expired', 'true');
      window.location.href = '/';
    };
    window.addEventListener('auth_error', handleAuthError);
    return () => {
      window.removeEventListener('auth_error', handleAuthError);
    };
  }, []);

  return {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    isLoginMode,
    setIsLoginMode,
    showAuthForm,
    setShowAuthForm,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginError,
    setLoginError,
    lockoutRemaining,
    regFullName,
    setRegFullName,
    regEmail,
    setRegEmail,
    regConfirmPassword,
    setRegConfirmPassword,
    resetToken,
    setResetToken,
    isResetMode,
    setIsResetMode,
    isForgotMode,
    setIsForgotMode,
    forgotEmail,
    setForgotEmail,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    accountStatus,
    setAccountStatus,
    isSuperAdmin,
    setIsSuperAdmin,
    loginWithGoogle,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleResetPassword,
    handleLogout,
    isAuthenticatedRef,
  };
}
