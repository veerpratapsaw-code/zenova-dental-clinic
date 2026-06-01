import { useRef, useCallback } from 'react';

/**
 * Magnetic pull effect for elements
 * When cursor is near the element, it subtly pulls toward the cursor
 * Perfect for buttons and interactive elements
 */
export function useMagnetic(strength: number = 0.35) {
  const elementRef = useRef<HTMLElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!elementRef.current) return;
    const { left, top, width, height } = elementRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    posRef.current = {
      x: dx * strength,
      y: dy * strength,
    };

    elementRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    elementRef.current.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current) return;
    posRef.current = { x: 0, y: 0 };
    elementRef.current.style.transform = 'translate(0px, 0px)';
    elementRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  }, []);

  return {
    ref: elementRef,
    magneticProps: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
