import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  ShoppingBag, 
  LogOut, 
  Settings, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MapPin,
  Camera,
  Loader2
} from 'lucide-react';
import { selectAuth, logout, setCredentials } from '../../redux/slices/authSlice';
import { userService } from '../../services/user.service';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const [updating, setUpdating] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUpdating(true);
    try {
      const response = await userService.updateProfile(formData);
      // Update local storage/redux state with new user info
      dispatch(setCredentials({ 
        user: response.data, 
        token: localStorage.getItem('token') // Preserve existing token
      }));
    } catch (error) {
      console.error('Failed to update profile picture', error);
      alert('Failed to update profile picture');
    } finally {
      setUpdating(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const menuItems = [
    { icon: <ShoppingBag size={20} />, label: 'Order History', desc: 'Track and reorder your favorites', path: '/orders' },
    { icon: <MapPin size={20} />, label: 'My Addresses', desc: 'Manage your delivery locations', path: '/addresses' },
    { icon: <CreditCard size={20} />, label: 'Payments', desc: 'Saved cards and UPI IDs', path: '/payments' },
    { icon: <Settings size={20} />, label: 'Settings', desc: 'Security and preferences', path: '/settings' },
  ];

  return (
    <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 md:p-12 rounded-[3rem] mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border border-white/5"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />

        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-primary to-primary/40 p-1 shadow-[0_20px_50px_rgba(201,162,39,0.3)] relative">
            <div className="w-full h-full rounded-full bg-bg-dark flex items-center justify-center text-4xl md:text-5xl font-playfair font-bold text-primary border-4 border-bg-dark/50 overflow-hidden relative">
              {updating ? (
                <Loader2 className="animate-spin text-primary" size={40} />
              ) : user?.image ? (
                <img 
                  src={`${API_URL}${user.image}`} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
              
              {/* Image Upload Overlay */}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-[8px] font-black uppercase text-white tracking-widest">Update Photo</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={updating}
                />
              </label>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-bg-dark text-black">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Info */}
        <div className="text-center md:text-left flex-1">
          <header className="mb-6">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-2">{user?.name}</h1>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              Gold Member
            </p>
          </header>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 text-text-muted bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-sm">
              <Mail size={16} className="text-primary/60" />
              {user?.email}
            </div>
            <div className="flex items-center gap-2 text-text-muted bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-sm">
              <Phone size={16} className="text-primary/60" />
              {user?.mobile}
            </div>
          </div>
        </div>

        {/* Quick Logout (Desktop) */}
        <button 
          onClick={handleLogout}
          className="hidden md:flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all group text-red-500"
        >
          <LogOut className="group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
        </button>
      </motion.div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass group p-6 rounded-[2rem] border border-white/5 flex items-center justify-between hover:border-primary/20 transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.label}</h3>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>

      {/* Logout (Mobile Only) */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleLogout}
        className="md:hidden w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 mb-10"
      >
        <LogOut size={18} />
        Logout
      </motion.button>

      {/* Recent Activity Placeholder */}
      <section className="glass p-10 rounded-[3rem] border border-white/5">
        <h2 className="text-2xl font-playfair font-bold mb-8">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
            <ShoppingBag size={48} className="mb-4" />
            <p className="text-sm uppercase tracking-widest font-black">No recent orders found</p>
            <p className="text-xs mt-2">Hungry? Explore our gourmet selection.</p>
        </div>
      </section>
    </div>
  );
};

export default Profile;
