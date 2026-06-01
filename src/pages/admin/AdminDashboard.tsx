import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Calendar, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { Appointment, Inquiry } from '../../types';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries' | 'admins'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Admin form state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [draftingLoading, setDraftingLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Confirmation Modal State
  const [confirmModalApt, setConfirmModalApt] = useState<Appointment | null>(null);
  const [assignedTime, setAssignedTime] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const res = await fetch('/api/admin/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          const sortedData = json.data.sort((a: any, b: any) => {
            const weight: Record<string, number> = { emergency: 3, priority: 2, standard: 1 };
            const pA = weight[a.priorityLevel || 'standard'] || 1;
            const pB = weight[b.priorityLevel || 'standard'] || 1;
            if (pA !== pB) return pB - pA; // Higher priority first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setAppointments(sortedData);
        }
      } else if (activeTab === 'inquiries') {
        const res = await fetch('/api/admin/inquiries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setInquiries(json.data);
      } else if (activeTab === 'admins') {
        const res = await fetch('/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setAdmins(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string, time?: string, notes?: string) => {
    try {
      const payload: any = { status };
      if (time) payload.assignedTime = time;
      if (notes) payload.adminNotes = notes;

      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as any, assignedTime: time, adminNotes: notes } : a));
        setConfirmModalApt(null);
        setAssignedTime('');
        setAdminNotes('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestTime = async () => {
    if (!confirmModalApt) return;
    setAiSuggesting(true);
    try {
      const res = await fetch('/api/admin/appointments/suggest-time', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          treatmentType: confirmModalApt.treatmentType,
          preferredDate: confirmModalApt.preferredDate
        })
      });
      const data = await res.json();
      if (data.success && data.suggestedTime) {
        setAssignedTime(data.suggestedTime);
      }
    } catch (error) {
      console.error("AI failed", error);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      if (res.ok) {
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchData(); // refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Remove this administrator?')) return;
    try {
      const res = await fetch(`/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDraftAI = async (inquiryId: string, inquiryText: string) => {
    setDraftingLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/draft`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inquiryText })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText(data.draft);
      }
    } catch (error) {
      console.error('Failed to draft response');
    } finally {
      setDraftingLoading(false);
    }
  };

  const handleSendReply = async (inquiry: Inquiry) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ email: inquiry.email, message: inquiry.message, replyText })
      });
      const data = await res.json();
      if (data.success) {
        alert('Reply sent to patient successfully!');
        setReplyingTo(null);
        setReplyText('');
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Failed to send reply');
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a1a] flex flex-col md:flex-row transition-colors duration-500">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0f0f23] border-r border-slate-200 dark:border-white/10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black font-display tracking-tight text-slate-900 dark:text-white">For Your Dentist Portal</h1>
          </div>
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
            Admin: {user?.email}
          </p>
        </div>

        <nav className="p-4 flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'appointments'
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservations
          </button>
          
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'inquiries'
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Inquiries
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'admins'
                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Admins
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        
        <header className="mb-8">
          <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight capitalize">
            {activeTab} Overview
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time synchronization with For Your Dentist Secure Server.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Appointments View */}
            {activeTab === 'appointments' && (
              <div className="bg-white dark:bg-[#0f0f23]/80 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                        <th className="p-4 pl-6">Patient</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Treatment</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {appointments.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No appointments found.</td></tr>
                      )}
                      {appointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-bold text-slate-900 dark:text-white">{apt.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">ID: {apt.id.split('-')[1] || apt.id}</div>
                            {apt.priorityLevel === 'emergency' && (
                              <div className="mt-1.5"><span className="px-2 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20">Emergency</span></div>
                            )}
                            {apt.priorityLevel === 'priority' && (
                              <div className="mt-1.5"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20">Priority Skipped</span></div>
                            )}
                          </td>
                          <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                            <div>{apt.phone}</div>
                            <div className="text-xs text-slate-400">{apt.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">{apt.treatmentType}</div>
                            {apt.adminNotes && <div className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={apt.adminNotes}>Note: {apt.adminNotes}</div>}
                          </td>
                          <td className="p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                            <div>{apt.preferredDate}</div>
                            {apt.assignedTime && <div className="text-xs text-emerald-500 font-bold mt-0.5">{apt.assignedTime}</div>}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              apt.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' :
                              apt.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' :
                              'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                            }`}>
                              {apt.status === 'pending' && <Clock className="w-3 h-3" />}
                              {apt.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                              {apt.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6">
                            {apt.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => {
                                  setConfirmModalApt(apt);
                                  setAssignedTime('');
                                  setAdminNotes('');
                                }} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition-colors" title="Confirm">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => updateAppointmentStatus(apt.id, 'cancelled')} className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 transition-colors" title="Cancel">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inquiries View */}
            {activeTab === 'inquiries' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inquiries.length === 0 && <p className="text-slate-500 col-span-full">No inquiries yet.</p>}
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white dark:bg-[#0f0f23]/80 p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{inq.name}</h4>
                        <a href={`mailto:${inq.email}`} className="text-xs text-blue-500 hover:underline">{inq.email}</a>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 flex-1 mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{inq.message}"</p>
                    </div>
                    
                    {replyingTo === inq.id ? (
                      <div className="space-y-3 mt-auto">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full h-32 p-3 text-sm bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white resize-none"
                          placeholder="Draft your reply..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDraftAI(inq.id, inq.message)}
                            disabled={draftingLoading || sendingReply}
                            className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50"
                          >
                            {draftingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ Draft with AI'}
                          </button>
                          <button
                            onClick={() => handleSendReply(inq)}
                            disabled={sendingReply || !replyText.trim()}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                          >
                            {sendingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send Reply'}
                          </button>
                        </div>
                        <button 
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(inq.id)}
                        className="w-full mt-auto py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors"
                      >
                        Reply to Inquiry
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Manage View (Accessible to all admins) */}
            {activeTab === 'admins' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-[#0f0f23]/80 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-white/5">
                    <h3 className="font-black font-display text-lg text-slate-900 dark:text-white">Active Administrators</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {admins.map(admin => (
                          <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">{admin.email}</div>
                            </td>
                            <td className="p-4">
                              {admin.role === 'superadmin' ? (
                                <span className="px-2 py-1 rounded bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-bold uppercase border border-rose-200 dark:border-rose-500/20">Creator</span>
                              ) : (
                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 text-[10px] font-bold uppercase border border-slate-200 dark:border-white/10">Standard</span>
                              )}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {admin.role !== 'superadmin' && (
                                <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f0f23]/80 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm p-6 h-fit">
                  <h3 className="font-black font-display text-lg text-slate-900 dark:text-white mb-4">Grant Access</h3>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                        className="w-full h-10 mt-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                      <input 
                        type="password" 
                        required 
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                        className="w-full h-10 mt-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={adminActionLoading}
                      className="w-full h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      {adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Admin</>}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModalApt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#151530] w-full max-w-md rounded-[24px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xl font-black font-display dark:text-white">Confirm Appointment</h3>
                <p className="text-sm text-slate-500 mt-1">Assign a specific time for {confirmModalApt.name}</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Time</label>
                    <button 
                      onClick={handleSuggestTime}
                      disabled={aiSuggesting}
                      className="text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded dark:bg-purple-500/20 dark:text-purple-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {aiSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : "✨ AI Suggest Time"}
                    </button>
                  </div>
                  <input 
                    type="time" 
                    value={assignedTime}
                    onChange={(e) => setAssignedTime(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-slate-900 dark:bg-black/20 dark:border-white/10 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinic Note (Optional)</label>
                  <textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g., Please arrive 10 minutes early."
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 dark:bg-black/20 dark:border-white/10 dark:text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/5 flex gap-3">
                <button 
                  onClick={() => setConfirmModalApt(null)}
                  className="flex-1 h-11 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-transparent dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => updateAppointmentStatus(confirmModalApt.id, 'confirmed', assignedTime, adminNotes)}
                  disabled={!assignedTime}
                  className="flex-1 h-11 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Notify
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
