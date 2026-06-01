import { useState, useEffect } from 'react';
import { Anchor, Stethoscope, Sparkles, Smile, Sparkle, Gem, Calendar, Clock, DollarSign, ChevronRight, X, Loader } from 'lucide-react';
import { DentalService } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTilt3D } from '../hooks/useTilt3D';

interface ServicesProps {
  onBookSpecialty: (treatmentName: string) => void;
}

// Map string icon names to Lucide react components safely
const IconMapper = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Sparkle':
      return <Sparkle className={className} />;
    case 'Gem':
      return <Gem className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

// Individual tilt card wrapper component
function TiltServiceCard({ 
  service, 
  onSelect, 
  index 
}: { 
  service: DentalService; 
  onSelect: (s: DentalService) => void; 
  index: number;
}) {
  const { ref, tiltStyle, shineStyle, tiltProps } = useTilt3D(12, true);

  return (
    <motion.div
      id={`service-card-${service.id}`}
      initial={{ opacity: 0, y: 45, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      <div
        ref={ref}
        {...tiltProps}
        onClick={() => onSelect(service)}
        style={tiltStyle}
        className="group relative rounded-[32px] p-6 backdrop-blur-xl border border-white/80 dark:border-white/8 flex flex-col items-start gap-4 cursor-pointer text-left bg-white/45 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-500 overflow-hidden h-full"
      >
        {/* Holographic shine overlay */}
        <div 
          className="absolute inset-0 rounded-[32px] pointer-events-none transition-opacity duration-300 z-20"
          style={shineStyle}
        />

        {/* Floating glow behind card on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/8 via-pink-400/2 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Animated Interactive Icon Wrapper */}
        <div className="relative w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 group-hover:bg-gradient-to-tr group-hover:from-purple-600 group-hover:to-blue-500 flex items-center justify-center text-purple-500 group-hover:text-white shadow-xs group-hover:scale-110 transition-all duration-300 z-10">
          <IconMapper name={service.iconName} className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-1.5 flex-1 select-none relative z-10">
          <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {service.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3">
            {service.description}
          </p>
        </div>

        <div className="w-full pt-4 border-t border-slate-100 dark:border-white/8 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-blue-500 font-mono mt-2 relative z-10">
          <span>Learn more</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Services({ onBookSpecialty }: ServicesProps) {
  const [services, setServices] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch('/api/services');
        const json = await response.json();
        if (json.success && json.data) {
          setServices(json.data);
        } else {
          throw new Error('API failed to provide database');
        }
      } catch (err) {
        console.warn('Backend services API unreachable, mounting local structured fallback:', err);
        // Fallback structures reflecting exact same schema
        setServices([
          {
            id: 'implants',
            title: 'Dental Implants',
            description: 'Biomimetic titanium-grade restorations engineered to match biological bone structures for look, durability, and function.',
            iconName: 'Anchor',
            details: [
              'Pure surgical-grade titanium structures',
              'Advanced computer-guided guided placements',
              'Custom ceramic crowns with natural optical dispersion',
              'High bone-merging stability rate (99.2%)'
            ],
            duration: '60 - 90 mins (Per Implant)',
            avgCost: '$1,800 - $3,500'
          },
          {
            id: 'root-canal',
            title: 'Root Canal',
            description: 'Microscopic and pain-free endodontics designed to purge infection, secure biological structures, and restore complete health.',
            iconName: 'Stethoscope',
            details: [
              'Advanced high-magnification surgical micro-lenses',
              'Ultra-precise sonic irrigation disinfection',
              'Silent thermal thermoplastic fillings',
              'Virtually zero discomfort with state-of-the-art anesthesia'
            ],
            duration: '45 - 60 mins',
            avgCost: '$750 - $1,200'
          },
          {
            id: 'whitening',
            title: 'Teeth Whitening',
            description: 'Futuristic smart-laser light treatment designed to gently lift active stains without creating enamel, tissue, or nerve sensitivity.',
            iconName: 'Sparkles',
            details: [
              'Therapeutic laser light accelerated formula',
              'Personalized protective gingival barriers',
              'Gains up to 8-10 natural shades in single session',
              'Reinforced with calcium desensitizing minerals'
            ],
            duration: '45 mins',
            avgCost: '$299 - $499'
          },
          {
            id: 'makeover',
            title: 'Smile Makeover',
            description: 'A completely customized cosmetic design tailored geometrically to your facial contours, lips, and natural speech flow.',
            iconName: 'Smile',
            details: [
              'Complete digital smile design (DSD) modeling simulation',
              'Handcrafted porcelain thin-core veneers',
              'Bespoke laser crown lengthening for high-lip lines',
              'Pre-visualized 3D mockup trials before physical bonding'
            ],
            duration: 'Multiple sessions',
            avgCost: 'Custom Plan'
          },
          {
            id: 'invisalign',
            title: 'Invisalign Orthodontics',
            description: 'SmartTrack polyurethane orthodontic aligners that gently slide teeth into alignment without noticeable metal components.',
            iconName: 'Sparkle',
            details: [
              'Iterative digital 3D scans - no messy putty',
              'Ultra thin, crystal clear, food-friendly removable wear',
              'Bi-weekly gradual structural guidance cycles',
              'Integrated SmartForce attachments for difficult shifts'
            ],
            duration: 'Visit every 4-6 weeks',
            avgCost: '$3,200 - $5,800'
          },
          {
            id: 'cosmetic',
            title: 'Cosmetic Dentistry',
            description: 'Expert ceramic bonding, custom micro-contouring, and aesthetic enamel scuplting designed to perfect small visual discrepancies.',
            iconName: 'Gem',
            details: [
              'Minimally invasive composite cosmetic veneers',
              'Painless laser-guided structural tissue contouring',
              'Micro-abrasion treatment for enamel color spots',
              'Immediate same-day physical smile modifications'
            ],
            duration: '30 - 60 mins',
            avgCost: '$150 - $600'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-white/20 dark:bg-[#0a0a1a] transition-colors duration-500">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[30%] right-[10%] w-[380px] h-[380px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-40 select-none pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[420px] h-[420px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-40 select-none pointer-events-none animate-pulse-slow" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.2em] w-fit">
            ✦ Core Clinical Specialties
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            Precision care, designed around you.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed mt-1">
            From restorative, bio-reconstructive procedures to custom porcelain aesthetics, every treatment structure is executed with futuristic optical tools under quiet, relaxing conditions.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
            <span className="text-slate-500 font-mono text-xs">Querying database structures...</span>
          </div>
        ) : (
          /* Grid of 3D Tilt Glass Cards (Bento Box Aesthetic) */
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-fr">
            {services.map((service, index) => {
              // Dynamic Premium Bento Box logic
              let spanClass = "col-span-1 md:col-span-3 lg:col-span-4"; 
              
              // Create an elegant, masonry-like spanning pattern
              const patternIndex = index % 7;
              if (patternIndex === 0) {
                spanClass = "col-span-1 md:col-span-6 lg:col-span-8"; // Large feature block
              } else if (patternIndex === 1) {
                spanClass = "col-span-1 md:col-span-3 lg:col-span-4"; // Side block
              } else if (patternIndex >= 2 && patternIndex <= 4) {
                spanClass = "col-span-1 md:col-span-2 lg:col-span-4"; // 3 equal blocks row
              } else if (patternIndex === 5) {
                spanClass = "col-span-1 md:col-span-3 lg:col-span-4"; // Side block
              } else if (patternIndex === 6) {
                spanClass = "col-span-1 md:col-span-6 lg:col-span-8"; // Large feature block right
              }

              return (
                <div key={service.id} className={spanClass}>
                  <TiltServiceCard
                    service={service}
                    onSelect={setSelectedService}
                    index={index}
                  />
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Dynamic Overlay Detail Popout */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 35 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                boxShadow: '0 50px 100px -20px rgba(124, 58, 237, 0.32), 0 0 50px rgba(139, 92, 246, 0.15)'
              }}
              exit={{ scale: 0.94, opacity: 0, y: 35 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-[32px] p-6 md:p-8 backdrop-blur-2xl border-2 border-white dark:border-white/10 bg-white/95 dark:bg-[#0f0f23]/95 z-10 overflow-hidden"
            >
              {/* Internal subtle glow rings */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/2 to-transparent pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-400/10 rounded-full blur-[40px] pointer-events-none" />
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                id="close-treatment-detail"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <IconMapper name={selectedService.iconName} className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-2xl font-black font-display text-slate-800 tracking-tight">
                    {selectedService.title}
                  </h4>
                  <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">For Your Dentist Premium Series</span>
                </div>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                {selectedService.description}
              </p>

              {/* Dynamic treatment stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50/50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/8 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Duration</span>
                    <span className="text-slate-700 text-xs sm:text-sm font-semibold">{selectedService.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Estimate Guide</span>
                    <span className="text-slate-700 text-xs sm:text-sm font-semibold">{selectedService.avgCost}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">What is included</span>
                <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
                  {selectedService.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedService(null)}
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Close Panel
                </button>
                <button
                  onClick={() => {
                    onBookSpecialty(selectedService.title);
                    setSelectedService(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-sm shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  Book Treatment
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
