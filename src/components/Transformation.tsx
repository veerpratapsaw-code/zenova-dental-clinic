import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, MoveHorizontal } from 'lucide-react';

export default function Transformation() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(event.target.value));
  };

  return (
    <section id="transformation" className="py-24 relative overflow-hidden bg-white dark:bg-[#0a0a1a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] rounded-full border border-cyan-100 dark:border-cyan-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Visual Evidence
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            See The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Transformation</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            Drag the slider below to witness the incredible results of our advanced dental treatments. From severe decay to a perfect, healthy smile.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-2xl shadow-cyan-500/10 border border-slate-200 dark:border-white/10"
          ref={containerRef}
        >
          {/* Aspect Ratio Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-video select-none touch-none">
            
            {/* Base Image (Before) */}
            <div className="absolute inset-0">
              <img 
                src="/before-teeth.png" 
                alt="Teeth Before Treatment" 
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                BEFORE
              </div>
            </div>

            {/* Overlay Image (After) */}
            <div 
              className="absolute inset-0" 
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img 
                src="/after-teeth.png" 
                alt="Teeth After Treatment" 
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              <div className="absolute top-4 right-4 bg-cyan-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-400/50">
                AFTER
              </div>
            </div>

            {/* Interactive Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Custom Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none transition-transform duration-75"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-100">
                <MoveHorizontal className="w-5 h-5 text-slate-800" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
