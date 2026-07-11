import { useEffect } from 'react';

export default function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    if (typeof window === 'undefined') return;

    const html = document.documentElement;

    html.style.scrollBehavior = 'smooth';

    html.style.overscrollBehavior = 'none';

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (prefersReducedMotion.matches) {
      html.style.scrollBehavior = 'auto';
    }

    return () => {
      html.style.scrollBehavior = '';
      html.style.overscrollBehavior = '';
    };
  }, [enabled]);
}