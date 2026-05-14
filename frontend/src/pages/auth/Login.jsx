import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, googleLoginUser, clearAuthError, selectAuth } from '../../redux/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(selectAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password sub-states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true); setForgotMsg('');
    try {
      const { default: api } = await import('../../services/api');
      const r = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(r.data?.message || 'Password reset link sent successfully!');
      setForgotEmail('');
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setForgotLoading(false);
    }
  };

  // Redirect on successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/branding');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'KITCHEN' || user.role === 'DELIVERY') {
        navigate('/admin/terminal');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLoginUser(credentialResponse.credential));
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-playfair font-bold mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-text-muted text-sm uppercase tracking-[0.2em]">Culinary Excellence Awaits</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl border-white/10">
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm"
              >
                <AlertCircle size={18} />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@dinesync.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all placeholder:text-white/10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Secret Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-primary/40 transition-all placeholder:text-white/10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setForgotMsg(''); setForgotEmail(''); }}
                  className="text-[10px] text-text-muted hover:text-primary font-bold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group shadow-[0_15px_30px_rgba(201,162,39,0.2)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-bold uppercase tracking-widest text-xs">Enter Pizza Kings</span>
                  <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black">
              <span className="bg-bg-neutral/40 px-4 text-text-muted">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
            <div className="text-center">
              <p className="text-xs text-text-muted mb-4 uppercase tracking-widest font-black">Sitting at a Table?</p>
              <Link 
                to="/menu" 
                className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all"
              >
                Order as Guest <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              <span>New Here?</span>
              <Link to="/register" className="text-white hover:text-primary transition-colors">Create Account</Link>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal Overlay */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowForgotModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-bg-dark border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <header className="text-center">
                <h3 className="text-2xl font-playfair font-bold text-white mb-1">Reset Password</h3>
                <p className="text-xs text-text-muted">Enter your registered email address to receive secure reset instructions</p>
              </header>

              {forgotMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold text-center ${forgotMsg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {forgotMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-primary/40 transition-all text-center"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white text-xs font-bold transition-all">
                    Close
                  </button>
                  <button type="submit" disabled={forgotLoading} className="flex-1 py-3 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50">
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
