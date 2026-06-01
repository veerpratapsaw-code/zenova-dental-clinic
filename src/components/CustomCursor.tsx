import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/**
 * Clean Custom Cursor — Simple circle with expand on hover
 * - Small circle follows cursor precisely
 * - Outer ring follows with spring physics
 * - On interactive elements: ring expands into a larger purple circle
 * - Auto-disables on touch/mobile devices
 */

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const ringX = useSpring(cursorX, { damping: 28, stiffness: 320 });
  const ringY = useSpring(cursorY, { damping: 28, stiffness: 320 });

  // Check if device supports hover (no touch)
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsMobile(!media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Track interactive element hover
  useEffect(() => {
    if (isMobile) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], input, select, textarea, [data-cursor-hover]');
      setIsHovering(!!isInteractive);
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [isMobile]);

  // Mouse move + click handlers
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMobile, cursorX, cursorY]);

  // Hide default cursor globally
  useEffect(() => {
    if (isMobile) return;
    document.body.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'zenova-cursor-hide';
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
      document.body.style.cursor = '';
      const el = document.getElementById('zenova-cursor-hide');
      if (el) el.remove();
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          position: 'fixed',
          left: 0,
          top: 0,
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isClicking ? 0.7 : isHovering ? 0.5 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="pointer-events-none z-[9999] flex items-center justify-center"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-400 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          position: 'fixed',
          left: 0,
          top: 0,
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isClicking ? 0.8 : isHovering ? 1.8 : 1,
          borderColor: isHovering
            ? 'rgba(139, 92, 246, 0.8)'
            : 'rgba(99, 102, 241, 0.35)',
          backgroundColor: isHovering
            ? 'rgba(139, 92, 246, 0.08)'
            : 'transparent',
          boxShadow: isHovering
            ? '0 0 20px rgba(139, 92, 246, 0.4)'
            : '0 0 8px rgba(139, 92, 246, 0.1)',
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="w-9 h-9 rounded-full border-[1.5px] border-violet-400/35 pointer-events-none z-[9999]"
      />
    </>
  );
}
