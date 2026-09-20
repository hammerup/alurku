import React from 'react';
import { Avatar } from './SharedUI';

export const renderChatMessageContent = (text, isMe) => {
  if (!text) return '';
  const codeBlocks = [];
  let escaped = String(text);

  escaped = escaped.replace(/```([\s\S]*?)(?:```|$)/g, (match, p1) => {
    codeBlocks.push(p1);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Clean raw <br> or <br/> tags to newline before HTML escaping
  escaped = escaped.replace(/<br\s*\/?>/gi, '\n');

  // Parse Markdown Tables
  const tableBlocks = [];
  escaped = escaped.replace(/(?:^|\n)(\|[^\n]+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/g, (match, tableStr) => {
    const lines = tableStr.trim().split(/\r?\n/);
    if (lines.length < 3) return match;

    const parseRow = (rowStr) =>
      rowStr
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const formatCellRichText = (str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-mono text-[11px]">$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:opacity-80 break-all">$1</a>');
    };

    const headers = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);

    let html = `<div class="overflow-x-auto my-3 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xs"><table class="w-full text-left text-xs border-collapse"><thead class="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold border-b border-neutral-200 dark:border-neutral-700"><tr>`;
    headers.forEach((h) => {
      html += `<th class="px-3 py-2 border-r last:border-r-0 border-neutral-200 dark:border-neutral-700">${formatCellRichText(h)}</th>`;
    });
    html += `</tr></thead><tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">`;

    bodyRows.forEach((row, rIdx) => {
      html += `<tr class="${rIdx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-850'}">`;
      row.forEach((cell) => {
        html += `<td class="px-3 py-2 border-r last:border-r-0 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">${formatCellRichText(cell)}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    tableBlocks.push(html);
    return `\n__TABLE_BLOCK_${tableBlocks.length - 1}__\n`;
  });

  escaped = escaped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /^&gt; (.*?)(?=\n|$)/gm,
      `<blockquote class="border-l-2 ${
        isMe
          ? 'border-indigo-300 bg-indigo-700/30 text-indigo-100'
          : 'border-neutral-300 bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400'
      } pl-2 py-1 my-1 italic text-[11px] rounded-r-sm line-clamp-3">$1</blockquote>`
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n/g, '<br/>')
    .replace(
      /(@[\w.-]+|@Luruka|@Smart Assistant|@AI \(Team\)|@AI \(Private\))/gi,
      '<span class="font-black opacity-100">$1</span>'
    )
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:opacity-80 break-all">$1</a>'
    );

  // Retroactive Render-time Transformation: Convert legacy Auto Nudge & Smart Nudge emojis to modern inline SVG badges
  escaped = escaped
    .replace(
      /(?:🚨|🔴)\s*<strong class="font-black">(?:\[(?:OVERDUE|URGENT)\]\s*)?Auto Nudge:?<\/strong>/gi,
      `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700/60 mr-1.5 shadow-2xs select-none"><svg class="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>Auto Nudge</span>`
    )
    .replace(
      /(?:🔔\s*)?<strong class="font-black">(?:\[Auto Nudge\]|Auto Nudge:?)<\/strong>/gi,
      `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 mr-1.5 shadow-2xs select-none"><svg class="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>Auto Nudge</span>`
    )
    .replace(
      /(?:🔔\s*)?<strong class="font-black">(?:\[Smart Nudge\]|Smart Nudge:?)<\/strong>/gi,
      `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] border border-[#FACC15]/50 mr-1.5 shadow-2xs select-none"><svg class="w-3 h-3 text-[#111E38] dark:text-[#FACC15] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>Smart Nudge</span>`
    )
    // Inline SVG replacements for standalone common emojis in AI text
    .replace(
      /🤖/g,
      `<svg class="w-3.5 h-3.5 inline-block align-text-bottom text-[#FACC15] mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`
    )
    .replace(
      /⏰/g,
      `<svg class="w-3.5 h-3.5 inline-block align-text-bottom text-amber-500 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    )
    .replace(
      /🔔/g,
      `<svg class="w-3.5 h-3.5 inline-block align-text-bottom text-amber-500 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>`
    );

  tableBlocks.forEach((tb, i) => {
    escaped = escaped.replace(`__TABLE_BLOCK_${i}__`, tb);
  });

  codeBlocks.forEach((code, i) => {
    let cleanCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    cleanCode = cleanCode.replace(/^[a-z0-9_-]+[ \t]*\r?\n/i, '');
    let lines = cleanCode.split(/\r?\n/);
    let minIndent = Infinity;
    lines.forEach((line) => {
      if (line.trim().length > 0) {
        const match = line.match(/^[ \t]*/);
        if (match) minIndent = Math.min(minIndent, match[0].length);
      }
    });
    if (minIndent > 0 && minIndent !== Infinity) {
      cleanCode = lines.map((line) => (line.length >= minIndent ? line.substring(minIndent) : line)).join('\n');
    } else {
      cleanCode = lines.join('\n');
    }
    const block = `<details class="group bg-[#272822] text-[#F8F8F2] rounded-xl my-3 shadow-lg border border-[#3e3d32] overflow-hidden w-full max-w-full" open><summary class="px-3 py-2 bg-[#1e1f1c] cursor-pointer text-xs font-bold font-sans flex items-center justify-between select-none border-b border-[#3e3d32] hover:bg-[#2c2d27] transition-colors"><span class="text-[#A6E22E] flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#A6E22E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg><span>Code</span></span><div class="flex items-center gap-3"><button type="button" onclick="event.preventDefault(); event.stopPropagation(); navigator.clipboard.writeText(this.closest('details').querySelector('code').innerText); const t = this.innerHTML; this.innerHTML = '<span class=\\'text-emerald-400 font-bold\\'>Copied!</span>'; setTimeout(() => this.innerHTML = t, 2000);" class="text-[10px] font-bold text-neutral-400 hover:text-[#A6E22E] transition-colors bg-[#272822] border border-[#3e3d32] px-2.5 py-1 rounded-md active:scale-95 flex items-center gap-1"><svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>Copy</button><span class="group-open:rotate-180 transition-transform">▼</span></div></summary><div class="overflow-x-auto p-3 w-full custom-scrollbar"><pre class="font-mono text-[10px] sm:text-xs text-left" style="white-space: pre; line-height: 1.3;"><code>${cleanCode}</code></pre></div></details>`;
    escaped = escaped.replace(`__CODE_BLOCK_${i}__`, block);
  });
  return escaped;
};

export default function ChatMessage({
  message: c,
  currentUser,
  avatarsMap,
  showDivider,
  dividerDisplay,
  isFirstUnread,
  onReply,
  onDelete,
  onCopy,
  onReact,
  canReply,
  canDelete,
  canReact,
  idPrefix,
  tMsg,
  children,
}) {
  const isMe = c.username === currentUser;

  const displayUsername = (c.username || '')
    .replace(/Smart Assistant 🤖/g, 'Luruka')
    .replace(/Smart Assistant/g, 'Luruka')
    .replace(/Luruka 🤖/g, 'Luruka')
    .replace(/🤖/g, '');

  const isAi =
    displayUsername === 'Luruka' ||
    Boolean(c.isAI) ||
    Boolean(c.is_ai) ||
    c.username === 'Smart Assistant' ||
    c.username === 'Luruka' ||
    c.role === 'assistant';

  return (
    <React.Fragment>
      {showDivider && (
        <div className="flex justify-center my-3 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-neutral-200/70 dark:bg-neutral-800/70 z-0"></div>
          <span className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md text-neutral-600 dark:text-neutral-300 px-3.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest z-10 border border-neutral-200/60 dark:border-neutral-800/60 shadow-2xs">
            {dividerDisplay}
          </span>
        </div>
      )}
      {isFirstUnread && (
        <div className="flex justify-center my-4 relative chat-animate">
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-200 dark:bg-red-800/50 z-0"></div>
          <span className="bg-red-50/90 dark:bg-red-900/40 backdrop-blur-md text-red-500 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest z-10 border border-red-200 dark:border-red-800/50 shadow-sm">
            {tMsg ? tMsg('Unread Messages', 'Pesan Belum Dibaca') : 'Unread Messages'}
          </span>
        </div>
      )}
      {isAi ? (
        /* Luruka AI Reply — Modern Open Layout without Chat Bubble */
        <div
          id={`${idPrefix}${c.id}`}
          className="flex gap-3.5 w-full py-3 px-2 -mx-1.5 transition-all duration-300 flex-row scroll-mt-20 group/ai-msg"
        >
          {/* AI Monogram / Spark Avatar */}
          <div className="w-7 h-7 rounded-xl bg-[#FACC15] text-[#111E38] flex items-center justify-center font-black text-xs shrink-0 shadow-2xs mt-0.5 select-none">
            <svg className="w-4 h-4 text-[#111E38]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.7 8.3L21.5 9.3L16.6 14.1L17.8 20.8L12 17.6L6.2 20.8L7.4 14.1L2.5 9.3L9.3 8.3L12 2Z" />
            </svg>
          </div>

          <div className="flex flex-col items-start min-w-0 flex-1 max-w-full">
            {/* Header: Luruka AI & Timestamp */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#111E38] dark:text-white flex items-center gap-1.5">
                <span>Luruka</span>
                <span className="text-[8px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-[#FACC15] font-black px-1.5 py-0.2 rounded uppercase tracking-wider border border-amber-300/60 dark:border-amber-700/60">
                  AI
                </span>
              </span>
              <span className="text-[9px] font-medium text-neutral-400">
                {new Date(c.timestamp.replace(/-/g, '/')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* AI Text Content — Open layout, No bubble container */}
            <div className="w-full text-sm leading-relaxed text-[#111E38] dark:text-neutral-200 font-normal">
              <div
                dangerouslySetInnerHTML={{ __html: renderChatMessageContent(c.text, false) }}
                className="wrap-break-word space-y-2 select-text"
              />
              {children}
            </div>

            {/* Subtle Action Toolbar below reply */}
            <div className="flex items-center gap-2 mt-2 pt-1 text-neutral-400">
              <button
                onClick={onCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-[#111E38] dark:hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                title={tMsg ? tMsg('Copy response', 'Salin balasan') : 'Copy'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span className="text-[10px]">{tMsg ? tMsg('Copy', 'Salin') : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Regular User / Teammate Message with Speech Bubble */
        <div
          id={`${idPrefix}${c.id}`}
          className={`flex gap-3 w-full p-2 -mx-1.5 rounded-2xl transition-all duration-700 ${
            isMe ? 'flex-row-reverse' : 'flex-row'
          } chat-animate scroll-mt-20 group/bubble target:bg-[#FACC15]/25 dark:target:bg-[#FACC15]/20 target:border-l-4 target:border-[#FACC15] target:pl-3 target:shadow-md`}
        >
        <Avatar name={displayUsername} url={avatarsMap[c.username]} size="w-8 h-8 shrink-0" textClass="text-[10px]" />
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 max-w-[92%]`}>
          <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">@{displayUsername}</span>
            <span className="text-[8px] font-bold text-neutral-400 opacity-70">
              {new Date(c.timestamp.replace(/-/g, '/')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {c.isPrivate && (
              <span className="text-[8px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded tracking-widest ml-1 shadow-sm flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>Private</span>
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2 max-w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
              className={`p-2.5 text-xs font-normal leading-relaxed shadow-xs shrink min-w-0 ${
                isMe
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] rounded-2xl rounded-tr-sm font-medium'
                  : 'bg-white dark:bg-[#121B2D] text-[#111E38] dark:text-white border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl rounded-tl-sm'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: renderChatMessageContent(c.text, isMe) }}
                className="wrap-break-word space-y-1 select-text"
                style={{ fontWeight: 400 }}
              />
              {children}
            </div>
            <div className="flex flex-col items-center justify-center gap-1 opacity-100 md:opacity-0 group-hover/bubble:opacity-100 transition-opacity shrink-0">
              {canReply && (
                <button
                  onClick={onReply}
                  className="p-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm text-neutral-400 hover:text-indigo-500 transition-colors"
                  title="Reply"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    ></path>
                  </svg>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm text-neutral-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              )}
              <button
                onClick={onCopy}
                className="p-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm text-neutral-400 hover:text-indigo-500 transition-colors"
                title="Copy"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div className={`flex flex-wrap items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {c.reactions &&
              Object.keys(c.reactions).length > 0 &&
              Object.entries(c.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border shadow-sm transition-colors ${
                    users.includes(currentUser)
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-600 dark:text-indigo-300'
                      : 'bg-white border-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                  title={users.join(', ')}
                >
                  <span>{emoji}</span> <span className="font-bold">{users.length}</span>
                </button>
              ))}
            {canReact && (
              <div className="relative group/picker flex items-center opacity-100 md:opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                <button
                  className="p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm text-neutral-400 hover:text-indigo-500 transition-colors"
                  title="Add Reaction"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    isMe ? 'right-full pr-1.5' : 'left-full pl-1.5'
                  } hidden group-hover/picker:flex z-50`}
                >
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-lg p-1 flex gap-1 flex-nowrap">
                    {['👍', '❤️', '😂', '😮', '🙏', '✅'].map((em) => (
                      <button
                        key={em}
                        onClick={() => onReact(em)}
                        className="w-6 h-6 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full flex items-center justify-center transition-transform hover:scale-125 text-sm"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </React.Fragment>
);
}
