import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, X, ZoomIn } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// Import our high-quality generated assets
import receptionImg from '../assets/images/clinic_reception_futuristic_1779863214963.png';
import treatmentImg from '../assets/images/clinic_treatment_room_advanced_1779863234649.png';

export default function Gallery() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { socket } = useSocket();

  const [galleryItems, setGalleryItems] = useState<any[]>([
    {
      id: 'gallery-reception',
      title: 'Minimalist Reception Sphere',
      category: 'Clinic Interior',
      imageUrl: receptionImg,
      spanClasses: 'md:col-span-2 md:row-span-2'
    },
    {
      id: 'gallery-dentist',
      title: 'Expert Microscopic Scaling',
      category: 'Treatment',
      imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop',
      spanClasses: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'gallery-patient',
      title: 'Joyful Post-op Results',
      category: 'Patient Journey',
      imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=600&auto=format&fit=crop',
      spanClasses: 'md:col-span-1 md:row-span-2'
    },
    {
      id: 'gallery-treatment',
      title: 'For Your Dentist Robot-Arm Suite',
      category: 'Surgery Pod',
      imageUrl: treatmentImg,
      spanClasses: 'md:col-span-2 md:row-span-1'
    },
    {
      id: 'gallery-interior',
      title: 'Aesthetic Light Corridors',
      category: 'Architecture',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop',
      spanClasses: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'gallery-equipment',
      title: 'Smart Laser Thermal Scalpel',
      category: 'Surgical Tools',
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop',
      spanClasses: 'md:col-span-1 md:row-span-1'
    }
  ]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/admin/gallery');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setGalleryItems(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchGallery();

    if (socket) {
      socket.on('gallery_update', fetchGallery);
      return () => { socket.off('gallery_update', fetchGallery); };
    }
  }, [socket]);

  return (
    <section id="gallery" className="py-24 relative bg-[#F8FAFC] dark:bg-[#0a0a1a] transition-colors duration-500">
      <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[100px] opacity-40 select-none pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-40 select-none pointer-events-none animate-pulse-slow" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        {/* Gallery Title Block */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-purple-100/50 dark:border-purple-500/20 mb-3">
            ✦ Inside Our Clinic
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            Translucent spaces for transparent care.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg max-w-2xl mt-2 leading-relaxed">
            Step into the For Your Dentist environment. We crafted an atmosphere with light oak materials, clean glass walls, micro-filtered air, and organic soundscapes.
          </p>
        </div>

        {/* Gallery Masonry Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[220px]">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              id={`gallery-item-${item.id}`}
              initial={{ opacity: 0, y: 45, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ 
                y: -6,
                boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.12)'
              }}
              transition={{ 
                type: 'spring',
                stiffness: 180,
                damping: 16,
                delay: idx * 0.05
              }}
              onClick={() => setActiveImage(item.imageUrl)}
              className={`group relative rounded-[32px] overflow-hidden cursor-pointer shadow-xs border border-white/80 dark:border-white/10 ${item.spanClasses}`}
            >
              <motion.img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover filter group-hover:brightness-[0.85]"
              />

              {/* Hover aesthetic curtain layout */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />

              {/* Content hidden till hover */}
              <div className="absolute bottom-4 left-4 right-4 z-10 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-between text-white pointer-events-none">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase block font-semibold">
                    {item.category}
                  </span>
                  <p className="text-sm font-bold font-display leading-tight truncate">
                    {item.title}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Magnified Image Dialog */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden z-10 border border-slate-700/50 bg-slate-900"
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/85 text-slate-300 hover:text-white hover:scale-105 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={activeImage}
                alt="Clinic High Definition Review"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[85vh] object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
