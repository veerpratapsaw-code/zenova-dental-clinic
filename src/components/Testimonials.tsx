import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, Star, Heart, PenLine } from 'lucide-react';
import LeaveReviewModal from './LeaveReviewModal';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  treatmentRecieved: string;
  avatarUrl?: string;
}

const staticTestimonials: Testimonial[] = [
  {
    id: 'test-1',
      quote: "The advanced diagnostics scanned my dental structure in seconds. The custom Invisalign clear guides were delivered inside 3 days, and my realignment program finished 3 weeks ahead of estimate! Absolutely seamless futuristic clinical experience.",
      author: 'Anjali Sharma',
      role: 'Creative Director, Omniverse Labs',
      rating: 5,
      treatmentRecieved: 'Invisalign Orthodontics',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'test-2',
      quote: "I was extremely anxious about my root canal, but Dr. Mercer completed it under microscopic guidance completely pain-free! The ambient ceiling monitors and warm noise-cancelling headphones made me forget I was undergoing a surgical procedure.",
      author: 'Rahul Verma',
      role: 'Principal Developer, Apex Systems',
      rating: 5,
      treatmentRecieved: 'Microscopic Root Canal',
      avatarUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'test-3',
      quote: "My custom porcelain micro-veneers look exceptionally biological. They modeled the enamel shade dynamically to replicate the light-absorbing depth of natural teeth. Designing templates before bonding saved weeks of guesswork. Five Stars!",
      author: 'Priya Patel',
      role: 'Exhibition Architect, Museum of Tomorrow',
      rating: 5,
      treatmentRecieved: 'Bespoke Smile Makeover',
      avatarUrl: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=150&auto=format&fit=crop'
    }
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('/api/feedback');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const mapped = data.data.map((f: any) => ({
            id: f.id || f._id,
            quote: f.quote,
            author: f.author,
            role: f.role || 'Patient',
            rating: f.rating,
            treatmentRecieved: f.treatmentRecieved,
            avatarUrl: f.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop'
          }));
          setDynamicTestimonials(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic testimonials', error);
      }
    };
    fetchFeedbacks();
  }, []);

  const allTestimonials = [...dynamicTestimonials, ...staticTestimonials];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? allTestimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === allTestimonials.length - 1 ? 0 : prev + 1));
  };

  const current = allTestimonials[activeIdx];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-white/20 dark:bg-[#0a0a1a] transition-colors duration-500">
      <div className="absolute top-[30%] right-[-5%] w-[420px] h-[420px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-35 pointer-events-none select-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[380px] h-[380px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-35 pointer-events-none select-none animate-pulse-slow" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        {/* Title Elements */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            ✦ Client Journeys
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            Real stories, radiant outcomes.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-2xl mt-1">
            Read objective testimonies from digital experts, designers, and corporate executives who trusted our clinical staff with their facial aesthetics.
          </p>
        </div>

        {/* Carousel slide shell */}
        <div className="max-w-4xl mx-auto relative w-full px-4 md:px-12 flex flex-col items-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-[32px] p-6 md:p-12 backdrop-blur-xl border border-white/80 dark:border-white/8 shadow-2xl bg-white/45 dark:bg-white/5 text-left relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/3 via-[#00f2fe]/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="absolute top-6 right-6 p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 block shadow-xs border border-purple-100/50 dark:border-purple-500/20 relative z-10">
                <Quote className="w-6 h-6 animate-pulse" />
              </div>

              {/* Star review scores */}
              <div className="flex items-center gap-1 mb-5">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Patient review body text */}
              <p className="text-slate-700 dark:text-slate-200 font-medium text-base sm:text-lg md:text-xl leading-relaxed italic mb-8 relative">
                "{current.quote}"
              </p>

              {/* Author clinical info */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-slate-150 dark:border-white/10 w-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-500/30 shadow-sm">
                    <img
                      src={current.avatarUrl}
                      alt={current.author}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight block">
                      {current.author}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-none">
                      {current.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/8">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Care: <span className="text-purple-600 dark:text-purple-400 font-bold">{current.treatmentRecieved}</span>
                  </span>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Carousel slide indicators and paging trigger buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="w-11 h-11 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:shadow-md cursor-pointer hover:border-purple-300 active:scale-95 transition-all flex items-center justify-center"
              aria-label="Previous testimonial"
              id="testimonial-prev-btn"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* dot controllers */}
            <div className="flex gap-2">
              {allTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeIdx === i ? 'w-8 bg-purple-600' : 'bg-slate-300 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to slide ${i+1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-11 h-11 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:shadow-md cursor-pointer hover:border-purple-300 active:scale-95 transition-all flex items-center justify-center"
              aria-label="Next testimonial"
              id="testimonial-next-btn"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-12">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <PenLine className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Write a Review
            </button>
          </div>

        </div>

      </div>

      <LeaveReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
