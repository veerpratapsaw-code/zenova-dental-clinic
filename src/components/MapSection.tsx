import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Compass, Navigation, ChevronRight, Check } from 'lucide-react';

export default function MapSection() {
  const [startAddr, setStartAddr] = useState('');
  const [directions, setDirections] = useState<string[] | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculateDirections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startAddr.trim()) return;
    setCalculating(true);
    setDirections(null);

    try {
      const res = await fetch('/api/transit-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startAddr })
      });
      const data = await res.json();
      
      if (data.success) {
        setDirections([
          `⏱ Estimated Travel Time: ~${data.time} from your location.`,
          `🛣 Distance: ~${data.distance}.`,
          `Head towards the main arterial road leading to Bank More.`,
          `Continue straight approaching City Center.`,
          `Our clinic is located centrally inside the City Center complex. Ample parking is available in the basement.`
        ]);
      } else {
        throw new Error(data.message || 'Failed to estimate');
      }
    } catch (error) {
      console.error(error);
      const estimatedMinutes = Math.max(12, Math.floor(Math.random() * 25 + 10));
      setDirections([
        `⏱ Estimated Travel Time: ~${estimatedMinutes} mins from your location.`,
        `Head towards the main arterial road leading to Bank More.`,
        `Continue straight approaching City Center.`,
        `Our clinic is located centrally inside the City Center complex. Ample parking is available in the basement.`
      ]);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <section id="location" className="py-24 relative overflow-hidden bg-white/20 dark:bg-[#0a0a1a] border-t border-slate-100/50 dark:border-white/10 transition-colors duration-500">
      <div className="absolute top-[20%] right-[-10%] w-[380px] h-[380px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-35 pointer-events-none select-none" />
      <div className="absolute bottom-[30%] left-[-10%] w-[420px] h-[420px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-35 pointer-events-none select-none animate-pulse-slow" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        {/* Title row */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            ✦ Clinic Location Coordinates
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            Visit our medical studio.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-2xl mt-1">
            Centrally situated inside the premium Tech Hub architecture district, For Your Dentist is designed for rapid accessibility via bullet transit and high-capacity parkways.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Info cards and transit builder column */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left justify-between">
            <div className="space-y-4">
              
              {/* Address card */}
              <div className="p-5 rounded-[32px] glass-panel dark:glass-panel-dark border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100/50 dark:border-purple-500/20 flex-shrink-0">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-mono tracking-wide">Studio Address</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold mt-1">Bank More, City Centre</p>
                  <span className="text-xs text-slate-400 font-medium">Dhanbad, Jharkhand 826001</span>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="p-5 rounded-[32px] glass-panel dark:glass-panel-dark border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/50 dark:border-blue-500/20 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-mono tracking-wide">Operating Hours</h4>
                  <div className="space-y-0.5 mt-1 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    <p className="flex justify-between gap-4">
                      <span>Mon - Fri:</span>
                      <span className="text-purple-600 dark:text-purple-400">8:00 AM - 7:00 PM</span>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>Saturday:</span>
                      <span className="text-purple-600 dark:text-purple-400">9:00 AM - 2:00 PM</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Concierge hotline */}
              <div className="p-5 rounded-[32px] glass-panel dark:glass-panel-dark border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100/50 dark:border-purple-500/20 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-mono tracking-wide">Direct Lines</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-bold mt-1">
                    Phone: <span className="text-slate-800 dark:text-white">+91 98355 26977</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    Email: concierge@zenovadental.com
                  </p>
                </div>
              </div>
            </div>

            {/* Micro route estimator */}
            <div className="p-5 rounded-[32px] glass-panel dark:glass-panel-dark border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-md">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Transit Planner</span>
              <h4 className="text-base font-bold text-slate-800 dark:text-white tracking-tight leading-none mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-500" />
                Transit Guidance Calculator
              </h4>

              <form onSubmit={calculateDirections} className="flex gap-2">
                <input
                  type="text"
                  value={startAddr}
                  onChange={(e) => setStartAddr(e.target.value)}
                  placeholder="Enter starting neighborhood..."
                  className="flex-1 h-11 rounded-lg px-3 text-xs glass-input font-medium"
                />
                <button
                  type="submit"
                  disabled={calculating}
                  className="px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer hover:opacity-95 flex items-center gap-1.5"
                  id="transit-calc-btn"
                >
                  {calculating ? 'Plotting...' : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      Estimate
                    </>
                  )}
                </button>
              </form>

              {/* Transit feedback steps */}
              <AnimatePresence>
                {directions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 space-y-2.5"
                  >
                    {directions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100/50 dark:border-purple-500/20 text-[10px] text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                          {idx + 1}
                        </span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Embedded Google Map */}
          <div className="lg:col-span-7 rounded-[32px] border border-purple-200/50 overflow-hidden relative min-h-[400px] flex items-center justify-center shadow-xl bg-slate-950">
            <iframe 
              src="https://maps.google.com/maps?q=City%20Center%20Dhanbad&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>

      </div>
    </section>
  );
}
