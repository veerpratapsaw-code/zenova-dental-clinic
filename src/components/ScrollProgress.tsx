import { motion, useScroll, useSpring } from 'motion/react';

/**
 * Premium scroll progress indicator at the top of the page
 * Sleek gradient bar showing how far the user has scrolled
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 h-[6px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 blur-[6px] opacity-60" />
    </motion.div>
  );
}
