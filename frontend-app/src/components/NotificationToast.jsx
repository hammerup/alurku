/**
 * NotificationToast.jsx
 * ─────────────────────────────────────────────────────────────────
 * Industry-standard multi-slot toast notification system for alurku.
 *
 * Features:
 *  - 5 semantic types: success, error, warning, info, ai
 *  - Inline SVG icons (zero emoji)
 *  - Progress bar countdown per toast
 *  - Stack support (up to 3 active simultaneously)
 *  - Slide-in animation based on position (right/left/top/bottom)
 *  - Pause on hover (timer suspends)
 *  - ARIA: role="status", aria-live="polite" for screen readers
 *  - Privacy mode: mask content for sensitive environments
 *  - Optional action button per toast
 *  - Bidirectional: consumed via notificationQueue from useAppLogic
 *  - Backward-compatible: exports as NotificationModal alias
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Type Configuration ───────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    duration: 3000,
    bgLight: 'bg-white',
    bgDark: 'dark:bg-[#121B2D]',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    progress: 'bg-emerald-500',
    label: { en: 'Success', id: 'Berhasil' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    duration: 6000,
    bgLight: 'bg-white',
    bgDark: 'dark:bg-[#121B2D]',
    border: 'border-red-200 dark:border-red-800/60',
    iconBg: 'bg-red-50 dark:bg-red-950/50',
    iconColor: 'text-red-600 dark:text-red-400',
    progress: 'bg-red-500',
    label: { en: 'Error', id: 'Kesalahan' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    duration: 5000,
    bgLight: 'bg-white',
    bgDark: 'dark:bg-[#121B2D]',
    border: 'border-amber-200 dark:border-amber-800/60',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    progress: 'bg-amber-500',
    label: { en: 'Warning', id: 'Peringatan' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    duration: 3500,
    bgLight: 'bg-white',
    bgDark: 'dark:bg-[#121B2D]',
    border: 'border-blue-200 dark:border-blue-800/60',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    progress: 'bg-blue-500',
    label: { en: 'Notice', id: 'Pemberitahuan' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
  ai: {
    duration: 4000,
    bgLight: 'bg-[#111E38]',
    bgDark: 'dark:bg-[#111E38]',
    border: 'border-[#FACC15]/40',
    iconBg: 'bg-[#FACC15]/20',
    iconColor: 'text-[#FACC15]',
    progress: 'bg-[#FACC15]',
    label: { en: 'AI Insight', id: 'Wawasan AI' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
};

// ─── Position Mapping ─────────────────────────────────────────────
// Industry standard: all notifications are corner/edge toasts.
// `center` full-screen overlay is removed — modern SaaS (Linear, Vercel,
// GitHub, Notion) universally uses edge toasts for non-blocking UX.
//
// Per user decision:
//   • type="error"  → always rendered at top-center (critical, demands attention)
//   • all others    → rendered at user-configured notifPosition (default bottom-right)
const POSITION_CLASSES = {
  'top-left':     'top-4 left-4',
  'top-center':   'top-4 left-1/2 -translate-x-1/2',
  'top-right':    'top-4 right-4',
  'bottom-left':  'bottom-4 left-4',
  'bottom-center':'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

const SLIDE_ANIMATION = {
  'top-left':     'toast-slide-left',
  'top-center':   'toast-slide-down',
  'top-right':    'toast-slide-right',
  'bottom-left':  'toast-slide-left',
  'bottom-center':'toast-slide-up',
  'bottom-right': 'toast-slide-right',
};

// Resolve effective position: errors are always top-center
const resolvePosition = (type, notifPosition) =>
  type === 'error' ? 'top-center' : (POSITION_CLASSES[notifPosition] ? notifPosition : 'bottom-right');


// ─── Single Toast Item ────────────────────────────────────────────
function ToastItem({ toast, position, language, notifPrivacy, onDismiss }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const duration = toast.duration ?? cfg.duration;

  const [progressPct, setProgressPct] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const isPausedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(duration);
  const rafRef = useRef(null);

  const tMsg = useCallback((en, id) => (language === 'id' ? id : en), [language]);

  const triggerDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  // Chime sound
  useEffect(() => {
    if (toast.sound !== false) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        const freq = toast.type === 'error' ? 440 : toast.type === 'warning' ? 550 : 880;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (_) {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Progress countdown via requestAnimationFrame
  useEffect(() => {
    startTimeRef.current = Date.now();

    const tick = () => {
      if (isPausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = remainingRef.current - elapsed;
      const pct = Math.max(0, (remaining / duration) * 100);
      setProgressPct(pct);
      if (pct <= 0) {
        triggerDismiss();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, triggerDismiss]);

  const handleMouseEnter = () => {
    isPausedRef.current = true;
    remainingRef.current = remainingRef.current - (Date.now() - startTimeRef.current);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    isPausedRef.current = false;
  };

  // Privacy mask
  const displayMessage =
    notifPrivacy && toast.type !== 'error' && toast.type !== 'success'
      ? tMsg('You have a new notification.', 'Anda memiliki notifikasi baru.')
      : (toast.message || '').replace(/(?:<!--|&lt;!--)?\s*TASK_ID:\d+\s*(?:-->|--&gt;)?/gi, '');

  const isAI = toast.type === 'ai';
  const slideAnim = SLIDE_ANIMATION[position] || 'toast-slide-right';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative w-80 ${cfg.bgLight} ${cfg.bgDark} border ${cfg.border}
        rounded-2xl shadow-lg overflow-hidden
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 scale-95 translate-y-1' : `opacity-100 scale-100 ${slideAnim}`}
      `}
      style={{ animation: isExiting ? 'none' : undefined }}
    >
      {/* Main content row */}
      <div className="flex items-start gap-3 p-4 pr-3">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`text-[11px] font-black uppercase tracking-widest mb-0.5 ${isAI ? 'text-[#FACC15]' : 'text-slate-900 dark:text-slate-100'}`}>
            {tMsg(cfg.label.en, cfg.label.id)}
          </p>
          <p className={`text-xs leading-relaxed break-words ${isAI ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
            {displayMessage}
          </p>

          {/* Optional action button */}
          {toast.action && (
            <button
              type="button"
              onClick={() => { toast.action.onClick?.(); triggerDismiss(); }}
              className={`mt-2 text-[11px] font-bold underline underline-offset-2 ${isAI ? 'text-[#FACC15]' : 'text-blue-600 dark:text-blue-400'} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={triggerDismiss}
          aria-label="Dismiss notification"
          className={`shrink-0 p-1 rounded-lg transition-colors cursor-pointer ${
            isAI
              ? 'text-[#FACC15]/60 hover:text-[#FACC15] hover:bg-[#FACC15]/10'
              : 'text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-neutral-100 dark:bg-neutral-800/60">
        <div
          className={`h-full ${cfg.progress} transition-none rounded-full`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Toast Stack (single position group) ─────────────────────────
function ToastStack({ toasts, position, language, notifPrivacy, onDismiss }) {
  if (toasts.length === 0) return null;

  const pos = POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right'];
  const isTopPos = position.startsWith('top');
  const flexDir = isTopPos ? 'flex-col' : 'flex-col-reverse';
  const visible = toasts.slice(-3);
  const ordered = isTopPos ? [...visible].reverse() : visible;

  return (
    <div
      className={`fixed ${pos} z-[9999] flex ${flexDir} gap-2 pointer-events-none`}
      aria-label={`${position} notifications`}
    >
      {ordered.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            toast={toast}
            position={position}
            language={language}
            notifPrivacy={notifPrivacy}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Toast Container — Dual Stack ────────────────────────────────
// Renders two independent stacks:
//   1. Error stack  → always top-center (critical, high visibility)
//   2. General stack → user-configured position (default: bottom-right)
export default function NotificationToast({
  // New multi-queue API
  toastQueue = [],
  onDismissToast,
  // Legacy single-notification API (backward compat)
  notification,
  setNotification,
  // Shared settings
  language,
  notifPosition = 'bottom-right',
  notifPrivacy = false,
}) {
  // ── Normalize: support both legacy single and new queue mode ──
  const [legacyQueue, setLegacyQueue] = useState([]);

  useEffect(() => {
    if (notification) {
      setLegacyQueue([{ ...notification }]);
    } else {
      setLegacyQueue([]);
    }
  }, [notification]);

  const activeQueue = toastQueue.length > 0 ? toastQueue : legacyQueue;

  const handleDismiss = useCallback((id) => {
    if (onDismissToast) {
      onDismissToast(id);
    } else if (setNotification) {
      setNotification(null);
    }
    setLegacyQueue([]);
  }, [onDismissToast, setNotification]);

  if (activeQueue.length === 0) return null;

  // ── Split into two groups by resolved position ──
  const safePos = POSITION_CLASSES[notifPosition] ? notifPosition : 'bottom-right';

  // Error toasts always go to top-center
  const errorToasts = activeQueue.filter((t) => t.type === 'error');
  // All other toasts go to the user-configured position
  // If user-configured position IS top-center, also merge errors there (no duplicate)
  const generalToasts = activeQueue.filter((t) => t.type !== 'error');

  // If configured position is also top-center, merge both groups there
  const mergedAtTopCenter = safePos === 'top-center';

  return (
    <>
      {/* Error stack — top-center (always) */}
      {!mergedAtTopCenter && (
        <ToastStack
          toasts={errorToasts}
          position="top-center"
          language={language}
          notifPrivacy={notifPrivacy}
          onDismiss={handleDismiss}
        />
      )}

      {/* General stack — user-configured position */}
      <ToastStack
        toasts={mergedAtTopCenter ? activeQueue : generalToasts}
        position={safePos}
        language={language}
        notifPrivacy={notifPrivacy}
        onDismiss={handleDismiss}
      />
    </>
  );
}

// ── Backward-compatible named export alias ──────────────────────
export { NotificationToast as NotificationModal };

