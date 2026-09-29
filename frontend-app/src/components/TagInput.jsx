import React, { useState } from 'react';

// Deterministic tasteful colors conforming to brand book
export const getTagColor = (tag) => {
  if (!tag) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  
  const lower = String(tag).trim().toLowerCase();
  
  if (lower.includes('urgent') || lower.includes('p0') || lower.includes('critical') || lower.includes('penting')) {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
  }
  if (lower.includes('bug') || lower.includes('fix') || lower.includes('rusak') || lower.includes('error')) {
    return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300/70 dark:border-amber-700/60';
  }
  if (lower.includes('feature') || lower.includes('fitur') || lower.includes('frontend') || lower.includes('ui')) {
    return 'bg-blue-50 text-[#111E38] dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
  }
  if (lower.includes('backend') || lower.includes('api') || lower.includes('db') || lower.includes('database')) {
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';
  }
  if (lower.includes('design') || lower.includes('desain') || lower.includes('ux') || lower.includes('art')) {
    return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
  }
  if (lower.includes('done') || lower.includes('selesai') || lower.includes('approved') || lower.includes('release')) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
  }

  // Hash-based color assignment
  const palettes = [
    'bg-slate-100 text-[#111E38] dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
    'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
    'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
  ];

  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
};

export const parseTaskTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    const trimmed = tags.trim();
    if (!trimmed || trimmed === '[]') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean);
    } catch {
      return trimmed.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
};

const DEFAULT_POPULAR_TAGS = ['Bug', 'Urgent', 'Frontend', 'Backend', 'UI/UX', 'Feature', 'Documentation'];

export default function TagInput({
  tags = [],
  onChange,
  availableSuggestions = [],
  language = 'id',
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState('');
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const currentTags = parseTaskTags(tags);

  const handleAddTag = (tagToAdd) => {
    if (disabled) return;
    const clean = String(tagToAdd || '').trim().replace(/^#+/, '');
    if (!clean) return;
    
    // Check if tag already exists (case-insensitive)
    const exists = currentTags.some(t => t.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      const newTags = [...currentTags, clean];
      if (onChange) onChange(newTags);
    }
    setInputValue('');
  };

  const handleRemoveTag = (indexToRemove) => {
    if (disabled) return;
    const newTags = currentTags.filter((_, idx) => idx !== indexToRemove);
    if (onChange) onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
      handleRemoveTag(currentTags.length - 1);
    }
  };

  // Combine default tags with board suggestions, deduplicated
  const combinedSuggestions = Array.from(
    new Set([...availableSuggestions, ...DEFAULT_POPULAR_TAGS])
  ).filter(s => s && typeof s === 'string' && s.trim());

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Input container with tags badges */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus-within:border-indigo-500/60 dark:focus-within:border-indigo-500/60 transition-colors min-h-[44px]">
        {/* Tag Icon */}
        <div className="flex items-center pl-1 text-neutral-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        </div>

        {/* Existing tags chips with 'x' */}
        {currentTags.map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border shadow-xs transition-all ${getTagColor(tag)}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="text-current opacity-60 hover:opacity-100 hover:text-rose-600 transition-opacity p-0.5 rounded ml-0.5 focus:outline-none"
                title={tMsg('Remove tag', 'Hapus tag')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Text Input */}
        {!disabled && (
          <div className="flex-1 min-w-[120px] flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentTags.length === 0 ? tMsg('Type a tag and press Enter...', 'Ketik label tag lalu tekan Enter...') : tMsg('Add more...', 'Tambah lagi...')}
              className="w-full bg-transparent border-0 focus:ring-0 text-xs font-medium text-black dark:text-white placeholder-neutral-400 outline-none p-1"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => handleAddTag(inputValue)}
                className="px-2 py-0.5 text-[11px] font-bold bg-[#FACC15] text-[#111E38] rounded-md hover:bg-amber-400 transition-colors shrink-0 shadow-xs"
              >
                {tMsg('Add', 'Tambah')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Suggestion Pills */}
      {!disabled && combinedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
            {tMsg('Suggestions:', 'Saran:')}
          </span>
          {combinedSuggestions.slice(0, 8).map((sugg, idx) => {
            const isSelected = currentTags.some(t => t.toLowerCase() === sugg.toLowerCase());
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    const tagIdx = currentTags.findIndex(t => t.toLowerCase() === sugg.toLowerCase());
                    if (tagIdx !== -1) handleRemoveTag(tagIdx);
                  } else {
                    handleAddTag(sugg);
                  }
                }}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#111E38] text-white border-[#111E38] dark:bg-white dark:text-[#111E38] dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{sugg}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
