import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

/**
 * Premium first-visit loading animation with For Your Dentist branding
 * Shows for 2.2 seconds on first page load, then fades out elegantly
 */
export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this is a first visit in this session
    const hasVisited = sessionStorage.getItem('zenova-loaded');
    if (hasVisited) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('zenova-loaded', 'true');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-[#0c0a20] to-slate-950"
        >
          {/* Ambient background glows */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />

          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-6"
          >
            {/* Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.4)]"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            {/* Brand text */}
            <div className="flex flex-col items-center gap-1">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl font-black font-display tracking-tight text-white"
              >
                For Your Dentist<span className="text-violet-400 font-light">Dental</span>
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xs font-mono text-violet-300/60 uppercase tracking-[0.25em]"
              >
                Loading Clinical Engine
              </motion.p>
            </div>

            {/* Loading bar */}
            <motion.div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
              />
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [-20, 20, -20],
                x: [0, (i % 2 ? 10 : -10), 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-violet-400/40"
              style={{
                top: `${20 + (i * 12)}%`,
                left: `${15 + (i * 13)}%`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
