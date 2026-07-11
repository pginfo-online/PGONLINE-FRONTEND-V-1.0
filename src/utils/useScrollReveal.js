import { useEffect, useRef, useState } from 'react';

const DEFAULT_OPTIONS = {
  root: null,
  rootMargin: '0px 0px -80px 0px',
  threshold: 0.15,
  triggerOnce: true,
};

export default function useScrollReveal(customOptions = {}) {
  const ref = useRef(null);

  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const element = ref.current;

    if (!element) return;

    const options = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    let observer;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);

          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!options.triggerOnce) {
          setIsRevealed(false);
        }
      },
      {
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    customOptions.root,
    customOptions.rootMargin,
    customOptions.threshold,
    customOptions.triggerOnce,
  ]);

  return [ref, isRevealed];
}