import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import ScrollProgress from '../components/ScrollProgress';
import PageLoader from '../components/PageLoader';
import AIChatbot from '../components/AIChatbot';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Gallery from '../components/Gallery';
import Transformation from '../components/Transformation';
import Doctors from '../components/Doctors';
import Testimonials from '../components/Testimonials';
import BookingForm from '../components/BookingForm';
import MapSection from '../components/MapSection';
import Footer from '../components/Footer';

export default function Home() {
  const [preselectedTreatment, setPreselectedTreatment] = useState<string>('');

  const handleScrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      const offset = 80;
      const pos = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: pos
      });
    }
  };

  const handleBookNow = () => {
    setPreselectedTreatment('');
    handleScrollToSection('contact');
  };

  const handleExplore = () => {
    handleScrollToSection('services');
  };

  const handleBookSpecialty = (treatment: string) => {
    setPreselectedTreatment(treatment);
    handleScrollToSection('contact');
  };

  const handleClearPreselect = () => {
    setPreselectedTreatment('');
  };

  return (
    <>
      {/* Global Premium Effects Layer for Home Page */}
      <PageLoader />
      {/* Custom cursor removed */}
      <ScrollProgress />
      {/* <AIChatbot /> Temporarily disabled as per user request */}

      {/* 1. Header Navbar */}
      <Navbar onBookClick={handleBookNow} />

      {/* 2. Fullscreen Title Hero */}
      <div className="antigravity">
        <Hero onBookClick={handleBookNow} onExploreClick={handleExplore} />
      </div>

      {/* 3. Core Specialty Treatments Section wrapped in Cinematic Viewport transitions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Services onBookSpecialty={handleBookSpecialty} />
      </motion.div>

      {/* 4. Inside Clinic Photo Gallery wrapped in Cinematic Viewport transitions */}
      <motion.div
        className="antigravity"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Gallery />
      </motion.div>

      {/* 5. Interactive Before/After Transformation Slider */}
      <Transformation />

      {/* 6. Medical Staff Board wrapped in Cinematic Viewport transitions */}
      <motion.div
        className="antigravity"
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <Doctors onDoctorConsult={handleBookSpecialty} />
      </motion.div>

      {/* 7. Client Testimonial Carousel wrapped in Cinematic Viewport transitions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Testimonials />
      </motion.div>

      {/* 8. Full-stack Booking desk wrapped in Cinematic Viewport transitions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <BookingForm 
          preselectedTreatment={preselectedTreatment} 
          onClearPreselect={handleClearPreselect} 
        />
      </motion.div>

      {/* 9. Cyber Maps Location Section wrapped in Cinematic Viewport transitions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <MapSection />
      </motion.div>

      {/* 10. Core brand Footer */}
      <div className="antigravity">
        <Footer />
      </div>
    </>
  );
}
