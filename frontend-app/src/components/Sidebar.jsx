import { useMemo, useEffect, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Avatar, IconPlus } from '../SharedUI';
import UpgradeModal from './UpgradeModal';

// Modern inline SVG icons conforming to alurku. Brand Book & Flat Design
const IconHome = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const IconTasks = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconFolderCopy = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
  </svg>
);

const IconDashboard = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const IconHelp = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const IconPersonAdd = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75h-3m1.5-1.5v3" />
  </svg>
);

const IconUpgrade = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);


const IconChevronLeft = ({ className = 'w-4 h-4', style }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const IconChevronDown = ({ className = 'w-4 h-4', style }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const IconStar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const IconStarOutline = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconMoreVert = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const IconArchive = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const IconTrash = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const IconChatBubble = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.84-.962 4.024 4.024 0 00.32-1.39A8.064 8.064 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const IconInbox = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.375V19.5A2.25 2.25 0 004.5 21.75h15a2.25 2.25 0 002.25-2.25v-5.625M3.75 6.75h16.5M3.75 10.5h16.5" />
  </svg>
);

const IconCalendar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const IconPersonCheck = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632zm13.999-5.368l2.25 2.25 4.5-4.5" />
  </svg>
);

const IconWarning = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const IconLayers = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.321 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25M12 3.75L2.25 9 12 14.25 21.75 9 12 3.75z" />
  </svg>
);

const IconDoc = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconExplore = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 9.172l-1.414 4.243-4.242 1.414 1.414-4.243 4.242-1.414z" />
  </svg>
);

const IconTicket = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
  </svg>
);

const IconBookmark = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const IconBookmarkAdd = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v6m3-3H9" />
  </svg>
);

const IconClose = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconCheckCircle = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconSave = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const IconKanban = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5v15m7.5-15v10.5m7.5-10.5v6" />
  </svg>
);

const IconList = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const IconTimeline = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IconFlag = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.779V4.875l-3.114.779a9 9 0 01-6.086-.71l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
  </svg>
);

const IconBolt = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const IconAnalytics = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IconSparkles = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const IconDragHandle = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);

const renderDynamicIcon = (iconName, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'bookmark':
    case 'bookmark_add':
      return <IconBookmark className={className} />;
    case 'view_kanban':
      return <IconKanban className={className} />;
    case 'view_list':
      return <IconList className={className} />;
    case 'timeline':
      return <IconTimeline className={className} />;
    case 'calendar_month':
    case 'today':
    case 'date_range':
    case 'event_available':
      return <IconCalendar className={className} />;
    case 'task_alt':
    case 'check_circle':
    case 'add_task':
      return <IconTasks className={className} />;
    case 'flag':
      return <IconFlag className={className} />;
    case 'star':
    case 'star_border':
    case 'star_half':
      return <IconStar className={className} />;
    case 'bolt':
      return <IconBolt className={className} />;
    case 'folder':
    case 'folder_special':
    case 'folder_copy':
    case 'create_new_folder':
      return <IconFolderCopy className={className} />;
    case 'insights':
    case 'analytics':
      return <IconAnalytics className={className} />;
    case 'inbox':
      return <IconInbox className={className} />;
    case 'person_check':
      return <IconPersonCheck className={className} />;
    case 'person_add':
      return <IconPersonAdd className={className} />;
    case 'warning':
      return <IconWarning className={className} />;
    case 'home':
      return <IconHome className={className} />;
    case 'dashboard':
      return <IconDashboard className={className} />;
    case 'confirmation_number':
      return <IconTicket className={className} />;
    case 'help':
      return <IconHelp className={className} />;
    case 'description':
      return <IconDoc className={className} />;
    case 'explore':
      return <IconExplore className={className} />;
    case 'chat':
      return <IconChatBubble className={className} />;
    case 'inventory_2':
      return <IconArchive className={className} />;
    case 'delete':
      return <IconTrash className={className} />;
    case 'save':
      return <IconSave className={className} />;
    case 'stars':
    case 'upgrade':
      return <IconSparkles className={className} />;
    default:
      return <IconBookmark className={className} />;
  }
};

