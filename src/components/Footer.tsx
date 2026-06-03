import React, { memo } from 'react';
import { Sparkles, Linkedin, Github, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = 80;
      const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: pos,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="relative bg-[#090D1A] text-slate-300 overflow-hidden border-t border-slate-900/60">
      
      {/* Background soft lighting overlays */}
      <div className="absolute top-[30%] left-[10%] w-[380px] h-[380px] bg-purple-500/10 rounded-full blur-[110px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none select-none" />

      <div className="w-[92%] max-w-7xl mx-auto pt-16 pb-12 relative z-10">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16 text-left">
          
          {/* Logo brand */}
          <div className="lg:col-span-5 flex flex-col items-start gap-4">
            <a 
              href="#home" 
              onClick={(e) => handleFooterLinkClick(e, '#home')} 
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display tracking-tight text-white leading-tight">
                  For Your Dentist
                </span>
                <span className="text-[8px] uppercase tracking-widest font-mono text-purple-400 font-bold leading-none">
                  Dental Clinic
                </span>
              </div>
            </a>
            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mt-1">
              Engineered with modern biocompatible porcelain structures, direct computerized laser whitening, and translucent air filtration systems.
            </p>
            
            {/* Social icons */}
            <div className="flex gap-3.5 mt-2">
              {[
                { icon: Twitter, href: 'https://twitter.com' },
                { icon: Instagram, href: 'https://instagram.com' },
                { icon: Linkedin, href: 'https://linkedin.com' },
                { icon: Github, href: 'https://github.com' }
              ].map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:bg-slate-800 hover:scale-105 hover:border-purple-400/30 transition-all duration-300 cursor-pointer shadow-xs"
                >
                  <soc.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-purple-400 mb-5">
              Rapid Jump Points
            </h4>
            <div className="flex flex-col gap-3 font-medium text-xs sm:text-sm text-slate-400 font-sans">
              {[
                { label: 'Home Entrance', href: '#home' },
                { label: 'Clinical Treatments', href: '#services' },
                { label: 'Interior Gallery', href: '#gallery' },
                { label: 'Smile Transformations', href: '#transformation' },
                { label: 'Staff Dentists', href: '#doctors' },
                { label: 'Inquiry Hotline', href: '#contact' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={(e) => handleFooterLinkClick(e, link.href)}
                  className="hover:text-white hover:translate-x-1.5 transition-all text-left"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/blog"
                className="hover:text-white hover:translate-x-1.5 transition-all text-left mt-2 pt-2 border-t border-slate-800/50 text-cyan-400 font-bold"
              >
                For Your Dentist Journal (Blog)
              </Link>
            </div>
          </div>

          {/* Timing details */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-purple-400 mb-5">
              Service Operations
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm font-medium text-slate-400">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0 animate-ping" />
                <div className="flex flex-col text-left">
                  <span className="text-white font-extrabold">Active Clinical Hours</span>
                  <span className="text-slate-400 mt-0.5 font-semibold">Monday - Friday: 8:00 AM - 7:00 PM</span>
                  <span className="text-slate-400 font-semibold">Saturday Session: 9:00 AM - 2:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-white font-extrabold">Emergency Consultations</span>
                  <span className="text-slate-400 mt-0.5 font-semibold leading-normal">Our trauma and orthodontic surgical coordinators remain on call 24/7.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Divider line */}
        <div className="h-px bg-slate-800/45 w-full mb-8" />

        {/* Bottom credits and copyright disclaimer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500 font-mono font-bold tracking-wider uppercase">
            &copy; {currentYear} For Your Dentist Studio. All Rights Reserved.
          </p>

          {/* Veer Pratap Saw glowing credits in display styling */}
          <div className="flex flex-col items-center md:items-end gap-1 select-none">
            <div className="text-xs font-mono font-semibold tracking-wide text-slate-500">
              Concept, layout & systems engineering
            </div>
            
            <a 
              href="https://github.com/veerpratapsaw-code" 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-black font-display tracking-tight text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 uppercase group cursor-pointer"
            >
              Website Designed & Developed by 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 font-extrabold drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-all animate-pulse">
                Veer Pratap Saw & Om Ashutosh
              </span>
            </a>
          </div>
        </div>

      </div>

    </footer>
  );
}

export default memo(Footer);
