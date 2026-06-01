import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Calendar, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onBookClick: () => void;
}

export default function Navbar({ onBookClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, toggleTheme, isDark } = useTheme();
  const { patient, isLoading } = usePatientAuth();
  const { user: adminUser } = useAuth();

  const desktopMenuItems = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Doctors', href: '#doctors' },
    { label: 'Contact', href: '#contact' },
  ];

  const mobileMenuItems = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Inside Clinic', href: '#gallery' },
    { label: 'Transformation', href: '#transformation' },
    { label: 'Doctors', href: '#doctors' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Background morph
      setIsScrolled(window.scrollY > 30);

      // Simple active section monitor
      const sections = ['home', 'services', 'gallery', 'transformation', 'doctors', 'testimonials', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const offset = 80; // height of floating navbar
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <nav 
        id="navbar-core"
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-500 rounded-2xl ${
          isScrolled 
            ? 'glass-panel shadow-lg py-3 rgba(255,255,255,0.7) border-sky-200/40' 
            : 'bg-transparent py-5 border-transparent'
        }`}
      >
        <div className="px-6 flex items-center justify-between">
          {/* Logo Brand */}
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-md group-hover:shadow-purple-400/30 transition-all duration-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-display tracking-tight text-slate-800 dark:text-white leading-tight">
                For Your <span className="font-light text-slate-400">Dentist</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {desktopMenuItems.map((item) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'text-purple-600 font-semibold' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-purple-50 dark:bg-purple-500/10 border border-purple-100/50 dark:border-purple-500/20 rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right side: Dark mode toggle + Booking Button */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="relative w-[52px] h-[28px] rounded-full theme-toggle"
            >
              <div className="theme-toggle-thumb flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-3 h-3 text-white" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-800" />
                )}
              </div>
            </button>

            {/* Blog Link */}
            <Link
              to="/blog"
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Blog
            </Link>

            {/* Patient Portal / Login Link */}
            {!isLoading && (
              <Link
                to={patient ? '/patient/dashboard' : '/patient/login'}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                {patient ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <span>Portal</span>
                  </>
                ) : (
                  'Login'
                )}
              </Link>
            )}

            {/* Admin Portal Link */}
            {adminUser && (
              <Link
                to="/admin/dashboard"
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all border border-purple-200 dark:border-purple-500/30 ml-2"
              >
                Admin
              </Link>
            )}

            {/* Booking Button */}
            <button
              onClick={onBookClick}
              id="nav-action-booking"
              className="relative overflow-hidden group px-6 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white dark:border-white/10 shadow-sm font-semibold text-sm text-purple-600 dark:text-purple-400 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer transition-all duration-300"
            >
              <span className="relative flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Visit
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dynamic Overlay Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-[4%] w-[92%] glass-panel bg-white/95 dark:bg-[#0a0a1a]/95 backdrop-blur-3xl rounded-2xl z-40 p-6 shadow-xl border-purple-100/30 lg:hidden block overflow-y-auto max-h-[85vh]"
          >
            <div className="flex flex-col gap-4">
              {mobileMenuItems.map((item) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 font-bold border border-purple-100/50 dark:border-purple-500/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <hr className="border-slate-100 dark:border-white/10 my-1" />
              <Link
                to="/blog"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Our Blog
              </Link>
              <Link
                to={patient ? '/patient/dashboard' : '/patient/login'}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                {patient ? 'Patient Portal' : 'Patient Login'}
              </Link>
              {adminUser && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onBookClick();
                }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-md active:scale-95 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Book Visit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
