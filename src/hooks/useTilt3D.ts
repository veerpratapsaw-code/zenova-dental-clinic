import { useRef, useCallback, CSSProperties, useState } from 'react';

/**
 * 3D tilt-on-hover effect for cards
 * Creates Apple-style perspective tilt that follows cursor position
 * Includes optional light reflection shine effect
 */
export function useTilt3D(maxTilt: number = 15, enableShine: boolean = true) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});
  const [shineStyle, setShineStyle] = useState<CSSProperties>({});

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!elementRef.current) return;
    const { left, top, width, height } = elementRef.current.getBoundingClientRect();

    const x = (e.clientX - left) / width;  // 0 to 1
    const y = (e.clientY - top) / height;  // 0 to 1

    const tiltX = (y - 0.5) * -maxTilt; // Inverted for natural feel
    const tiltY = (x - 0.5) * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s ease-out',
    });

    if (enableShine) {
      // Move a light reflection across the surface
      setShineStyle({
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
        opacity: 1,
      });
    }
  }, [maxTilt, enableShine]);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    });
    setShineStyle({ opacity: 0 });
  }, []);

  return {
    ref: elementRef,
    tiltStyle,
    shineStyle,
    tiltProps: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
