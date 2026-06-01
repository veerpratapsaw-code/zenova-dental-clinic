import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, AlertCircle, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        login(data.data.token, data.data.user);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setSetupLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setError('Super Admin account created! You can now log in.');
      } else {
        setError(data.message || 'Setup failed. Superadmin may already exist.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f8fafc] dark:bg-[#0a0a1a]">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-[32px] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 border border-white/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
            Secure Access
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 text-center">
            Authorized personnel only. Enter credentials to access the clinic dashboard.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3.5 rounded-xl flex items-start gap-2.5 text-sm font-semibold mb-6 ${
              error.includes('created') 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
            }`}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-500" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="admin@zenova.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-500" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
          <p className="text-xs text-slate-400 mb-3 font-medium">System Initialization (First Boot Only)</p>
          <button
            type="button"
            onClick={handleSetup}
            disabled={setupLoading}
            className="text-xs font-bold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            {setupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
            Initialize Creator Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
