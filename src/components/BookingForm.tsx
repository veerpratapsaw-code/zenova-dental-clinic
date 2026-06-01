import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Phone, Mail, User, BookOpen, MessageSquare, AlertCircle, CheckCircle2, Loader2, Landmark, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiResponse, Appointment, Inquiry } from '../types';
import { usePatientAuth } from '../context/PatientAuthContext';
import PriorityUpgrade, { PriorityTier } from './PriorityUpgrade';

interface BookingFormProps {
  preselectedTreatment?: string;
  onClearPreselect?: () => void;
}

export default function BookingForm({ preselectedTreatment = '', onClearPreselect }: BookingFormProps) {
  const [activeTab, setActiveTab] = useState<'appointment' | 'contact'>('appointment');
  const [priorityTier, setPriorityTier] = useState<PriorityTier>('standard');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    treatmentType: '',
    preferredDate: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successData, setSuccessData] = useState<Appointment | null>(null);
  const [contactSuccessData, setContactSuccessData] = useState<Inquiry | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // VIP Payment State
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { patient } = usePatientAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prefill form if patient is logged in
  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || patient.name,
        email: prev.email || patient.email,
        phone: prev.phone || patient.phone
      }));
    }
  }, [patient]);

  // Synchronize dynamic pre-selections from other parts of the clinic
  useEffect(() => {
    if (preselectedTreatment) {
      setActiveTab('appointment');
      setFormData(prev => ({ ...prev, treatmentType: preselectedTreatment }));
    }
  }, [preselectedTreatment]);

  const treatmentsList = [
    'Dental Implants',
    'Root Canal',
    'Teeth Whitening',
    'Smile Makeover',
    'Invisalign Orthodontics',
    'Cosmetic Dentistry',
    'General Physical Assessment'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Prevent Sundays (0)
    if (name === 'preferredDate' && value) {
      const selectedDate = new Date(value);
      if (selectedDate.getDay() === 0) { // 0 is Sunday
        setErrors(['Our clinic is closed on Sundays. Please select a Monday-Saturday slot.']);
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear inline errors on text alters
    if (errors.length > 0) setErrors([]);
  };

  // Calculate date constraints (Min: Today, Max: 2 weeks forward)
  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const endpoint = activeTab === 'appointment' ? '/api/appointments' : '/api/contact';
    
    let bodyPayload: any = activeTab === 'appointment' 
      ? {
        ...formData,
        priorityLevel: priorityTier
      }
      : { name: formData.name, email: formData.email, message: formData.message };

    // Attach patient ID if logged in and booking an appointment
    if (activeTab === 'appointment' && patient) {
      bodyPayload = { ...bodyPayload, patientId: patient.id };
    }

    if (activeTab === 'appointment' && priorityTier !== 'standard') {
      // VIP Payment Flow Intercept
      setShowPaymentGateway(true);
      setLoading(false);
      return;
    }

    executeSubmission(endpoint, bodyPayload);
  };

  const executeSubmission = async (endpoint: string, bodyPayload: any) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const json = await response.json();

      if (response.ok && json.success && json.data) {
        if (activeTab === 'appointment') {
          setSuccessData(json.data as Appointment);
        } else {
          setContactSuccessData(json.data as Inquiry);
        }
        
        // Wipe local form storage
        setFormData({
          name: patient ? patient.name : '',
          phone: patient ? patient.phone : '',
          email: patient ? patient.email : '',
          treatmentType: '',
          preferredDate: '',
          message: ''
        });
        setPriorityTier('standard');
        if (onClearPreselect) onClearPreselect();
      } else {
        setErrors(json.errors || [json.message || 'Server encountered validation issues']);
      }
    } catch (err) {
      console.error('Submission encounter error:', err);
      setErrors(['Failed to establish synchronization with the Zenova Secure Server. Please check your network connection.']);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      
      // Auto close and submit after 1.5 seconds of success screen
      setTimeout(() => {
        setShowPaymentGateway(false);
        setPaymentSuccess(false);
        
        // Construct payload and submit!
        const endpoint = '/api/appointments';
        let bodyPayload: any = {
          ...formData,
          priorityLevel: priorityTier
        };
        if (patient) {
          bodyPayload.patientId = patient.id;
        }
        executeSubmission(endpoint, bodyPayload);
      }, 1500);
    }, 2500); // 2.5 second simulated processing time
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-white/20 dark:bg-[#0a0a1a] border-t border-slate-100/30 dark:border-white/5">
      <div className="absolute top-[30%] left-[-10%] w-[400px] h-[400px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-35 select-none pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-35 select-none pointer-events-none" />

      <div className="w-[92%] max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Aesthetic Promo Text block Column */}
          <div className="lg:col-span-5 text-left flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-purple-100/50 dark:border-purple-500/20 self-start">
              ✦ Seamless Direct Scheduling
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-none">
              Connect with our medical staff.
            </h2>
            
            <p className="text-slate-500 font-medium text-base leading-relaxed mt-2">
              Fill out our secure, validated portal to either book an instant clinical consultation or send a direct support inquiry to our front-counter team.
            </p>

            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-100/50 dark:border-purple-500/20 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Responsive Routing Desk</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">Appointments trigger instant automated Nodemailer G-SMTP updates to our clinical desk.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100/50 dark:border-blue-500/20 shadow-xs">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Flexible Insurance Billing</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">We support active health pre-approvals and premium corporate wellness package scheduling.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Interactive Card Column */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ scale: 0.94, opacity: 0, y: 45 }}
            whileInView={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              boxShadow: '0 25px 60px -15px rgba(124, 58, 237, 0.12), 0 0 30px rgba(139, 92, 246, 0.05)'
            }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              whileHover={{ 
                y: -8, 
                scale: 1.015,
                boxShadow: '0 40px 80px -20px rgba(124, 58, 237, 0.22), 0 0 45px rgba(139, 92, 246, 0.18)' 
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[32px] p-6 sm:p-8 backdrop-blur-2xl border border-white dark:border-white/10 bg-white/55 dark:bg-[#0f0f23]/80 relative transition-all duration-550 overflow-hidden group shadow-xl"
            >
              {/* Premium glowing background ambient spot on card hover */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.12)_0%,transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-800 pointer-events-none" />
              
              <div className="mb-6 text-left flex justify-between items-start flex-wrap gap-4 relative z-10">
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                    Clinical Portal Desk
                  </h3>
                  <span className="text-xs font-mono text-slate-400 font-semibold uppercase">Protected by 256-Bit SSL Encryption</span>
                </div>
              </div>

              {/* Secure Tab Selection Slider */}
              <div className="grid grid-cols-2 bg-slate-100/80 dark:bg-white/5 p-1.5 rounded-2xl mb-6 border border-slate-200/50 dark:border-white/10 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('appointment');
                    setErrors([]);
                  }}
                  className={`py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-[0.1em] transition-all cursor-pointer ${
                    activeTab === 'appointment'
                      ? 'bg-white dark:bg-[#1a1a3a] text-purple-600 dark:text-purple-400 shadow-md border border-slate-200/20 dark:border-white/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Book Care Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('contact');
                    setErrors([]);
                  }}
                  className={`py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-[0.1em] transition-all cursor-pointer ${
                    activeTab === 'contact'
                      ? 'bg-white dark:bg-[#1a1a3a] text-purple-600 dark:text-purple-400 shadow-md border border-slate-200/20 dark:border-white/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  General Inquiry
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-left relative z-10">
                
                {/* Error Banner */}
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-start gap-2.5 text-xs font-semibold"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block font-bold">Please correct the following:</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wide flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Patient Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Om Ashutosh"
                      className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white/45 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-400 text-sm font-medium focus:outline-none cursor-text transition-colors"
                      required
                    />
                  </div>

                  {/* Email address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wide flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. patient@gmail.com"
                      className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white/45 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-400 text-sm font-medium focus:outline-none cursor-text transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Conditional Fields depending on selected Mode */}
                {activeTab === 'appointment' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wide flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 9608106681"
                        className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white/45 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-400 text-sm font-medium focus:outline-none cursor-text transition-colors"
                        required={activeTab === 'appointment'}
                      />
                    </div>

                    {/* Preferred Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        min={getMinDate()}
                        max={getMaxDate()}
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white/45 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-400 text-sm font-medium focus:outline-none cursor-text transition-colors"
                        required={activeTab === 'appointment'}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'appointment' && (
                  /* Treatment Type — Custom Glassmorphic Dropdown */
                  <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                    <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wide flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Specialty treatment
                    </label>
                    {/* Hidden native input for form validation */}
                    <input
                      type="text"
                      name="treatmentType"
                      value={formData.treatmentType}
                      required={activeTab === 'appointment'}
                      onChange={() => {}}
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <div className="relative">
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full h-12 rounded-xl px-4 flex items-center justify-between text-sm font-medium transition-all duration-300 backdrop-blur-md border cursor-pointer ${
                          dropdownOpen
                            ? 'bg-white/60 dark:bg-white/10 border-purple-500 dark:border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-purple-500/20'
                            : 'bg-white/45 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30'
                        } ${
                          formData.treatmentType
                            ? 'text-slate-800 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <span className="truncate">{formData.treatmentType || 'Select care option...'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 flex-shrink-0 ml-2 ${
                          dropdownOpen ? 'rotate-180 text-purple-500' : ''
                        }`} />
                      </button>

                      {/* Dropdown Panel */}
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/80 dark:bg-[#151530]/95 border border-slate-200/60 dark:border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                          >
                            <div className="p-1.5 max-h-[280px] overflow-y-auto">
                              {treatmentsList.map((tm, id) => {
                                const isSelected = formData.treatmentType === tm;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, treatmentType: tm }));
                                      setDropdownOpen(false);
                                      if (errors.length > 0) setErrors([]);
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="truncate">{tm}</span>
                                    {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Message input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wide flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {activeTab === 'appointment' ? 'Medical Notes / Message (Optional)' : 'Inquiry Message'}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder={activeTab === 'appointment' 
                      ? "Provide details about previous treatments or specific orthodonic requests..." 
                      : "Type your query here for our clinical response team to look into..."}
                    className="w-full rounded-xl p-4 text-slate-800 dark:text-slate-100 bg-white/45 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-purple-400 text-sm font-medium focus:outline-none resize-none cursor-text transition-colors"
                    required={activeTab === 'contact'}
                  />
                </div>

                {/* Priority Upgrade Selector */}
                {activeTab === 'appointment' && (
                  <PriorityUpgrade 
                    selectedTier={priorityTier}
                    onSelectTier={setPriorityTier}
                  />
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-black font-display text-base shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 relative group overflow-hidden mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {activeTab === 'appointment' ? 'Securing Secure Reservation...' : 'Sending Secure Inquiry...'}
                    </>
                  ) : (
                    <>
                      {activeTab === 'appointment' ? 'Lock In Digital Reservation' : 'Submit General Inquiry'}
                    </>
                  )}
                </button>

              </form>

            </motion.div>
          </motion.div>

        </div>

      </div>

      {/* 1. Appointment Success Dialog Modal popup */}
      <AnimatePresence>
        {successData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessData(null)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md rounded-[32px] p-6 md:p-8 glass-panel border border-white/60 shadow-2xl z-10 bg-white"
            >
              <div className="flex flex-col items-center justify-center text-center">
                
                {/* Success animated check */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-md mb-4 self-center">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>

                <h3 className="text-2xl font-black font-display text-slate-900 tracking-tight leading-tight">
                  Reservation Ticket Secured!
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mt-1.5">
                  Your clinical consultation has been logged. An automated secure email notification was sent to our clinic staff.
                </p>

                {/* Ticket Receipt detail summary card */}
                <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-left my-6 space-y-3 font-medium text-slate-600">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Ticket ID</span>
                    <span className="font-mono text-purple-600 font-bold">{successData.id}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Patient</span>
                    <span className="text-slate-800 font-bold">{successData.name}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Specialty</span>
                    <span className="text-slate-800 font-bold text-right">{successData.treatmentType}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Target Date</span>
                    <span className="text-slate-800 font-bold">{successData.preferredDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-400">Status</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 font-mono text-[9px] font-bold uppercase border border-amber-100">
                      Pending Approval
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSuccessData(null)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-95 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Return to Studio
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Contact Inquiry Success Dialog Modal popup */}
      <AnimatePresence>
        {contactSuccessData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContactSuccessData(null)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md rounded-[32px] p-6 md:p-8 glass-panel border border-white/60 shadow-2xl z-10 bg-white"
            >
              <div className="flex flex-col items-center justify-center text-center">
                
                {/* Success animated check */}
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-md mb-4 self-center">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>

                <h3 className="text-2xl font-black font-display text-slate-900 tracking-tight leading-tight">
                  Inquiry Transmitted!
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mt-1.5">
                  Your ticket has been logged successfully in our system. An agent will contact you using your provided credentials shortly.
                </p>

                {/* Inquiry summary card */}
                <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-left my-6 space-y-3 font-medium text-slate-600">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Inquiry ID</span>
                    <span className="font-mono text-purple-600 font-bold">{contactSuccessData.id}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Sender</span>
                    <span className="text-slate-900 font-bold">{contactSuccessData.name}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Email Address</span>
                    <span className="text-slate-900 font-bold">{contactSuccessData.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => setContactSuccessData(null)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-95 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Acknowledge & Close
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. VIP Payment Gateway Modal */}
      <AnimatePresence>
        {showPaymentGateway && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm rounded-[32px] p-6 md:p-8 glass-panel border border-white/20 shadow-2xl z-10 bg-[#0f0f23] overflow-hidden"
            >
              {!paymentSuccess ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-5 relative">
                    {paymentProcessing && (
                      <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-2xl animate-spin" />
                    )}
                    <Landmark className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-black font-display text-white tracking-tight leading-tight">
                    VIP Processing
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 mb-6 max-w-xs">
                    Please complete your priority bypass payment to secure this slot instantly.
                  </p>

                  <div className="w-full bg-white/5 rounded-2xl border border-white/10 p-4 mb-6 text-left">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-400">Selected Tier</span>
                      <span className="text-white font-bold capitalize">{priorityTier} Bypass</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-400">Consultation</span>
                      <span className="text-white font-bold">{formData.treatmentType || 'General'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-3">
                      <span className="text-slate-300 font-bold">Total Due</span>
                      <span className="text-xl font-black text-emerald-400">
                        {priorityTier === 'emergency' ? '₹3,500' : '₹1,000'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    disabled={paymentProcessing}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Simulate Payment Checkout'
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setShowPaymentGateway(false)}
                    disabled={paymentProcessing}
                    className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel Transaction
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black font-display text-white mb-2">Payment Successful!</h3>
                  <p className="text-slate-400 text-sm">Locking in your VIP reservation...</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
