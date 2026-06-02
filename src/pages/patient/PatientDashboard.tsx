import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { useSocket } from '../../context/SocketContext';
import { Activity, LogOut, Calendar, Clock, CheckCircle2, XCircle, ChevronRight, MapPin, User as UserIcon, Camera, Save, Loader2 } from 'lucide-react';

interface Appointment {
  id: string;
  treatmentType: string;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  assignedTime?: string;
  adminNotes?: string;
}

export default function PatientDashboard() {
  const { patient, token, loginPatient, updatePatient, logoutPatient, isLoading: authLoading } = usePatientAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>('appointments');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    dob: '',
    gender: '',
    medicalHistory: '',
    profilePic: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !patient) {
      navigate('/patient/login');
    } else if (patient) {
      setProfileData({
        name: patient.name || '',
        phone: patient.phone || '',
        address: patient.address || '',
        dob: patient.dob || '',
        gender: patient.gender || '',
        medicalHistory: patient.medicalHistory || '',
        profilePic: patient.profilePic || ''
      });
    }
  }, [patient, authLoading, navigate]);

  const fetchAppointments = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/patient/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      if (token) fetchAppointments();
    };
    socket.on('update_appointment', handleUpdate);
    socket.on('delete_appointment', handleUpdate);
    return () => {
      socket.off('update_appointment', handleUpdate);
      socket.off('delete_appointment', handleUpdate);
    };
  }, [socket, token]);

  const handleLogout = () => {
    logoutPatient();
    navigate('/');
  };

  if (authLoading || !patient) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a1a] transition-colors duration-500">
      
      {/* Top Navbar */}
      <nav className="h-20 bg-white/80 dark:bg-[#0f0f23]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">For Your Dentist</span>
          </Link>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block" />
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 hidden sm:block">Patient Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 mr-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-white">{patient.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{patient.email}</p>
            </div>
            {patient.profilePic ? (
              <img src={patient.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 border-2 border-transparent">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 mt-8">
        
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
              Hello, {patient.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your appointments, track your treatment progress, and update your profile.</p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/"
              className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-center shadow-sm"
            >
              Book Visit
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-200/50 dark:bg-[#151530] p-1 rounded-2xl mb-8 border border-slate-200 dark:border-white/10 max-w-sm">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'appointments'
                ? 'bg-white dark:bg-[#202040] text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#202040] text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'appointments' ? (
          <div className="bg-white/50 dark:bg-[#0f0f23]/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Appointments</h2>
            </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                <Calendar className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Appointments Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                You haven't scheduled any treatments with For Your Dentist yet. Ready to perfect your smile?
              </p>
              <Link to="/" className="inline-block px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl font-bold transition-colors">
                Book Now
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map(apt => (
                <div key={apt.id} className="group relative bg-white dark:bg-[#151530] border border-slate-200 dark:border-white/10 p-5 sm:p-6 rounded-2xl hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-colors shadow-sm hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(apt.status)}
                        <span className="text-xs text-slate-400 font-mono">ID: {apt.id}</span>
                        <span className="text-xs text-slate-400 font-mono ml-auto">
                          Requested: {new Date(apt.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{apt.treatmentType}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{apt.preferredDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>Neo-District Clinic</span>
                        </div>
                      </div>

                      {/* Advanced Scheduling Details Section */}
                      {apt.status === 'confirmed' ? (
                        <div className="bg-cyan-50 dark:bg-cyan-500/10 rounded-xl p-4 border border-cyan-100 dark:border-cyan-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-800 dark:text-cyan-300">
                              Assigned Time: {apt.assignedTime || 'To be determined'}
                            </span>
                          </div>
                          {apt.adminNotes && (
                            <p className="text-sm text-cyan-700 dark:text-cyan-400/80 italic border-l-2 border-cyan-300 dark:border-cyan-500/40 pl-3">
                              "{apt.adminNotes}"
                            </p>
                          )}
                        </div>
                      ) : apt.status === 'pending' ? (
                        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/10 flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          Awaiting exact time assignment from the clinic.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        ) : (
          <div className="bg-white/50 dark:bg-[#0f0f23]/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Details</h2>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              setSaveMessage('');
              try {
                const res = await fetch('/api/patient/profile', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify(profileData)
                });
                const data = await res.json();
                if (data.success) {
                  updatePatient(data.patient);
                  setSaveMessage('Profile updated successfully!');
                } else {
                  setSaveMessage(data.message || 'Failed to update profile');
                }
              } catch (err) {
                setSaveMessage('An error occurred. Please try again.');
              } finally {
                setIsSaving(false);
                setTimeout(() => setSaveMessage(''), 3000);
              }
            }}>
              
              {/* Profile Image Uploader */}
              <div className="mb-8 flex flex-col items-center sm:items-start gap-4">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    {profileData.profilePic ? (
                      <img src={profileData.profilePic} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-cyan-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileData(prev => ({ ...prev, profilePic: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">Allowed formats: JPG, PNG, GIF. Max size 2MB.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Gender</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors appearance-none"
                  >
                    <option value="" className="text-slate-800 dark:text-slate-800">Select Gender</option>
                    <option value="male" className="text-slate-800 dark:text-slate-800">Male</option>
                    <option value="female" className="text-slate-800 dark:text-slate-800">Female</option>
                    <option value="other" className="text-slate-800 dark:text-slate-800">Other</option>
                    <option value="prefer_not_to_say" className="text-slate-800 dark:text-slate-800">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Residential Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full h-12 rounded-xl px-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                  placeholder="Street, City, State, ZIP"
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Medical History (Optional)</label>
                <textarea
                  value={profileData.medicalHistory}
                  onChange={(e) => setProfileData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  className="w-full rounded-xl p-4 text-slate-800 dark:text-slate-100 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500 dark:focus:border-cyan-400 text-sm font-medium focus:outline-none resize-none cursor-text transition-colors"
                  rows={4}
                  placeholder="Any allergies, current medications, or past dental surgeries?"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Profile Changes
                </button>
                {saveMessage && (
                  <span className={`text-sm font-bold ${saveMessage.includes('error') || saveMessage.includes('Failed') ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {saveMessage}
                  </span>
                )}
              </div>

            </form>
          </div>
        )}
      </main>
    </div>
  );
}
