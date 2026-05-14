import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { loginSuccess } from '../../redux/slices/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Real-time password strength checker
  const checkStrength = (pass) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Extra Secure'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    
    return { 
      score: (score / 5) * 100, 
      label: labels[Math.min(score, 4)], 
      color: colors[Math.min(score, 4)] 
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Real-time mismatch check
      if (name === 'password' || name === 'confirmPassword') {
        setPasswordsMatch(newData.password === newData.confirmPassword || !newData.confirmPassword);
      }

      if (name === 'password') {
        setStrength(checkStrength(value));
      }

      return newData;
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });

      // Automatically log in
      const { user, accessToken } = response.data;
      authService.setToken(accessToken);
      dispatch(loginSuccess({ user, token: accessToken }));
      
      // Redirect to home or checkout if they were in the middle of something
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-gradient-to-b from-bg-dark to-bg-neutral/20">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />

          <div className="relative z-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-8 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Sign In
            </Link>

            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-3">Join the Club</h1>
              <p className="text-text-muted text-sm font-light">Create your culinary account to track orders and save favorites.</p>
            </header>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs mb-8"
              >
                <AlertCircle size={18} />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Culinary Lover"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Mobile</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="guest@dinesync.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Password</label>
                    {formData.password && (
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${strength.color} text-black`}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border ${formData.password ? 'border-primary/20' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm font-mono`}
                    />
                  </div>
                  {/* Strength Bar */}
                  {formData.password && (
                    <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.score}%` }}
                        className={`h-full ${strength.color} transition-all duration-500`}
                      />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Confirm</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border ${!passwordsMatch ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm font-mono`}
                    />
                    {!passwordsMatch && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute -bottom-6 left-1 flex items-center gap-1 text-[9px] text-red-500 font-bold uppercase tracking-tighter"
                      >
                        <AlertCircle size={10} /> Passwords do not match
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !passwordsMatch || (formData.password && strength.score < 20)}
                className={`btn-primary w-full py-5 rounded-2xl mt-8 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(201,162,39,0.2)] group ${(!passwordsMatch || loading) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="text-xs font-black uppercase tracking-widest">Create DineSync Account</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <footer className="mt-12 pt-8 border-t border-white/5 space-y-8">
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
                <span>Already have an account?</span>
                <Link to="/login" className="text-white hover:text-primary transition-all">Sign In</Link>
              </div>
            </footer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
