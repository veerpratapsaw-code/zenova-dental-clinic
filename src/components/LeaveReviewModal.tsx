import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { usePatientAuth } from '../context/PatientAuthContext';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaveReviewModal({ isOpen, onClose }: LeaveReviewModalProps) {
  const { patient } = usePatientAuth();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState(patient?.name || '');
  const [treatment, setTreatment] = useState('General Consultation');
  const [quote, setQuote] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const treatments = [
    'General Consultation',
    'Dental Implants',
    'Root Canal',
    'Teeth Whitening',
    'Smile Makeover',
    'Invisalign Orthodontics',
    'Cosmetic Dentistry',
    'Emergency Care'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !quote) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          rating,
          treatmentRecieved: treatment,
          quote,
          avatarUrl: patient?.profilePic || undefined
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset form after closing
          setTimeout(() => {
            setSuccess(false);
            setRating(5);
            setAuthor(patient?.name || '');
            setQuote('');
            setTreatment('General Consultation');
          }, 500);
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0f0f23] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-10"
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Share Your Experience</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Thank you!</h4>
                <p className="text-slate-500 dark:text-slate-400">Your feedback has been submitted successfully and is pending review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-100 dark:border-rose-500/20">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col items-center pb-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">How was your visit?</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'fill-transparent text-slate-300 dark:text-slate-600'
                          } transition-colors`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Name *</label>
                  <input 
                    type="text" 
                    required
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 dark:text-white text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Treatment Received</label>
                  <select
                    value={treatment}
                    onChange={e => setTreatment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 dark:text-white text-sm appearance-none"
                  >
                    {treatments.map(t => (
                      <option key={t} value={t} className="dark:bg-[#0f0f23]">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Review *</label>
                  <textarea 
                    required
                    value={quote}
                    onChange={e => setQuote(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 dark:text-white text-sm resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/25"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Review</>}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
