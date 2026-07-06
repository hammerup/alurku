import React from 'react';

/**
 * DoubleBezel – Implements the "outer shell + inner core" pattern.
 * Outer shell: semi‑transparent black with backdrop‑blur.
 * Inner core: white (light mode) or neutral‑950 (dark mode) with rounded corners.
 * Accepts additional className to customise size / layout.
 */
export default function DoubleBezel({ children, className = '' }) {
  return (
    <div className={`relative rounded-[2rem] bg-black/20 backdrop-blur-xs ${className}`}>
      <div className="relative bg-white dark:bg-neutral-950 rounded-[calc(2rem-0.375rem)] p-4 h-full w-full">
        {children}
      </div>
    </div>
  );
}
