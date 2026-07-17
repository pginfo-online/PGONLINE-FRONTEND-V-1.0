import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (prefersReducedMotion.matches) {
      document.documentElement.style.scrollBehavior = 'auto';
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      wheelMultiplier: 1,
      smoothWheel: true,
      gestureOrientation: 'vertical',
      touchMultiplier: 1.2,
      lerp: 0.08,
    });

    const update = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [enabled]);
}