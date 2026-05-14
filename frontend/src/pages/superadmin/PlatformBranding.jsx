import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Link as LinkIcon, Palette, LayoutDashboard, Database, Activity } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';

const PlatformBranding = () => {
  const { user } = useSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [platform, setPlatform] = useState({
    heroTitle: 'The Elite Epicurean Collection',
    heroSubtitle: 'Explore a curated selection of the finest multi-tenant restaurants. Every plate tells a story of passion and excellence.',
    brandName: 'Gourmet Hub',
    theme: {
      primaryColor: '#c9a227',
      backgroundColor: '#050505',
    }
  });

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const res = await axios.get('/api/v1/public/platform');
      if (res.data?.data) {
        setPlatform(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load platform settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.put('/api/v1/super-admin/platform', platform, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Platform settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Save failed', err);
      setMessage(err.response?.data?.message || 'Failed to preserve changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('theme.')) {
      const key = name.split('.')[1];
      setPlatform(prev => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
    } else {
      setPlatform(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-white mb-2">Global Platform Config</h1>
          <p className="text-text-muted text-xs uppercase tracking-widest font-black">Super Admin Control Center</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Apply Changes
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold flex items-center gap-2">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Texts Card */}
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <LayoutDashboard size={20} className="text-primary" /> UI Strings
          </h2>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Brand / Platform Name</label>
              <input type="text" name="brandName" value={platform.brandName || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-primary/50 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Hero Title</label>
              <input type="text" name="heroTitle" value={platform.heroTitle || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-primary/50 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Hero Subtitle</label>
              <textarea rows={4} name="heroSubtitle" value={platform.heroSubtitle || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
        </div>

        {/* Colors Card */}
        <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <Palette size={20} className="text-primary" /> Theming
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-white mb-1">Primary Color</label>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">Main Buttons & Accents</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="text" name="theme.primaryColor" value={platform.theme?.primaryColor || ''} onChange={handleChange} className="w-24 bg-white/5 border border-white/10 p-2 rounded-lg text-xs outline-none uppercase font-mono" />
                <input type="color" name="theme.primaryColor" value={platform.theme?.primaryColor || '#c9a227'} onChange={handleChange} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div>
                <label className="block text-sm font-bold text-white mb-1">Background Color</label>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">Main Canvas Color</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="text" name="theme.backgroundColor" value={platform.theme?.backgroundColor || ''} onChange={handleChange} className="w-24 bg-white/5 border border-white/10 p-2 rounded-lg text-xs outline-none uppercase font-mono" />
                <input type="color" name="theme.backgroundColor" value={platform.theme?.backgroundColor || '#050505'} onChange={handleChange} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlatformBranding;
