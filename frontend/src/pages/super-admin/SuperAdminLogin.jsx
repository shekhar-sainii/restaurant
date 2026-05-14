import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Super admin login — explicitly NO tenant header
      const res = await axios.post('/api/v1/auth/login', {
        email: form.email,
        password: form.password,
      }, {
        headers: { 'Content-Type': 'application/json' }, // no X-Tenant-Slug
      });
      const { user, accessToken } = res.data.data;

      if (user.role !== 'SUPER_ADMIN') {
        setError('Access denied. Super admin credentials required.');
        return;
      }

      localStorage.setItem('sa_auth', JSON.stringify({ user, token: accessToken }));
      navigate('/super-admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin</h1>
          <p className="text-gray-500 text-sm">Platform Control Center</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="superadmin@platform.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-purple-500/40 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:border-purple-500/40 text-sm text-white"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Authenticating...' : <><ShieldCheck size={15} /> Access Platform</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
