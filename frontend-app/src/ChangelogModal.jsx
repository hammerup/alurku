import { useEffect } from 'react';

/**
 * Deprecated: Changelog has moved to a dedicated permalink page at /catatan-rilis (and /changelog).
 * This component automatically redirects to the new page if rendered.
 */
export default function ChangelogModal({ setIsChangelogOpen }) {
  useEffect(() => {
    if (setIsChangelogOpen) setIsChangelogOpen(false);
    window.history.pushState({}, '', '/catatan-rilis');
    window.dispatchEvent(new CustomEvent('alurku-navigate'));
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [setIsChangelogOpen]);

  return null;
}
