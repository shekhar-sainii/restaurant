import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMsg('Invalid or missing security token.');
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg('Password must be at least 6 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMsg('New password and confirmation password do not match.');
      return;
    }

    setLoading(true); setMsg('');
    try {
      const { default: api } = await import('../../services/api');
      const r = await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      setSuccess(true);
      setMsg(r.data?.message || 'Password successfully updated!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update password. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-playfair font-bold mb-2 tracking-tight text-white">Create New Password</h1>
          <p className="text-text-muted text-xs uppercase tracking-[0.2em]">Secure Authentication Access</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

          {success ? (
            <div className="text-center space-y-6 py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                <CheckCircle2 size={32} />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-playfair">Password Secured</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Your credentials have been reset successfully. You can now use your new password to access your administrative suite or storefront profile.
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4">
                <span className="font-bold uppercase tracking-widest text-xs">Proceed to Login</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {msg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-4 rounded-xl text-xs font-bold ${msg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {msg}
                </motion.div>
              )}

              {!token && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400 text-xs text-center font-bold">
                  ⚠️ No reset token provided in the address bar. Please click the exact link sent to your email.
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/10"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Repeat password exactly"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-6 shadow-[0_15px_30px_rgba(201,162,39,0.2)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="font-bold uppercase tracking-widest text-xs">Confirm & Secure Account</span>
                )}
              </button>

              <div className="text-center pt-4 border-t border-white/5 mt-6">
                <Link to="/login" className="text-[10px] text-text-muted hover:text-white uppercase tracking-widest font-bold transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
