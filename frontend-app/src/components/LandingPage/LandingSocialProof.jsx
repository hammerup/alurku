import React, { useRef, useEffect, useState, useCallback } from 'react';

const logos = [
  {
    name: 'accenture',
    svg: (
      <svg viewBox="0 0 110 30" className="h-16 w-auto fill-current">
        <text y="24" fontSize="22" fontFamily="serif" fontStyle="italic" fontWeight="500">accenture</text>
        <path d="M98 5 L104 5 L101 11 Z" />
      </svg>
    ),
  },
  {
    name: 'Google',
    svg: (
      <svg viewBox="0 0 82 28" className="h-16 w-auto fill-current">
        <text y="22" fontSize="22" fontFamily="sans-serif" fontWeight="400" letterSpacing="-0.5">Google</text>
      </svg>
    ),
  },
  {
    name: 'IBM',
    svg: (
      <svg viewBox="0 0 54 28" className="h-16 w-auto fill-current">
        <text y="22" fontSize="26" fontFamily="monospace" fontWeight="900" letterSpacing="2">IBM</text>
      </svg>
    ),
  },
  {
    name: 'Microsoft',
    svg: (
      <svg viewBox="0 0 130 28" className="h-16 w-auto fill-current">
        <rect x="0" y="2" width="10" height="10" />
        <rect x="12" y="2" width="10" height="10" />
        <rect x="0" y="14" width="10" height="10" />
        <rect x="12" y="14" width="10" height="10" />
        <text x="28" y="20" fontSize="18" fontFamily="sans-serif" fontWeight="300">Microsoft</text>
      </svg>
    ),
  },
  {
    name: 'salesforce',
    svg: (
      <svg viewBox="0 0 130 36" className="h-16 w-auto fill-current">
        <path d="M30 28 Q15 28 15 20 Q15 14 20 12 Q20 6 26 6 Q29 2 34 4 Q38 0 43 4 Q50 2 52 8 Q58 8 58 15 Q58 22 52 22 Q50 28 44 28 Z" fillOpacity="0.9"/>
        <text x="64" y="24" fontSize="16" fontFamily="sans-serif" fontWeight="400">salesforce</text>
      </svg>
    ),
  },
  {
    name: 'Deloitte',
    svg: (
      <svg viewBox="0 0 96 28" className="h-16 w-auto fill-current">
        <text y="22" fontSize="22" fontFamily="serif" fontWeight="400">Deloitte.</text>
      </svg>
    ),
  },
  {
    name: 'McKinsey',
    svg: (
      <svg viewBox="0 0 128 28" className="h-16 w-auto fill-current">
        <text y="22" fontSize="19" fontFamily="serif" fontWeight="500">McKinsey &amp; Co.</text>
      </svg>
    ),
  },
  {
    name: 'Telkom',
    svg: (
      <svg viewBox="0 0 100 28" className="h-16 w-auto fill-current">
        <text y="22" fontSize="20" fontFamily="sans-serif" fontWeight="700">Telkom</text>
      </svg>
    ),
  },
];

/* Triplicate so the middle set is always "in view" during seamless wrap */
const track = [...logos, ...logos, ...logos];

const SPEED = 0.6; // px per frame

export default function LandingSocialProof({ language }) {
  const isId = language === 'id';

  const outerRef = useRef(null);   // viewport container
  const trackRef = useRef(null);   // scrolling track element
  const xRef    = useRef(0);       // current translate X (negative = moved left)
  const rafRef  = useRef(null);
  const halfRef = useRef(0);       // half-width of the full track (for seamless wrap)

  /* Interaction state */
  const isPausedRef  = useRef(false);  // hover pause
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);     // pointer X when drag started
  const dragStartOffsetRef = useRef(0); // xRef.current when drag started

  /* Measure half-width after mount */
  useEffect(() => {
    if (trackRef.current) {
      // The track has 3 copies; half = width of 1 copy
      halfRef.current = trackRef.current.scrollWidth / 3;
    }
  }, []);

  /* RAF loop */
  const tick = useCallback(() => {
    if (!trackRef.current) return;

    if (!isPausedRef.current && !isDraggingRef.current) {
      xRef.current -= SPEED;
    }

    // Seamless wrap: when we've scrolled one full copy, jump back by one copy width
    const half = halfRef.current;
    if (half > 0 && xRef.current <= -half) {
      xRef.current += half;
    }
    // Guard against dragging past right edge
    if (xRef.current > 0) xRef.current = 0;

    trackRef.current.style.transform = `translateX(${xRef.current}px)`;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  /* ── Hover ── */
  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => {
    isPausedRef.current = false;
    isDraggingRef.current = false;
  };

  /* ── Drag (mouse) ── */
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = xRef.current;
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    let next = dragStartOffsetRef.current + delta;
    const half = halfRef.current;
    // Wrap while dragging too
    if (half > 0 && next <= -half) next += half;
    if (next > 0) next = 0;
    xRef.current = next;
  }, []);

  const handleMouseUp = () => { isDraggingRef.current = false; };

  /* ── Touch drag ── */
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    isPausedRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartOffsetRef.current = xRef.current;
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const delta = e.touches[0].clientX - dragStartXRef.current;
    let next = dragStartOffsetRef.current + delta;
    const half = halfRef.current;
    if (half > 0 && next <= -half) next += half;
    if (next > 0) next = 0;
    xRef.current = next;
  }, []);

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isPausedRef.current = false;
  };

  /* Attach global move/up so dragging outside the element works */
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <section className="w-full py-14 bg-white border-b border-neutral-100 overflow-hidden select-none">
      {/* Label */}
      <p className="text-center text-xs text-neutral-400 font-semibold tracking-widest uppercase mb-10">
        {isId ? 'Dipercaya oleh organisasi terkemuka' : 'Trusted by leading organizations'}
      </p>

      {/* Viewport with fade masks */}
      <div
        ref={outerRef}
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track — no CSS animation, driven entirely by RAF */}
        <div
          ref={trackRef}
          className="flex items-center will-change-transform"
          style={{ gap: '72px', width: 'max-content', paddingLeft: '72px' }}
        >
          {track.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 transition-colors duration-300"
              style={{ color: '#6b7280' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
