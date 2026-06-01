import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ArrowRight, Star, ShieldCheck, Award, Sparkles, Plus, Activity } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import CountUp from './CountUp';
import jaw3DImage from '../assets/images/single_tooth.png';

interface HeroProps {
  onBookClick: () => void;
  onExploreClick: () => void;
}

export default function Hero({ onBookClick, onExploreClick }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);
  const [processedImage, setProcessedImage] = useState<string>('');

  // Check hover capability to disable tilt on mobile touchscreens
  useEffect(() => {
    const media = window.matchMedia('(hover: hover)');
    setIsMobile(!media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Run dynamic unmultiply logic to transform black-background or white-background image to transparent PNG on client
  useEffect(() => {
    const img = new Image();
    img.src = jaw3DImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = img.width;
        const height = img.height;

        // Dynamic background color detection by sampling 4 corner regions
        const cornerIndices = [
          0, // Top-Left
          (width - 1) * 4, // Top-Right
          (height - 1) * width * 4, // Bottom-Left
          ((height - 1) * width + (width - 1)) * 4 // Bottom-Right
        ];
        
        let whiteCornerVotes = 0;
        let blackCornerVotes = 0;
        
        cornerIndices.forEach(idx => {
          if (idx < data.length) {
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            if (minVal > 215) {
              whiteCornerVotes++;
            } else if (maxVal < 40) {
              blackCornerVotes++;
            }
          }
        });

        const isWhiteBackground = whiteCornerVotes >= 2;

        if (isWhiteBackground) {
          // BFS Flood-Fill from outer edges to key out white backgrounds
          const queue: number[] = [];
          const visited = new Uint8Array(width * height);

          const enqueue = (x: number, y: number) => {
            const idx = y * width + x;
            if (!visited[idx]) {
              visited[idx] = 1;
              queue.push(x, y);
            }
          };

          for (let x = 0; x < width; x++) {
            enqueue(x, 0);
            enqueue(x, height - 1);
          }
          for (let y = 0; y < height; y++) {
            enqueue(0, y);
            enqueue(width - 1, y);
          }

          while (queue.length > 0) {
            const y = queue.pop()!;
            const x = queue.pop()!;
            
            const idx = y * width + x;
            const pixelIdx = idx * 4;
            const r = data[pixelIdx];
            const g = data[pixelIdx + 1];
            const b = data[pixelIdx + 2];
            
            const isWhiteIsh = r > 215 && g > 215 && b > 215;
            
            if (isWhiteIsh) {
              data[pixelIdx + 3] = 0;
              
              const neighbors = [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1]
              ];
              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nidx = ny * width + nx;
                  if (!visited[nidx]) {
                    visited[nidx] = 1;
                    queue.push(nx, ny);
                  }
                }
              }
            }
          }

          // Apply 1-pixel box blur on alpha channel for feathered edges
          const alphaBuffer = new Uint8Array(width * height);
          for (let idx = 0; idx < width * height; idx++) {
            alphaBuffer[idx] = data[idx * 4 + 3];
          }

          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const idx = y * width + x;
              const pixelIdx = idx * 4;
              
              if (alphaBuffer[idx] > 0) {
                let sum = 0;
                let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dx = -1; dx <= 1; dx++) {
                    sum += alphaBuffer[(y + dy) * width + (x + dx)];
                    count++;
                  }
                }
                data[pixelIdx + 3] = Math.round(sum / count);
              }
            }
          }
        } else {
          // Classic black background unmultiply logic
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const maxVal = Math.max(r, g, b);
            if (maxVal < 8) {
              data[i + 3] = 0;
            } else {
              const alpha = maxVal / 255;
              data[i] = Math.min(255, Math.round(r / alpha));
              data[i + 1] = Math.min(255, Math.round(g / alpha));
              data[i + 2] = Math.min(255, Math.round(b / alpha));
              data[i + 3] = Math.round(alpha * 255);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        try {
          setProcessedImage(canvas.toDataURL());
        } catch (e) {
          console.warn('Could not export canvas data URL, falling back to raw asset', e);
        }
      }
    };
  }, []);

  // Global mouse coordinates for background lighting physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for gentle 3D tilt interaction
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { damping: 25, stiffness: 100 });
  const springTiltY = useSpring(tiltY, { damping: 25, stiffness: 100 });

  // Passive drifting light background springs
  const lightX = useSpring(mouseX, { damping: 90, stiffness: 50 });
  const lightY = useSpring(mouseY, { damping: 90, stiffness: 50 });

  // Scroll parallax logic
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 600], [0, -70]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const contentScale = useTransform(scrollY, [0, 600], [1, 0.95]);

  const jawScrollRotate = useTransform(scrollY, [0, 800], [0, 20]);
  const jawScrollScale = useTransform(scrollY, [0, 800], [1, 0.9]);
  const jawScrollY = useTransform(scrollY, [0, 800], [0, -30]);

  const lightTransformX = useTransform(lightX, (val) => val - 500);
  const lightTransformY = useTransform(lightY, (val) => val - 500);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const xNorm = (e.clientX - left - width / 2) / (width / 2);
      const yNorm = (e.clientY - top - height / 2) / (height / 2);
      
      tiltX.set(xNorm * 18);
      tiltY.set(yNorm * -18); 
    }
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // Floating micro-particles coordinates
  const backgroundParticles = [
    { id: 'bp-1', top: '12%', left: '8%', size: 5, delay: 0 },
    { id: 'bp-2', top: '22%', left: '84%', size: 7, delay: 1.2 },
    { id: 'bp-3', top: '65%', left: '12%', size: 4, delay: 0.7 },
    { id: 'bp-4', top: '78%', left: '88%', size: 6, delay: 2.0 },
    { id: 'bp-5', top: '38%', left: '46%', size: 3, delay: 1.0 },
    { id: 'bp-6', top: '60%', left: '62%', size: 5, delay: 0.3 },
    { id: 'bp-7', top: '82%', left: '32%', size: 7, delay: 1.7 },
  ];

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#FDFEFE] via-[#F8FAFC] to-[#F1F5F9] dark:from-[#0a0a1a] dark:via-[#0c0c20] dark:to-[#0e0e25] transition-colors duration-500"
    >


      {/* Cinematic Corner Blurs */}
      <div className="absolute top-[-5%] left-[-8%] w-[550px] h-[550px] bg-gradient-to-tr from-purple-200/40 to-violet-100/20 dark:from-purple-900/30 dark:to-violet-900/15 rounded-full blur-[140px] opacity-75 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-8%] w-[650px] h-[650px] bg-gradient-to-bl from-cyan-200/30 to-blue-100/20 dark:from-cyan-900/20 dark:to-blue-900/15 rounded-full blur-[150px] opacity-65 animate-pulse-slow pointer-events-none" />
      
      {/* Fine-line tech coordinates background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.035)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06)_1.5px,transparent_1.5px)] bg-[size:36px_36px] opacity-90 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[22rem] bg-gradient-to-b from-[#FDFEFE] dark:from-[#0a0a1a] to-transparent pointer-events-none" />

      {/* Futuristic Floating Micro-Particles */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {backgroundParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: 0 }}
            animate={{ 
              y: [-18, 18, -18],
              opacity: [0.3, 0.9, 0.3]
            }}
            transition={{
              duration: 7 + p.size,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay
            }}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
            }}
            className="rounded-full bg-violet-400/[0.22] shadow-[0_0_12px_rgba(139,92,246,0.35)]"
          />
        ))}
      </div>

      {/* HERO ASYMMETRIC SPLIT-SCREEN WRAPPER */}
      <motion.div 
        style={{
          y: contentY,
          opacity: contentOpacity,
          scale: contentScale
        }}
        className="w-[92%] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 py-6"
      >
        
        {/* LEFT COMPOSITION: LARGE BOLD TYPOGRAPHY & ELEGANT SPACING */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start gap-8 text-center lg:text-left select-text">
          
          {/* Tech Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4.5 py-2 bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-full border border-violet-200/40 dark:border-violet-500/20 shadow-sm transition-all duration-300 hover:border-violet-300/60"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-violet-700 dark:text-violet-400 tracking-[0.22em] uppercase font-mono">
              ✦ Next-Gen 3D Dentistry Engine
            </span>
          </motion.div>
 
          {/* Core Headings with scroll reveal effect */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] drop-shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
            >
              Advanced Care For <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 font-display relative pb-1 drop-shadow-[0_4px_30px_rgba(139,92,246,0.5)]">
                Confident Smiles.
                {/* Cinematic Volumetric Glow Backplate */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-[115%] bg-gradient-to-r from-violet-500/20 via-indigo-500/15 to-cyan-400/20 blur-[35px] rounded-full pointer-events-none -z-10 animate-pulse" />
              </span>
            </motion.h1>
          </div>
 
          {/* Premium Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl font-medium leading-relaxed"
          >
            Modern dentistry powered by advanced technology, gentle care, and a seamless patient experience.
          </motion.p>
 
          {/* CTAs BUTTONS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2"
          >
            {/* BOOK APPOINTMENT CTA (with breathing glow) */}
            <button
              onClick={onBookClick}
              className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold tracking-wide shadow-[0_10px_30px_-5px_rgba(124,58,237,0.35)] hover:shadow-[0_15px_35px_-2px_rgba(124,58,237,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group overflow-hidden animate-breathe"
            >
              <div className="shine-sweep-overlay" />
              <Calendar className="w-5 h-5 text-violet-100 transition-transform group-hover:scale-110" />
              Book Appointment
            </button>
 
            {/* EXPLORE TREATMENTS CTA */}
            <button
              onClick={onExploreClick}
              className="px-8 py-4 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl font-bold text-black hover:text-black dark:text-slate-300 dark:hover:text-white shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-white/10 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              Explore Treatments
              <ArrowRight className="w-5 h-5 text-black dark:text-indigo-400 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </motion.div>
 
          {/* Clean clinical metrics row with CountUp animation */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full pt-8 mt-5 border-t border-slate-200/60 dark:border-white/10 justify-items-center">
            {[
              { id: 'm-1', val: 20, suffix: '+', label: 'Years of Care', icon: Award, color: 'text-violet-600 dark:text-violet-400' },
              { id: 'm-2', val: 12, suffix: 'k+', label: 'Smiles Designed', icon: Star, color: 'text-cyan-500 dark:text-cyan-400' },
              { id: 'm-3', val: 98, suffix: '%', label: 'Success Rate', icon: ShieldCheck, color: 'text-emerald-500 dark:text-emerald-400' }
            ].map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 + i * 0.08, ease: 'easeOut' }}
                className="flex flex-col items-center lg:items-start select-none w-full p-4 sm:p-5 rounded-2xl border border-transparent transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color} shrink-0`} />
                  <CountUp 
                    end={stat.val} 
                    suffix={stat.suffix}
                    className="text-xl sm:text-2xl font-black font-display text-black dark:text-white leading-none"
                  />
                </div>
                <span className="text-[10px] text-slate-950 dark:text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

        </div>

        {/* RIGHT COMPOSITION: FLOATING PREMIUM 3D JAW MODEL */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center mt-12 lg:mt-0 select-none w-full max-w-full">
          
          {/* Layered concentric orbits */}
          <div className="absolute w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] border border-dashed border-slate-200/50 dark:border-white/10 rounded-full animate-[spin_60s_linear_infinite] select-none pointer-events-none hidden md:block" />
          <div className="absolute w-[340px] h-[340px] sm:w-[530px] sm:h-[530px] border border-slate-200/30 dark:border-white/5 rounded-full select-none pointer-events-none hidden lg:block" />

          {/* Premium Container with real 3D mouse tilt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              rotateX: isMobile ? 0 : springTiltY,
              rotateY: isMobile ? 0 : springTiltX,
              transformStyle: 'preserve-3d',
              scale: jawScrollScale,
              rotateZ: jawScrollRotate,
              y: jawScrollY
            }}
            className="relative w-[85vw] max-w-[280px] xs:max-w-[320px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[465px] aspect-square flex items-center justify-center overflow-visible group"
          >
            {/* Volumetric background glows */}
            <div className="absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] bg-gradient-to-tr from-violet-400/20 to-cyan-400/20 rounded-full blur-[40px] sm:blur-[50px] pointer-events-none select-none animate-pulse-slow" />
            <div className="absolute w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] bg-white/40 dark:bg-white/10 rounded-full blur-[30px] sm:blur-[40px] pointer-events-none select-none" />

            {/* FLOATING WRAPPER: Anti-gravity floating loops */}
            <motion.div
              animate={{
                y: isMobile ? [-8, 8, -8] : [-14, 14, -14],
                rotate: isMobile ? [-1.5, 1.5, -1.5] : [-3, 3, -3]
              }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full h-full flex items-center justify-center z-13"
            >
              {/* Premium 3D Model Render */}
              <img
                src={processedImage || jaw3DImage}
                alt="For Your Dentist Premium Realistic Glossy Jaw 3D Model"
                referrerPolicy="no-referrer"
                style={{ transform: isMobile ? 'none' : 'translateZ(50px)' }}
                className="w-[95%] h-auto object-contain drop-shadow-[0_15px_40px_rgba(139,92,246,0.25)] sm:drop-shadow-[0_20px_50px_rgba(139,92,246,0.3)] group-hover:scale-102 lg:group-hover:scale-105 transition-transform duration-500 relative z-10"
              />

              {/* Diagnostic Overlays */}
              <div 
                style={{ transform: 'translateZ(85px)' }}
                className="absolute top-[15%] right-[-8%] bg-white/95 dark:bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-violet-200/50 dark:border-violet-500/20 shadow-[0_8px_20px_rgba(0,0,0,0.04)] text-[10px] md:text-xs font-mono font-bold text-black dark:text-violet-300 hidden md:flex items-center gap-2 hover:bg-white dark:hover:bg-white/15 transition-all pointer-events-none"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                </div>
                <span>Bio-Ceramic Enamel</span>
              </div>

              <div 
                style={{ transform: 'translateZ(75px)' }}
                className="absolute bottom-[18%] left-[-10%] bg-white/95 dark:bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-cyan-200/50 dark:border-cyan-500/20 shadow-[0_8px_20px_rgba(0,0,0,0.04)] text-[10px] md:text-xs font-mono font-bold text-black dark:text-cyan-300 hidden md:flex items-center gap-2 hover:bg-white dark:hover:bg-white/15 transition-all pointer-events-none"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
                </div>
                <span>Tissue Precision Sync</span>
              </div>
            </motion.div>

            {/* Next Available Booking Overlay */}
            <motion.div 
              style={{ transform: isMobile ? 'none' : 'translateZ(110px)' }}
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-4 right-2 sm:top-2 sm:right-[-5px] sm:bottom-auto w-36 sm:w-44 p-3 sm:p-4 bg-white/95 dark:bg-[#0f0f23]/90 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-2xl shadow-[0_12px_24px_rgba(15,23,42,0.06)] flex flex-col gap-1 z-30 select-none pointer-events-none"
            >
              <div className="flex items-center gap-1 mb-0.5">
                <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-600 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] text-violet-600 dark:text-violet-400 font-extrabold uppercase tracking-widest font-mono">
                  Live Clinic Free Slot
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white tracking-tight">Today, 04:30 PM</p>
              <div className="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden relative">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.6, delay: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
                />
              </div>
            </motion.div>

          </motion.div>

          {/* Soft floor shadow */}
          <div className="absolute bottom-[-5%] sm:bottom-[-10%] w-[65%] sm:w-[75%] h-6 sm:h-10 bg-gradient-to-r from-violet-400/8 via-indigo-300/4 to-cyan-400/8 filter blur-[15px] sm:blur-[20px] pointer-events-none rounded-full" />

        </div>

      </motion.div>
    </section>
  );
}
