import React from 'react';
import DoubleBezel from '../DoubleBezel';

/**
 * FloatingPillCTA – a centered, pill‑shaped call‑to‑action wrapper.
 * Uses DoubleBezel for the premium outer shell and applies
 * Tailwind utilities to center it horizontally.
 */
export default function FloatingPillCTA({ children }) {
  return (
    <div className="flex justify-center my-8">
      <DoubleBezel className="px-6 py-3 rounded-full bg-white dark:bg-neutral-950">
        {children}
      </DoubleBezel>
    </div>
  );
}