export default function Sidebar() {
  const {
    navigateTo,
    currentPath,
    currentUser,
    boards,
    selectedBoard,
    setSelectedBoard,
    favoriteBoards,
    setFavoriteBoards,
    notifications,
    dmConversations,
    setIsFormOpen,
    setIsCreateBoardOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    language,
    setIsNotifOpen,
    unreadCount,
    setIsProactiveAIOpen,
    viewMode,
    setViewMode,
    avatarsMap,
    accountStatus,
    setIsDocsOpen,
    setIsInvitesModalOpen,
    showNotification,
    setIsMyTicketsOpen,
    setIsArchivedOpen,
    setIsSupportOpen,
    startTour,
    setShowWelcomeTour,
    isSuperAdmin,
    setBoardToDelete,
    archiveBoard,
    workspaces,
    activeWorkspace,
    createWorkspace,
    switchWorkspace,
    fetchWorkspaces,
    tasks,
    showMyTasks,
    setShowMyTasks,
    showOverdueOnly,
    setShowOverdueOnly,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterAssignee,
    setFilterAssignee,
    groupBy,
    setGroupBy,
  } = useAppContext();

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Active Rail Tab State ('home' | 'tasks' | 'spaces' | 'ai' | 'dashboard' | 'support')
  const [activeRailTab, setActiveRailTab] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_active_rail_tab') || 'spaces';
    return 'spaces';
  });

  const activePath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '');

  const handleRailTabChange = (tab) => {
    setActiveRailTab(tab);
    localStorage.setItem('alurku_active_rail_tab', tab);
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('alurku_sidebar_collapsed', 'false');
    }
  };

  // Sidebar collapse & tree expansion states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_sidebar_collapsed') === 'true';
    return false;
  });
  const [isSpacesTreeOpen, setIsSpacesTreeOpen] = useState(true);
  const [isSavedViewsOpen, setIsSavedViewsOpen] = useState(true);

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [activeBoardMenuId, setActiveBoardMenuId] = useState(null);
  const [newWsName, setNewWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Drag & Drop reorder state
  const [draggedBoardId, setDraggedBoardId] = useState(null);
  const [customBoardOrder, setCustomBoardOrder] = useState(() => {
    if (typeof window !== 'undefined' && currentUser) {
      try {
        const saved = localStorage.getItem(`alurku_custom_board_order_${currentUser}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Saved Views State
  const [activeSavedViewId, setActiveSavedViewId] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');
  const [saveViewIcon, setSaveViewIcon] = useState('bookmark');
  const [pendingSnapshot, setPendingSnapshot] = useState(null);

  const [savedViews, setSavedViews] = useState(() => {
    if (typeof window !== 'undefined' && currentUser) {
      try {
        const saved = localStorage.getItem(`alurku_saved_views_${currentUser}`);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      { id: 'sv-assigned', nameEn: 'Assigned to Me', nameId: 'Ditugaskan ke Saya', icon: 'person_check', type: 'assigned', targetUrl: '/my-tasks' },
      { id: 'sv-overdue', nameEn: 'Overdue Tasks', nameId: 'Tugas Terlambat', icon: 'schedule', type: 'overdue', targetUrl: '/my-tasks?filter=overdue' },
    ];
  });

  const handleOpenSaveModal = () => {
    const currentPathname = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
    
    // Auto-suggest a descriptive default name based on what's active
    let defaultName;
    let defaultIcon;

    if (selectedBoard && selectedBoard.id !== 'global') {
      defaultName = `${selectedBoard.name} (${viewMode || 'kanban'})`;
      defaultIcon = viewMode === 'timeline' ? 'timeline' : viewMode === 'list' ? 'view_list' : viewMode === 'calendar' ? 'calendar_month' : 'view_kanban';
    } else if (currentPathname.includes('/my-tasks')) {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter') || 'all';
      defaultName = `My Tasks - ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      defaultIcon = 'task_alt';
    } else if (currentPathname.includes('/assigned-comments')) {
      defaultName = 'Comments & Mentions';
      defaultIcon = 'comment';
    } else if (currentPathname.includes('/leaves') || currentPathname.includes('/cuti') || currentPathname.includes('/meetings-leaves')) {
      defaultName = 'Team Leaves & Holidays';
      defaultIcon = 'event_available';
    } else if (currentPathname.includes('/inbox')) {
      defaultName = 'Inbox Feed';
      defaultIcon = 'inbox';
    } else if (currentPathname.includes('/dashboard')) {
      defaultName = 'Personal Dashboard';
      defaultIcon = 'home';
    } else {
      defaultName = selectedBoard?.name || 'Custom View';
      defaultIcon = 'bookmark';
    }

    setSaveViewName(defaultName);
    setSaveViewIcon(defaultIcon);
    setPendingSnapshot({
      targetUrl: currentPathname || (selectedBoard ? `/workspace/${activeWorkspace?.id || 'main'}/project/${selectedBoard.id}` : '/my-tasks'),
      boardId: selectedBoard?.id || null,
      board: selectedBoard || null,
      viewMode: viewMode || 'kanban',
      groupBy: groupBy || 'Status',
      filterStatus: filterStatus || 'All',
      filterCategory: filterCategory || 'All',
      filterAssignee: filterAssignee || 'All',
      showMyTasks: showMyTasks || false,
      showOverdueOnly: showOverdueOnly || false,
    });
    setIsSaveModalOpen(true);
  };

  const handleSaveModalSubmit = (e) => {
    e.preventDefault();
    if (!saveViewName.trim() || !pendingSnapshot) return;

    const newView = {
      id: `sv-${Date.now()}`,
      nameEn: saveViewName.trim(),
      nameId: saveViewName.trim(),
      icon: saveViewIcon || 'bookmark',
      type: 'custom',
      ...pendingSnapshot,
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    if (currentUser) {
      localStorage.setItem(`alurku_saved_views_${currentUser}`, JSON.stringify(updated));
    }
    if (showNotification) {
      showNotification(tMsg('Shortcut view saved to sidebar!', 'Shortcut tampilan berhasil disimpan ke sidebar!'));
    }
    setIsSaveModalOpen(false);
    setPendingSnapshot(null);
  };

  const handleDeleteSavedView = (e, viewId) => {
    e.stopPropagation();
    const updated = savedViews.filter((v) => v.id !== viewId);
    setSavedViews(updated);
    if (currentUser) {
      localStorage.setItem(`alurku_saved_views_${currentUser}`, JSON.stringify(updated));
    }
    if (activeSavedViewId === viewId) {
      setActiveSavedViewId(null);
    }
    if (showNotification) {
      showNotification(tMsg('Saved view removed', 'Filter tersimpan berhasil dihapus'));
    }
  };

  const handleCreateWsSubmit = (e) => {
    e.preventDefault();
    if (newWsName.trim()) {
      createWorkspace(newWsName);
      setNewWsName('');
      setIsCreatingWs(false);
      setIsWorkspaceMenuOpen(false);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('alurku_sidebar_collapsed', String(next));
      return next;
    });
  };

  const todoListBoard = useMemo(() => {
    return (
      boards.find((b) => {
        const name = (b.name || '').toLowerCase();
        return (name === 'personal tasks' || name === 'to-do list' || name === 'tugas pribadi') && b.is_private === 1;
      }) ||
      boards.find((b) => {
        const name = (b.name || '').toLowerCase();
        return name === 'personal tasks' || name === 'to-do list' || name === 'tugas pribadi';
      })
    );
  }, [boards]);

  // Keyboard Shortcuts Navigation
  useEffect(() => {
    let pendingG = false;
    let timer = null;

    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
        return;
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        pendingG = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          pendingG = false;
        }, 1200);
        return;
      }

      if (pendingG) {
        const key = e.key.toLowerCase();
        if (key === 'h') {
          e.preventDefault();
          pendingG = false;
          setActiveRailTab('home');
          setSelectedBoard(null);
          setViewMode('overview');
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new CustomEvent('alurku-navigate'));
        } else if (key === 'p') {
          e.preventDefault();
          pendingG = false;
          setActiveRailTab('tasks');
          if (todoListBoard) {
            setSelectedBoard(todoListBoard);
            setViewMode('kanban');
          }
        } else if (key === 'a') {
          e.preventDefault();
          pendingG = false;
          setActiveRailTab('spaces');
          setSelectedBoard({ id: 'global', name: tMsg('All Projects', 'Semua Proyek'), role: 'owner', isVirtual: true });
          setViewMode('kanban');
        } else if (key === 'i') {
          e.preventDefault();
          pendingG = false;
          setIsNotifOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [todoListBoard, language]);

  // Task Counts for Badges
  const assignedToMeCount = useMemo(() => {
    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      return isMyTask && !isDone;
    }).length;
  }, [tasks, currentUser]);

  const overdueCount = useMemo(() => {
    const nowStr = new Date().toISOString().split('T')[0];
    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      const deadlineStr = t.deadline ? String(t.deadline).split('T')[0] : '';
      return isMyTask && !isDone && deadlineStr && deadlineStr < nowStr;
    }).length;
  }, [tasks, currentUser]);

  const dueTodayCount = useMemo(() => {
    const nowStr = new Date().toISOString().split('T')[0];
    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      const deadlineStr = t.deadline ? String(t.deadline).split('T')[0] : '';
      return isMyTask && !isDone && deadlineStr === nowStr;
    }).length;
  }, [tasks, currentUser]);

  const dueThisWeekCount = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const sunStr = sunday.toISOString().split('T')[0];
    const satStr = saturday.toISOString().split('T')[0];

    return (tasks || []).filter((t) => {
      const isMyTask = (t.assignee && t.assignee.toLowerCase() === currentUser?.toLowerCase()) || t.owner_username === currentUser;
      const isDone = t.status === 'Done' || t.status === 'Completed' || t.status === 'Rejected';
      const deadlineStr = t.deadline ? String(t.deadline).split('T')[0] : '';
      return isMyTask && !isDone && deadlineStr >= sunStr && deadlineStr <= satStr;
    }).length;
  }, [tasks, currentUser]);

  const getBoardTaskCount = (boardId) => {
    return (tasks || []).filter(
      (t) => parseInt(t.board_id) === parseInt(boardId) && t.status !== 'Done' && t.status !== 'Completed' && t.status !== 'Rejected'
    ).length;
  };

  const totalUnreadChats = useMemo(() => {
    const unreadDms = (dmConversations || []).reduce((sum, convo) => sum + (convo.unread_count || 0), 0);
    // Count unread workspace chats by checking notifications that are linked to a board_id or related_task_id
    const unreadWorkspace = (notifications || []).filter(n => !n.is_read && (n.board_id || n.related_task_id)).length;
    return unreadDms + unreadWorkspace;
  }, [dmConversations, notifications]);

  const [sortMode, setSortMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('alurku_board_sort') || 'recent';
    return 'recent';
  });

  // Sorted Boards & Filtering
  const sortedBoards = useMemo(() => {
    let sorted = [...boards];
    if (customBoardOrder.length > 0 && sortMode === 'custom') {
      sorted.sort((a, b) => {
        const idxA = customBoardOrder.indexOf(a.id);
        const idxB = customBoardOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return b.id - a.id;
      });
    } else if (sortMode === 'alphabet') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'active') {
      sorted.sort((a, b) => {
        const aScore = a.health_alert?.includes('Attention') ? 1 : 0;
        const bScore = b.health_alert?.includes('Attention') ? 1 : 0;
        if (bScore !== aScore) return bScore - aScore;
        return b.id - a.id;
      });
    } else {
      sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
  }, [boards, sortMode, customBoardOrder]);

  const displayBoards = useMemo(() => {
    return sortedBoards.filter((b) => b.id !== todoListBoard?.id);
  }, [sortedBoards, todoListBoard]);

  const favorites = useMemo(() => {
    return displayBoards.filter((b) => favoriteBoards.includes(b.id));
  }, [displayBoards, favoriteBoards]);

  // Filter out pinned projects from main Project List so they don't duplicate!
  const unpinnedDisplayBoards = useMemo(() => {
    return displayBoards.filter((b) => !favoriteBoards.includes(b.id));
  }, [displayBoards, favoriteBoards]);

  const handleDropBoard = (targetBoardId) => {
    if (!draggedBoardId || draggedBoardId === targetBoardId) return;
    const currentList = displayBoards.map((b) => b.id);
    const fromIndex = currentList.indexOf(draggedBoardId);
    const toIndex = currentList.indexOf(targetBoardId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newList = [...currentList];
    const [moved] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, moved);

    setCustomBoardOrder(newList);
    setSortMode('custom');
    localStorage.setItem('alurku_board_sort', 'custom');
    if (currentUser) {
      localStorage.setItem(`alurku_custom_board_order_${currentUser}`, JSON.stringify(newList));
    }
    setDraggedBoardId(null);
  };

  const renderBoardItem = (board, isFavoriteSection = false) => {
    const isActive = selectedBoard?.id === board.id;
    const taskCount = getBoardTaskCount(board.id);
    const isPinned = favoriteBoards.includes(board.id);
    const isMenuOpen = activeBoardMenuId === `${isFavoriteSection ? 'fav' : 'all'}-${board.id}`;
    const unreadChats = notifications.filter(
      (n) =>
        !n.is_read &&
        (n.type === 'team_chat' ||
          n.type === 'team_chat_no_email' ||
          n.type === 'comment' ||
          n.type === 'mention' ||
          n.type === 'mention_no_email') &&
        (n.board_id ? parseInt(n.board_id) === parseInt(board.id) : parseInt(n.related_task_id) === parseInt(board.id))
    ).length;

    const getInitials = (name) => name.substring(0, 2).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-400 to-teal-500',
      'from-rose-400 to-red-500',
      'from-amber-400 to-orange-500',
      'from-fuchsia-500 to-purple-600',
      'from-cyan-400 to-blue-500',
    ];
    const colorIndex = board.id % colors.length;
    const gradient = colors[colorIndex];

    return (
      <div
        role="button"
        tabIndex={0}
        key={`sb-${isFavoriteSection ? 'fav' : 'all'}-${board.id}`}
        title={board.name}
        draggable
        onDragStart={() => setDraggedBoardId(board.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDropBoard(board.id)}
        onClick={() => {
          setSelectedBoard(board);
          setIsMobileMenuOpen(false);
          setIsProactiveAIOpen(false);
          if (viewMode === 'overview') {
            setViewMode('kanban');
          }
          const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
          const wsSlug = slugify(activeWorkspace?.name);
          const boardSlug = slugify(board.name);
          const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/${boardSlug}/${board.id}`;
          window.history.pushState({}, '', targetUrl);
          window.dispatchEvent(new CustomEvent('alurku-navigate'));
        }}
        className={`w-full flex items-center justify-between pl-2 pr-1.5 py-1.5 rounded-lg transition-colors group relative cursor-pointer outline-none select-none ${
          isActive
            ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-semibold'
            : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
        )}

        {/* Drag handle */}
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 -ml-1 mr-0.5 select-none flex items-center justify-center text-neutral-400 dark:text-neutral-500"
          title={tMsg('Drag to reorder', 'Geser untuk menata ulang')}
        >
          <IconDragHandle className="w-3.5 h-3.5" />
        </span>

        {/* Left: Initials Icon + Sub-badge for Private/Lock */}
        <div className="relative shrink-0 mr-2">
          <div
            className={`w-5 h-5 rounded-md bg-linear-to-br ${gradient} text-white flex items-center justify-center text-[9px] font-black shadow-2xs`}
          >
            {getInitials(board.name)}
          </div>
          {!!board.is_private && (
            <span
              className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-300 rounded-full p-0.5 shadow-2xs border border-neutral-200 dark:border-neutral-700 leading-none flex items-center justify-center"
              title={tMsg('Private Project', 'Proyek Privat')}
            >
              <svg className="w-2 h-2 text-neutral-600 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          )}
        </div>

        {/* Middle: Full Readable Project Name with Tooltip */}
        <div className="flex-1 min-w-0 pr-1 text-left">
          <span
            className={`text-xs truncate block ${
              isActive ? 'font-bold text-[#111E38] dark:text-[#FACC15]' : 'font-medium text-slate-700 dark:text-slate-200'
            }`}
            title={board.name}
          >
            {board.name}
          </span>
        </div>

        {/* Right Area: Smart Layered Badges & Hover Actions without layout reflow */}
        <div className="relative flex items-center justify-end shrink-0 min-w-8 min-h-6">
          {/* Default Info (Visible when NOT hovering, smoothly fades out on hover) */}
          <div className={`flex items-center gap-1 transition-opacity duration-150 ${
            isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 group-hover:opacity-0 group-hover:pointer-events-none'
          }`}>
            {isPinned && (
              <span title={tMsg('Pinned Project', 'Proyek Disematkan')} className="flex items-center justify-center text-[#FACC15] shrink-0">
                <IconStar className="w-3.5 h-3.5" />
              </span>
            )}
            {unreadChats > 0 && (
              <span
                className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none shadow-2xs"
                title={`${unreadChats} unread`}
              >
                {unreadChats > 9 ? '9+' : unreadChats}
              </span>
            )}
            {unreadChats === 0 && board.health_alert?.includes('Attention') && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Attention Needed"></span>
            )}
            {unreadChats === 0 && taskCount > 0 && (
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 tabular-nums">
                {taskCount}
              </span>
            )}
          </div>

          {/* Hover Actions (Smoothly appear on hover in place of badges without expanding width) */}
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity duration-150 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}>
            {unreadChats > 0 && (
              <span
                className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none mr-0.5 shadow-2xs"
                title={`${unreadChats} unread`}
              >
                {unreadChats > 9 ? '9+' : unreadChats}
              </span>
            )}
            <button
              type="button"
              draggable="false"
              onClick={(e) => {
                e.stopPropagation();
                if (isPinned) {
                  setFavoriteBoards(favoriteBoards.filter((id) => id !== board.id));
                } else {
                  setFavoriteBoards([...favoriteBoards, board.id]);
                }
              }}
              className={`p-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                isPinned ? 'text-[#FACC15]' : 'text-neutral-400 hover:text-amber-400'
              }`}
              title={isPinned ? tMsg('Unpin Project', 'Lepas Sematan') : tMsg('Pin Project', 'Sematkan')}
            >
              {isPinned ? <IconStar className="w-3.5 h-3.5" /> : <IconStarOutline className="w-3.5 h-3.5" />}
            </button>

            <div className="relative">
              <button
                type="button"
                draggable="false"
                onClick={(e) => {
                  e.stopPropagation();
                  const menuKey = `${isFavoriteSection ? 'fav' : 'all'}-${board.id}`;
                  setActiveBoardMenuId(activeBoardMenuId === menuKey ? null : menuKey);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={tMsg('Project Options', 'Opsi Proyek')}
              >
                <IconMoreVert className="w-3.5 h-3.5" />
              </button>

              {activeBoardMenuId === `${isFavoriteSection ? 'fav' : 'all'}-${board.id}` && (
                <>
                  <div
                    className="fixed inset-0 z-45"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBoardMenuId(null);
                    }}
                  ></div>
                  <div className="absolute right-0 bottom-0 mb-6 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1 text-xs animate-fadeIn">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBoardMenuId(null);
                        if (isPinned) {
                          setFavoriteBoards(favoriteBoards.filter((id) => id !== board.id));
                        } else {
                          setFavoriteBoards([...favoriteBoards, board.id]);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <IconStar className="w-3.5 h-3.5 text-[#FACC15]" />
                      {isPinned ? tMsg('Unpin from Top', 'Lepas Sematan') : tMsg('Pin to Top', 'Sematkan ke Atas')}
                    </button>
                    {(isSuperAdmin || board.owner_username === currentUser) && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBoardMenuId(null);
                            archiveBoard(board);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <IconArchive className="w-3.5 h-3.5" />
                          {tMsg('Archive Project', 'Arsipkan Proyek')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBoardMenuId(null);
                            setBoardToDelete(board);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold"
                        >
                          <IconTrash className="w-3.5 h-3.5 text-rose-500" />
                          {tMsg('Delete Project', 'Hapus Proyek')}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCategoryTitle = () => {
    switch (activeRailTab) {
      case 'home': return tMsg('Home', 'Beranda');
      case 'tasks': return tMsg('My Tasks', 'Tugas Saya');
      case 'spaces': return tMsg('Spaces', 'Proyek');
      case 'ai': return tMsg('AI Agents', 'Asisten AI');
      case 'dashboard': return tMsg('Dashboards', 'Dasbor');
      case 'support': return tMsg('Support & Tickets', 'Dukungan & Tiket');
      default: return tMsg('Spaces', 'Proyek');
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ALURKU DUAL SIDEBAR: DOCK RAIL (COLUMN 1) + CONTENT PANEL (COLUMN 2) */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className={`fixed inset-y-0 left-0 z-90 flex transition-transform duration-300 ease-in-out md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:shrink-0 md:z-50 md:translate-x-0 select-none ${
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* ── COLUMN 1: MASTER BIG CATEGORY ICON DOCK RAIL (~56PX) ── */}
        <aside className="w-14 bg-[#EBECEF] dark:bg-[#090b0d] border-r border-neutral-300/60 dark:border-neutral-800/80 flex flex-col items-center py-3 gap-2 shrink-0">
          
          {/* Top Workspace Avatar Logo (Compact w-7 h-7) */}
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center text-[10px] font-black shadow-xs hover:opacity-90 transition-all mb-1 shrink-0"
            title={`${tMsg('Workspace', 'Ruang Kerja')}: ${activeWorkspace?.name || ''}`}
          >
            {activeWorkspace?.name ? activeWorkspace.name.substring(0, 1).toUpperCase() : 'W'}
          </button>

          <div className="w-6 h-px bg-neutral-300 dark:bg-neutral-800 my-0.5"></div>

          {/* 1. Home */}
          <button
            onClick={() => handleRailTabChange('home')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all relative ${
              activeRailTab === 'home'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Home (G+H)', 'Beranda (G+H)')}
          >
            <IconHome className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">Home</span>
            {(totalUnreadChats > 0 || unreadCount > 0) && (
              <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 bg-[#FACC15] text-[#111E38] text-[8px] font-black rounded-full flex items-center justify-center leading-none shadow-xs">
                {(totalUnreadChats + unreadCount) > 9 ? '9+' : (totalUnreadChats + unreadCount)}
              </span>
            )}
          </button>

          {/* 2. My Tasks */}
          <button
            onClick={() => handleRailTabChange('tasks')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all relative ${
              activeRailTab === 'tasks'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('My Tasks (G+P)', 'Tugas Saya (G+P)')}
          >
            <IconTasks className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">Tasks</span>
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none">
                {overdueCount}
              </span>
            )}
          </button>

          {/* 3. Spaces / Projects */}
          <button
            onClick={() => handleRailTabChange('spaces')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'spaces'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Spaces / Projects (G+A)', 'Proyek / Spaces (G+A)')}
          >
            <IconFolderCopy className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">Spaces</span>
          </button>

          {/* 4. Luruka AI */}
          <button
            onClick={() => handleRailTabChange('ai')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'ai'
                ? 'bg-[#FACC15] text-[#111E38] font-black shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title="Luruka AI Agents"
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-[9px] font-semibold leading-none mt-0.5">AI</span>
          </button>

          {/* 5. Dashboards */}
          <button
            onClick={() => handleRailTabChange('dashboard')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'dashboard'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Dashboards', 'Dasbor')}
          >
            <IconDashboard className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">Board</span>
          </button>

          {/* 6. Support */}
          <button
            onClick={() => handleRailTabChange('support')}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeRailTab === 'support'
                ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60'
            }`}
            title={tMsg('Support', 'Dukungan')}
          >
            <IconHelp className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">Help</span>
          </button>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col items-center gap-2">
            {/* Invite */}
            <button
              onClick={() => setIsInvitesModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-black dark:hover:text-white hover:bg-neutral-300/60 dark:hover:bg-neutral-800 transition-colors"
              title={tMsg('Invite Members', 'Undang Anggota')}
            >
              <IconPersonAdd className="w-4.5 h-4.5" />
            </button>

            {/* Upgrade */}
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-amber-500 hover:bg-amber-500/15 transition-colors"
              title={tMsg('Upgrade Plan', 'Upgrade Paket')}
            >
              <IconUpgrade className="w-4.5 h-4.5" />
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                window.history.pushState({}, '', '/pengaturan');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                activePath.startsWith('/pengaturan') || activePath.startsWith('/settings')
                  ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                  : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-neutral-300/60 dark:hover:bg-neutral-800'
              }`}
              title={tMsg('Settings', 'Pengaturan')}
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            {/* EXPLICIT EXPAND / COLLAPSE BUTTON WITH SMOOTH ROTATION */}
            <button
              onClick={toggleCollapse}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-300/60 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-200 hover:bg-neutral-400/60 dark:hover:bg-neutral-700 transition-all shadow-2xs mt-1"
              title={isCollapsed ? tMsg('Expand Panel (Ctrl+B)', 'Buka Panel Sidebar (Ctrl+B)') : tMsg('Collapse Panel (Ctrl+B)', 'Tutup Panel Sidebar (Ctrl+B)')}
            >
              <IconChevronLeft
                className="w-4.5 h-4.5 transition-transform duration-300"
                style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
          </div>
        </aside>

        {/* ── COLUMN 2: DYNAMIC CONTENT DRAWER PANEL (~210PX) WITH SMOOTH ANIMATION ── */}
        <aside
          className={`bg-[#FAFAFA]/95 dark:bg-[#121B2D]/95 backdrop-blur-xl flex flex-col border-r border-neutral-200/50 dark:border-neutral-800/50 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            isCollapsed
              ? 'w-0 opacity-0 pointer-events-none border-r-0 border-transparent'
              : 'w-60 md:w-64 opacity-100'
          }`}
        >
          {/* ── HEADER ROW 1: WORKSPACE SELECTOR DROPDOWN + WORKSPACE CHAT BUTTON ── */}
          <div className="h-11 px-3 flex items-center justify-between shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/50 relative gap-1">
            <div className="relative flex-1 min-w-0">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="w-full flex items-center justify-between gap-1.5 p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-xl transition-all text-left"
              >
                <div className="flex items-center gap-1.5 truncate flex-1">
                  <span className="font-extrabold text-xs text-[#111E38] dark:text-white truncate">
                    {activeWorkspace?.name || 'Workspace'}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUpgradeModalOpen(true);
                    }}
                    title={tMsg('Click to upgrade / manage subscription', 'Klik untuk upgrade / kelola langganan')}
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md cursor-pointer shrink-0 transition-transform hover:scale-105 ${
                      activeWorkspace?.tier === 'pro'
                        ? 'bg-[#FACC15] text-[#111E38] shadow-2xs font-extrabold'
                        : activeWorkspace?.tier === 'business'
                        ? 'bg-purple-600 text-white font-extrabold'
                        : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {activeWorkspace?.tier ? activeWorkspace.tier.toUpperCase() : 'FREE'}
                  </span>
                </div>
                  <IconChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>

              {isWorkspaceMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-60 p-1.5 animate-fadeIn">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
                    {tMsg('Workspaces', 'Ruang Kerja')}
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
                    {(workspaces || []).map((ws) => (
                      <button
                        key={`ws-menu-${ws.id}`}
                        onClick={() => {
                          switchWorkspace(ws);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          ws.id === activeWorkspace?.id
                            ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="truncate">{ws.name}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            ws.tier === 'pro'
                              ? ws.id === activeWorkspace?.id
                                ? 'bg-amber-400 text-slate-900'
                                : 'bg-[#FACC15] text-[#111E38]'
                              : ws.tier === 'business'
                              ? 'bg-purple-600 text-white'
                              : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                          }`}>
                            {ws.tier ? ws.tier.toUpperCase() : 'FREE'}
                          </span>
                        </div>
                        {ws.id === activeWorkspace?.id && (
                          <svg className="w-3.5 h-3.5 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1.5 pt-1.5 space-y-0.5">
                      {isCreatingWs ? (
                        <form onSubmit={handleCreateWsSubmit} className="flex gap-1.5 p-1">
                          <input
                            type="text"
                            placeholder={tMsg('Workspace Name', 'Nama Workspace')}
                            value={newWsName}
                            onChange={(e) => setNewWsName(e.target.value)}
                            className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs rounded-lg px-2.5 py-1 outline-none text-black dark:text-white"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-[#FACC15] text-[#111E38] text-xs px-2.5 py-1 rounded-lg font-bold"
                          >
                            +
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsCreatingWs(true)}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-600 dark:text-[#FACC15] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-bold flex items-center gap-1.5"
                        >
                          <IconPlus className="w-3.5 h-3.5" />
                          {tMsg('Create Workspace', 'Buat Workspace Baru')}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsWorkspaceMenuOpen(false);
                          setIsUpgradeModalOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-amber-600 dark:text-[#FACC15] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <IconSparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        {tMsg('Upgrade Plan / Quota', 'Tingkatkan Paket / Kuota')}
                      </button>

                      <button
                        onClick={() => {
                          setIsWorkspaceMenuOpen(false);
                          window.history.pushState({}, '', '/pengaturan/ruang-kerja');
                          window.dispatchEvent(new CustomEvent('alurku-navigate'));
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {tMsg('Workspace Settings', 'Pengaturan Ruang Kerja')}
                      </button>
                    </div>
                </div>
              )}
            </div>

            {/* Dedicated Workspace Chat Icon Button in Header Row 1 */}
            <button
              onClick={() => {
                setSelectedBoard(null);
                setIsMobileMenuOpen(false);
                window.history.pushState({}, '', '/chat');
                window.dispatchEvent(new CustomEvent('alurku-navigate'));
              }}
              className={`p-1.5 rounded-lg transition-colors relative shrink-0 ${
                typeof window !== 'undefined' && (window.location.pathname === '/chat' || window.location.pathname.endsWith('/chat'))
                  ? 'bg-[#111E38] text-[#FACC15] font-bold'
                  : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-neutral-300'
              }`}
              title={tMsg('Workspace Chat', 'Obrolan Ruang Kerja')}
            >
              <IconChatBubble className="w-4.5 h-4.5" />
              {totalUnreadChats > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none shadow-xs border border-white dark:border-[#121B2D]">
                  {totalUnreadChats > 9 ? '9+' : totalUnreadChats}
                </span>
              )}
            </button>

            {/* Mobile Explicit Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors shrink-0 ml-0.5 cursor-pointer"
              title={tMsg('Close Sidebar', 'Tutup Sidebar')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── HEADER ROW 2: CATEGORY TITLE + DYNAMIC MULTI-FUNCTION +CREATE BUTTON ── */}
          <div className="px-3 py-1.5 flex items-center justify-between shrink-0 border-b border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-100/40 dark:bg-neutral-900/30 relative">
            <h2 className="text-xs font-extrabold text-slate-800 dark:text-white tracking-tight uppercase">
              {getCategoryTitle()}
            </h2>

            {/* Multi-Function + Create Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="px-2.5 py-1 bg-[#FACC15] hover:bg-[#EAB308] text-[#111E38] dark:text-[#111E38] border border-amber-400/80 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer select-none group"
                title={tMsg('Create Task or Project', 'Buat Tugas atau Proyek')}
              >
                <IconPlus className="w-3 h-3 text-[#111E38] shrink-0" />
                <span className="text-[#111E38] group-hover:text-[#111E38] font-black">{tMsg('Create', 'Buat')}</span>
                <IconChevronDown className="w-3 h-3 text-[#111E38] opacity-80 shrink-0" />
              </button>

              {isCreateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-55" onClick={() => setIsCreateMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-60 py-1 text-xs animate-fadeIn">
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsFormOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <IconTasks className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{tMsg('New Task', 'Tugas Baru')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setIsCreateBoardOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <IconFolderCopy className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{tMsg('New Project', 'Proyek Baru')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── DYNAMIC SCROLLABLE CONTENT BASED ON ACTIVE RAIL TAB ── */}
          <div className="flex-1 overflow-y-auto px-1.5 pt-2 pb-2 custom-scrollbar">

            {/* TAB 1: HOME */}
            {activeRailTab === 'home' && (
              <div className="space-y-3">
                <div className="space-y-0.5">
                  {/* Workspace Chat */}
                  <button
                    onClick={() => {
                      setSelectedBoard(null);
                      setIsMobileMenuOpen(false);
                      window.history.pushState({}, '', '/chat');
                      window.dispatchEvent(new CustomEvent('alurku-navigate'));
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs ${
                      typeof window !== 'undefined' && (window.location.pathname === '/chat' || window.location.pathname.endsWith('/chat'))
                        ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconChatBubble className="w-4 h-4 text-indigo-500 dark:text-[#FACC15] shrink-0" />
                      <span className="truncate">{tMsg('Workspace Chat', 'Obrolan Ruang Kerja')}</span>
                    </div>
                    {totalUnreadChats > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                        {totalUnreadChats}
                      </span>
                    )}
                  </button>

                  {/* Inbox & Notifications */}
                  <button
                    onClick={() => {
                      if (navigateTo) {
                        navigateTo('/inbox');
                      } else if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/inbox');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs ${
                      activePath === '/inbox' || activePath?.endsWith('/inbox')
                        ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconInbox className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tMsg('Inbox & Notifications', 'Kotak Masuk & Notifikasi')}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111E38] text-[9px] font-black flex items-center justify-center leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Leaves & Holidays */}
                  <button
                    onClick={() => {
                      if (navigateTo) {
                        navigateTo('/leaves');
                      } else if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', '/leaves');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                        window.dispatchEvent(new Event('popstate'));
                      }
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs cursor-pointer ${
                      activePath === '/leaves' || activePath?.endsWith('/leaves') || activePath === '/cuti' || activePath === '/meetings-leaves' || activePath?.endsWith('/meetings-leaves') || activePath === '/pertemuan-cuti'
                        ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconCalendar className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tMsg('Leaves & Holidays', 'Cuti & Hari Libur')}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MY TASKS */}
            {activeRailTab === 'tasks' && (
              <div className="space-y-3">
                {/* Brand-compliant Quick Add Task Button */}
                <button
                  onClick={() => {
                    setIsFormOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold text-xs hover:opacity-90 transition-all mb-2 shadow-2xs"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>{tMsg('Add New Task', 'Tambah Tugas Baru')}</span>
                </button>

                {/* Section 1: Smart Views */}
                <div>
                  <div className="px-2 py-1 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider select-none">
                    {tMsg('Smart Views', 'Tampilan Cerdas')}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {/* All Assigned Tasks */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath === '/my-tasks' && !activePath?.includes('filter=')
                          ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconPersonCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">{tMsg('Assigned to me', 'Ditugaskan ke saya')}</span>
                      </div>
                      {assignedToMeCount > 0 && (
                        <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{assignedToMeCount}</span>
                      )}
                    </button>

                    {/* Today */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=today');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=today')
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconCalendar className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate">{tMsg('Due Today', 'Tenggat Hari Ini')}</span>
                      </div>
                      {dueTodayCount > 0 && (
                        <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                          {dueTodayCount}
                        </span>
                      )}
                    </button>

                    {/* This Week (Minggu - Sabtu) */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=this-week');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=this-week')
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconCalendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{tMsg('This Week', 'Minggu Ini')}</span>
                      </div>
                      {dueThisWeekCount > 0 && (
                        <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{dueThisWeekCount}</span>
                      )}
                    </button>

                    {/* Overdue */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=overdue');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=overdue') || showOverdueOnly
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconWarning className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">{tMsg('Overdue', 'Terlambat')}</span>
                      </div>
                      {overdueCount > 0 && (
                        <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                          {overdueCount}
                        </span>
                      )}
                    </button>

                    {/* Completed */}
                    <button
                      onClick={() => {
                        setSelectedBoard(null);
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, '', '/my-tasks?filter=completed');
                        window.dispatchEvent(new CustomEvent('alurku-navigate'));
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        activePath?.includes('filter=completed')
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconTasks className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{tMsg('Completed', 'Selesai')}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Personal Space */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="px-2 py-1 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider select-none">
                    {tMsg('Personal Space', 'Ruang Pribadi')}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {todoListBoard ? (
                      <button
                        onClick={() => {
                          setSelectedBoard(todoListBoard);
                          setShowMyTasks(false);
                          setShowOverdueOnly(false);
                          setViewMode('kanban');
                          setIsMobileMenuOpen(false);
                          const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
                          const wsSlug = slugify(activeWorkspace?.name);
                          const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/personal-tasks/${todoListBoard.id}`;
                          window.history.pushState({}, '', targetUrl);
                          window.dispatchEvent(new CustomEvent('alurku-navigate'));
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          selectedBoard?.id === todoListBoard.id
                            ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                            : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconFolderCopy className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="truncate">{tMsg('Personal Tasks', 'Tugas Pribadi')}</span>
                        </div>
                        {getBoardTaskCount(todoListBoard.id) > 0 && (
                          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                            {getBoardTaskCount(todoListBoard.id)}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsCreateBoardOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-500 dark:text-slate-400 italic"
                      >
                        <IconPlus className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tMsg('+ Create Personal Board', '+ Buat Board Pribadi')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SPACES / PROJECTS TREE */}
            {activeRailTab === 'spaces' && (
              <div className="space-y-3">
                {/* All Tasks & Projects (Master View) */}
                <button
                  onClick={() => {
                    setSelectedBoard({
                      id: 'global',
                      name: `${tMsg('All Projects', 'Semua Proyek')}`,
                      owner_username: currentUser,
                      role: 'owner',
                      isVirtual: true,
                    });
                    setViewMode('kanban');
                    setIsMobileMenuOpen(false);
                    setIsProactiveAIOpen(false);
                    const slugify = (text) => (text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
                    const wsSlug = slugify(activeWorkspace?.name);
                    const targetUrl = `/workspace/${wsSlug}/${activeWorkspace?.id}/project/overall-project`;
                    window.history.pushState({}, '', targetUrl);
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all tour-global-board relative ${
                    selectedBoard?.id === 'global'
                      ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                      : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  {selectedBoard?.id === 'global' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[#111E38] dark:bg-[#FACC15] rounded-r-full"></div>
                  )}
                  <IconLayers className="w-4 h-4 shrink-0" />
                  <span className="text-xs truncate font-semibold">{tMsg('All Projects', 'Semua Proyek')}</span>
                </button>

                {/* Brand-compliant Quick Add Project Button */}
                <button
                  onClick={() => {
                    setIsCreateBoardOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] font-bold text-xs hover:opacity-90 transition-all mb-2 shadow-2xs"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>{tMsg('Add New Project', 'Tambah Proyek Baru')}</span>
                </button>

                {/* Section: Spaces & Projects Tree */}
                <div>
                  <div className="flex items-center justify-between px-2 py-1 select-none">
                    <span
                      onClick={() => setIsSpacesTreeOpen(!isSpacesTreeOpen)}
                      className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      {tMsg('Projects', 'Daftar Proyek')} ({displayBoards.length})
                    </span>
                    <span onClick={() => setIsSpacesTreeOpen(!isSpacesTreeOpen)}>
                      <IconChevronDown
                        className="w-3.5 h-3.5 text-neutral-400 cursor-pointer transition-transform duration-200"
                        style={{ transform: isSpacesTreeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </span>
                  </div>

                  {isSpacesTreeOpen && (
                    <div className="ml-2.5 pl-2 border-l border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-0.5 mt-1">
                      {/* Pinned Projects Section */}
                      {favorites.length > 0 && (
                        <div className="mb-2 pb-1.5 border-b border-neutral-200/50 dark:border-neutral-800/60">
                          <div className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold text-amber-500 dark:text-[#FACC15] uppercase tracking-wider">
                            <IconStar className="w-3 h-3 text-[#FACC15] shrink-0" />
                            <span>{tMsg('Pinned', 'Disematkan')}</span>
                            <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 ml-auto">({favorites.length})</span>
                          </div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {favorites.map((b) => renderBoardItem(b, true))}
                          </div>
                        </div>
                      )}

                      {/* Unpinned Projects List */}
                      {favorites.length > 0 && unpinnedDisplayBoards.length > 0 && (
                        <div className="px-2 pt-1 pb-0.5 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                          <span>{tMsg('Other Projects', 'Proyek Lainnya')}</span>
                          <span className="text-[8px]">({unpinnedDisplayBoards.length})</span>
                        </div>
                      )}
                      {unpinnedDisplayBoards.length === 0 && favorites.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-neutral-400 italic">{tMsg('No other projects', 'Tidak ada proyek lain')}</div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {unpinnedDisplayBoards.map((b) => renderBoardItem(b))}
                        </div>
                      )}

                      {/* Team Docs */}
                      <button
                        onClick={() => {
                          setIsDocsOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        <IconDoc className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="truncate">{tMsg('Team Docs', 'Dokumentasi Tim')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Archived Projects */}
                <button
                  onClick={() => {
                    setIsArchivedOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-500 dark:text-slate-400 font-medium text-xs"
                >
                  <IconArchive className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tMsg('Archived Projects', 'Proyek Diarsipkan')}</span>
                </button>
              </div>
            )}

            {/* TAB 4: AI AGENTS */}
            {activeRailTab === 'ai' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedBoard(null);
                    setIsProactiveAIOpen(true);
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, '', '/proactive-ai');
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all border ${
                    window.location.pathname === '/proactive-ai' && !selectedBoard
                      ? 'bg-[#FACC15] border-[#FACC15] text-[#111E38] font-black shadow-2xs'
                      : 'bg-[#FACC15]/10 border-[#FACC15]/30 hover:bg-[#FACC15]/20 hover:border-[#FACC15]/60 text-[#111E38] dark:text-[#FACC15] font-bold'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span className="text-xs truncate">{tMsg('Ask Luruka AI', 'Tanya Luruka AI')}</span>
                </button>

                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      if (setShowWelcomeTour) setShowWelcomeTour(true);
                      else startTour();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    <IconExplore className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{tMsg('Onboarding & Flow Guide', 'Panduan Onboarding & Alur')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBoard({
                        id: 'global',
                        name: tMsg ? tMsg('All Projects', 'Semua Proyek') : 'All Projects',
                        owner_username: currentUser,
                        role: 'owner',
                        isVirtual: true,
                      });
                      setViewMode('analytics');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-start gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
                      viewMode === 'analytics'
                        ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <IconAnalytics className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${
                      viewMode === 'analytics' ? 'text-inherit' : 'text-indigo-500 dark:text-[#FACC15]'
                    }`} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="truncate font-semibold leading-tight">
                        {tMsg('Workload & Burnout Assistant', 'Asisten Beban Kerja & Burnout')}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${
                        viewMode === 'analytics'
                          ? 'text-[#FACC15]/80 dark:text-[#111E38]/80'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {tMsg('Capacity & Risk Index', 'Kapasitas & Risiko')}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: DASHBOARD */}
            {activeRailTab === 'dashboard' && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedBoard(null);
                    setIsMobileMenuOpen(false);
                    window.history.pushState({}, '', '/dashboard');
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    activePath === '/dashboard' || activePath?.endsWith('/dashboard')
                      ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] font-bold shadow-xs'
                      : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  <IconHome className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tMsg('Personal Dashboard', 'Dasbor Utama')}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedBoard(null);
                    setViewMode('overview');
                    setIsMobileMenuOpen(false);
                    const slug = activeWorkspace?.name 
                      ? activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
                      : 'main';
                    window.history.pushState({}, '', `/workspace/${slug}`);
                    window.dispatchEvent(new CustomEvent('alurku-navigate'));
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <IconDashboard className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tMsg('Workspace Overview', 'Ringkasan Ruang Kerja')}</span>
                </button>
              </div>
            )}

            {/* TAB 6: SUPPORT */}
            {activeRailTab === 'support' && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsMyTicketsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <IconTicket className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tMsg('My Tickets', 'Tiket Bantuan Saya')}</span>
                </button>

                <button
                  onClick={() => {
                    setIsSupportOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <IconHelp className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tMsg('Help & Support', 'Bantuan & Support')}</span>
                </button>
              </div>
            )}

            {/* SAVED VIEWS SECTION (AVAILABLE ACROSS TABS) */}
            {savedViews.length > 0 && (
              <div className="mt-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex items-center justify-between px-2 mb-1 select-none">
                  <span
                    onClick={() => setIsSavedViewsOpen(!isSavedViewsOpen)}
                    className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                  >
                    {tMsg('Saved Views', 'Filter Tersimpan')}
                    <IconChevronDown
                      className="w-3 h-3 text-neutral-400 transition-transform duration-200"
                      style={{ transform: isSavedViewsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </span>
                  <button
                    onClick={handleOpenSaveModal}
                    className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-0.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 cursor-pointer"
                    title={tMsg('Save Current Active Filter', 'Simpan Filter Saat Ini')}
                  >
                    <IconPlus className="w-3 h-3" />
                  </button>
                </div>

                {isSavedViewsOpen && (
                  <div className="flex flex-col gap-0.5">
                    {savedViews.map((sv) => {
                      const isActive = activeSavedViewId === sv.id;
                      return (
                        <div
                          key={sv.id}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-medium group transition-colors ${
                            isActive
                              ? 'bg-[#111E38]/8 dark:bg-[#FACC15]/10 text-[#111E38] dark:text-[#FACC15] font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setActiveSavedViewId(sv.id);
                              setIsMobileMenuOpen(false);

                              // 1. Restore Board / Project
                              if (sv.boardId) {
                                if (sv.boardId === 'global') {
                                  setSelectedBoard({
                                    id: 'global',
                                    name: tMsg('All Projects', 'Semua Proyek'),
                                    owner_username: currentUser,
                                    role: 'owner',
                                    isVirtual: true,
                                  });
                                } else {
                                  const targetBoard = (boards || []).find((b) => String(b.id) === String(sv.boardId)) || sv.board;
                                  if (targetBoard) setSelectedBoard(targetBoard);
                                }
                              } else if (sv.type === 'assigned' || sv.type === 'overdue' || sv.targetUrl?.includes('/my-tasks') || sv.targetUrl?.includes('/inbox') || sv.targetUrl?.includes('/meetings') || sv.targetUrl?.includes('/dashboard')) {
                                setSelectedBoard(null);
                              }

                              // 2. Restore View Mode & Grouping
                              if (sv.viewMode && setViewMode) setViewMode(sv.viewMode);
                              if (sv.groupBy && setGroupBy) setGroupBy(sv.groupBy);

                              // 3. Restore Filters
                              if (sv.filterStatus && setFilterStatus) setFilterStatus(sv.filterStatus);
                              if (sv.filterCategory && setFilterCategory) setFilterCategory(sv.filterCategory);
                              if (sv.filterAssignee && setFilterAssignee) setFilterAssignee(sv.filterAssignee);
                              if (sv.showMyTasks !== undefined && setShowMyTasks) setShowMyTasks(sv.showMyTasks);
                              if (sv.showOverdueOnly !== undefined && setShowOverdueOnly) setShowOverdueOnly(sv.showOverdueOnly);

                              // 4. Restore URL
                              const targetUrl = sv.targetUrl || (sv.type === 'overdue' ? '/my-tasks?filter=overdue' : '/my-tasks');
                              window.history.pushState({}, '', targetUrl);
                              window.dispatchEvent(new CustomEvent('alurku-navigate'));
                            }}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                            title={tMsg(`Filter: ${sv.nameEn}`, `Filter: ${sv.nameId}`)}
                          >
                            {renderDynamicIcon(sv.icon, "w-3.5 h-3.5 text-indigo-500 dark:text-[#FACC15] shrink-0")}
                            <span className="truncate">{language === 'id' ? sv.nameId : sv.nameEn}</span>
                          </button>

                          {sv.type === 'custom' && (
                            <button
                              onClick={(e) => handleDeleteSavedView(e, sv.id)}
                              className="text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                              title={tMsg('Delete saved view', 'Hapus filter tersimpan')}
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── FOOTER USER PROFILE CARD (REFINED COMPACT AVATAR SIZE 20PX) ── */}
          <div className="shrink-0 border-t border-neutral-200/60 dark:border-neutral-800/60 p-2 bg-[#FAFAFA]/95 dark:bg-[#121B2D]/95">
            <div className="flex items-center gap-2 px-1 py-0.5">
              <Avatar username={currentUser} size={20} avatarUrl={avatarsMap?.[currentUser]} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-neutral-200 truncate leading-tight">{currentUser}</p>
                <p className="text-[9px] text-neutral-400 truncate">{accountStatus === 'free' ? tMsg('Free Plan', 'Paket Gratis') : tMsg('Pro Plan', 'Paket Pro')}</p>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CUSTOM MODAL: SAVE CURRENT VIEW / SMART BOOKMARK */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-99 animate-fade-in">
          <div 
            className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/15 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center font-bold">
                  <IconBookmarkAdd className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111E38] dark:text-white">
                    {tMsg('Save Current View', 'Simpan Tampilan Saat Ini')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tMsg('Create a personal sidebar shortcut for this view', 'Buat shortcut personal di sidebar untuk tampilan ini')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setPendingSnapshot(null);
                }}
                className="text-neutral-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModalSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tMsg('View Name', 'Nama Tampilan')}
                </label>
                <input
                  type="text"
                  value={saveViewName}
                  onChange={(e) => setSaveViewName(e.target.value)}
                  placeholder={tMsg('e.g. Sprint 2 - High Impact', 'Contoh: Sprint 2 - Tugas Kritis')}
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 text-slate-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tMsg('Choose Icon', 'Pilih Ikon')}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: 'bookmark', icon: 'bookmark' },
                    { id: 'view_kanban', icon: 'view_kanban' },
                    { id: 'view_list', icon: 'view_list' },
                    { id: 'timeline', icon: 'timeline' },
                    { id: 'calendar_month', icon: 'calendar_month' },
                    { id: 'task_alt', icon: 'task_alt' },
                    { id: 'flag', icon: 'flag' },
                    { id: 'star', icon: 'star' },
                    { id: 'bolt', icon: 'bolt' },
                    { id: 'folder', icon: 'folder' },
                    { id: 'insights', icon: 'insights' },
                    { id: 'inbox', icon: 'inbox' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSaveViewIcon(item.icon)}
                      className={`h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                        saveViewIcon === item.icon
                          ? 'border-[#111E38] dark:border-[#FACC15] bg-[#111E38]/10 dark:bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] font-bold shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {renderDynamicIcon(item.icon, "w-4.5 h-4.5")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Snapshot Summary Pill */}
              {pendingSnapshot && (
                <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <IconCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{tMsg('Captured Settings', 'Pengaturan yang Direkam')}:</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>• {tMsg('Mode', 'Mode')}: <strong>{pendingSnapshot.viewMode}</strong></span>
                    {pendingSnapshot.board?.name && <span>• {tMsg('Project', 'Proyek')}: <strong>{pendingSnapshot.board.name}</strong></span>}
                    {pendingSnapshot.filterStatus !== 'All' && <span>• {tMsg('Status', 'Status')}: <strong>{pendingSnapshot.filterStatus}</strong></span>}
                    {pendingSnapshot.filterCategory !== 'All' && <span>• {tMsg('Category', 'Kategori')}: <strong>{pendingSnapshot.filterCategory}</strong></span>}
                    {pendingSnapshot.showOverdueOnly && <span>• <strong>{tMsg('Overdue Only', 'Hanya Terlambat')}</strong></span>}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsSaveModalOpen(false);
                    setPendingSnapshot(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  {tMsg('Cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-[#EAB308] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <IconSave className="w-4 h-4" />
                  <span>{tMsg('Save View', 'Simpan Tampilan')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Upgrade / Monetization Modal */}
      {isUpgradeModalOpen && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          activeWorkspace={activeWorkspace}
          language={language}
          showNotification={showNotification}
          onUpgradeSuccess={(data) => {
            // Reload all workspaces from server so ALL owned workspaces
            // reflect the new tier (account-wide upgrade model).
            if (fetchWorkspaces) {
              fetchWorkspaces().then((list) => {
                if (list && activeWorkspace) {
                  const refreshed = list.find((w) => w.id === activeWorkspace.id);
                  if (refreshed) switchWorkspace(refreshed);
                }
              });
            } else if (activeWorkspace) {
              switchWorkspace({ ...activeWorkspace, tier: data.tier });
            }
          }}
        />
      )}
    </>
  );
}
