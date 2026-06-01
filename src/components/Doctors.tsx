import { motion } from 'motion/react';
import { Mail, CalendarRange, Sparkles, Award, ShieldCheck, GraduationCap } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorsProps {
  onDoctorConsult: (doctorName: string) => void;
}

export default function Doctors({ onDoctorConsult }: DoctorsProps) {
  
  const specialists: Doctor[] = [
    {
      id: 'doc-vance',
      name: 'Dr. Alexander Vance',
      role: 'Master Dental Implantologist',
      experience: '16 Years Practice',
      imageURL: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop&facepad=2',
      specialty: 'Oral Prosthetics & Biomimetic Restorations',
      education: 'DDS - Columbia University Dental Surgery',
      bio: 'Alexander pioneered low-heat computer-guided drilling techniques to optimize biological bone merging during crown anchors.',
      daysAvailable: ['Mon', 'Tue', 'Thu', 'Fri']
    },
    {
      id: 'doc-mercer',
      name: 'Dr. Evelyn Mercer',
      role: 'Chief Cosmetic Smile Designer',
      experience: '12 Years Practice',
      imageURL: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=400&auto=format&fit=crop&facepad=2',
      specialty: 'Porcelain Micro-Veneers & Digital Smile Design',
      education: 'DDS - Harvard School of Dental Medicine',
      bio: 'Evelyn holds a masters in aesthetic science, specializing in geometrically aligning veneers and lengthening gums to model jaw flow.',
      daysAvailable: ['Tue', 'Wed', 'Thu']
    },
    {
      id: 'doc-thorne',
      name: 'Dr. Rowan Thorne',
      role: 'Certified Invisalign Designer',
      experience: '9 Years Practice',
      imageURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop&facepad=2',
      specialty: '3D Polyurethane Orthodontics & Clear Aligners',
      education: 'DMD - Penn Dental Medicine',
      bio: 'Rowan designs SmartForce movement anchors to facilitate complex shifts safely in teenagers and adult professionals.',
      daysAvailable: ['Mon', 'Wed', 'Fri']
    }
  ];

  return (
    <section id="doctors" className="py-24 relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0a0a1a] transition-colors duration-500">
      <div className="absolute top-[30%] left-[-5%] w-[380px] h-[380px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-35 pointer-events-none select-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[420px] h-[420px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-35 pointer-events-none select-none animate-pulse-slow" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        {/* Title elements */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            ✦ Clinical Specialists
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            Meet the smile architects.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-2xl mt-1">
            Our surgical doctors hold dual accreditations and lecture globally on laser endodontics, computerized smile design, and clear skeletal mechanics.
          </p>
        </div>

        {/* Doctor profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialists.map((doc, idx) => (
            <motion.div
              key={doc.id}
              id={`doctor-card-${doc.id}`}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ 
                y: -12,
                scale: 1.025,
                boxShadow: '0 30px 60px -15px rgba(124, 58, 237, 0.15), 0 0 30px rgba(139, 92, 246, 0.08)'
              }}
              transition={{ 
                type: 'spring',
                stiffness: 180,
                damping: 16,
                delay: idx * 0.08
              }}
              className="group relative rounded-[32px] p-6 backdrop-blur-xl border border-white/80 dark:border-white/8 bg-white/45 dark:bg-white/5 flex flex-col items-center text-center shadow-sm transition-all duration-500 overflow-hidden"
            >
              {/* Soft purple gradient background spotlight on card hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* circular image bordered by a beautiful soft blue glow overlay */}
              <div className="relative w-36 h-36 rounded-full p-1.5 mb-5 bg-radial from-purple-400 to-blue-500 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <div className="absolute inset-0 rounded-full blur-md opacity-20 bg-gradient-to-tr from-purple-400 to-blue-500 group-hover:opacity-75 transition-opacity" />
                <img
                  src={doc.imageURL}
                  alt={doc.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full select-none"
                />
              </div>

              {/* Title & specialty specs */}
              <div className="flex flex-col mb-4">
                <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400 block uppercase tracking-wide">
                  {doc.role}
                </span>
                <h3 className="text-xl font-black font-display text-slate-800 dark:text-white mt-1 leading-tight tracking-tight">
                  {doc.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1 mx-auto bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/8 rounded-md px-2 py-0.5">
                  <Award className="w-3.5 h-3.5 text-purple-500" />
                  {doc.experience}
                </span>
              </div>

              {/* Summary details */}
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed mb-5">
                {doc.bio}
              </p>

              {/* Credentials / academic block */}
              <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/8 text-left flex flex-col gap-2 mb-6">
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-tight">
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{doc.education}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Spec: {doc.specialty}</span>
                </div>
              </div>

              {/* Available Operating Days preview */}
              <div className="w-full pt-4 border-t border-slate-100 dark:border-white/8 flex items-center justify-between mt-auto">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold leading-none">Duty Schedule</span>
                  <div className="flex gap-1 mt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
                      const isActive = doc.daysAvailable.includes(day);
                      return (
                        <span
                          key={day}
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono font-bold transition-colors ${
                            isActive
                              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold border border-purple-200/50 dark:border-purple-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600'
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => onDoctorConsult(doc.name)}
                  className="p-2.5 rounded-xl bg-slate-55 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-blue-500 text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs transition-all hover:shadow-md hover:scale-105"
                  title={`Request direct session with ${doc.name}`}
                  id={`consult-button-${doc.id}`}
                >
                  <CalendarRange className="w-4.5 h-4.5" />
                </button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
