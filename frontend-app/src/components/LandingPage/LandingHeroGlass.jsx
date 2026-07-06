import React from 'react';
import DoubleBezel from '../DoubleBezel';

/**
 * LandingHeroGlass – a simple wrapper that applies the premium
 * glass‑morphic DoubleBezel shell around the hero content.
 */
export default function LandingHeroGlass({ children }) {
  return (
    <DoubleBezel className="p-4">
      {children}
    </DoubleBezel>
  );
}
