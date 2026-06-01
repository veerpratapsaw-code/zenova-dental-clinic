import { useRef, useEffect, useState } from 'react';

/**
 * Apple-style scroll-triggered text reveal
 * Animates text word-by-word or character-by-character as user scrolls
 */
type RevealMode = 'word' | 'character';

interface UseScrollRevealOptions {
  mode?: RevealMode;
  threshold?: number;
  staggerDelay?: number;
}

export function useScrollReveal(text: string, options: UseScrollRevealOptions = {}) {
  const { mode = 'word', threshold = 0.2, staggerDelay = 0.04 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const units = mode === 'word' ? text.split(' ') : text.split('');
  const separator = mode === 'word' ? ' ' : '';

  const renderRevealedText = () => {
    return units.map((unit, i) => ({
      text: unit + (mode === 'word' && i < units.length - 1 ? '\u00A0' : ''),
      delay: i * staggerDelay,
      isRevealed,
    }));
  };

  return {
    containerRef,
    isRevealed,
    revealUnits: renderRevealedText(),
  };
}
