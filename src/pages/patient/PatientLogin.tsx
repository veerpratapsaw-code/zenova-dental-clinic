import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Activity } from 'lucide-react';

export default function PatientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { loginPatient } = usePatientAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        loginPatient(data.token, data.patient);
        navigate('/patient/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a1a] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-white/80 dark:bg-[#0f0f23]/80 backdrop-blur-2xl p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 mb-6 group transition-transform hover:scale-105">
            <Activity className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">Patient Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Secure access to your dental records and appointments.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">!</span>
            </div>
            <p className="text-sm text-rose-700 dark:text-rose-400 leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:text-white transition-all"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:text-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 group"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/patient/register" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
