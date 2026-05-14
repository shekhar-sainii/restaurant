import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { applyThemeToDom, resolveTheme } from '../../config/themes.config';
import { Palette, Image, Save, RefreshCw, Eye, MapPin } from 'lucide-react';
import axios from 'axios';
import MapPicker from '../../components/common/MapPicker';

const saApi = axios.create({ baseURL: '/api/v1' });
saApi.interceptors.request.use(config => {
  const saved = localStorage.getItem('gourmet_auth');
  if (saved) { try { config.headers['Authorization'] = `Bearer ${JSON.parse(saved).token}`; } catch (_) {} }
  const slug = localStorage.getItem('tenant_slug');
  if (slug) config.headers['X-Tenant-Slug'] = slug;
  return config;
});

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-primary/40 transition-all";
const LABEL = "text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1.5";

const BrandingSettings = () => {
  const { user } = useSelector(selectAuth);
  const [tenant, setTenant] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    'theme.primaryColor': '#c9a227',
    'theme.secondaryColor': '#ffffff',
    'theme.backgroundColor': '#0f0f0f',
    'theme.surfaceColor': '#1a1a1a',
    'theme.fontFamily': 'Playfair Display',
    'theme.borderRadius': '1.5rem',
    'theme.mode': 'dark',
    address: '',
    location: { lat: 28.6139, lng: 77.2090 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // Password update sub-states
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  const handleUpdatePassword = async () => {
    if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) {
      setPwdMsg('New password must be at least 6 characters');
      return;
    }
    setPwdUpdating(true); setPwdMsg('');
    try {
      await saApi.patch('/user/password', pwdForm);
      setPwdMsg('Password updated successfully!');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (e) {
      setPwdMsg(e.response?.data?.message || 'Failed to update password');
    } finally {
      setPwdUpdating(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    const slug = user?.tenantId || localStorage.getItem('tenant_slug');
    if (!slug) return;
    axios.get(`/api/v1/public/tenants/${slug}/config`)
      .then(r => {
        const t = r.data.data;
        setTenant(t);
        setForm({
          businessName: t.businessName || '',
          'theme.primaryColor':    t.theme?.primaryColor    || '#c9a227',
          'theme.secondaryColor':  t.theme?.secondaryColor  || '#ffffff',
          'theme.backgroundColor': t.theme?.backgroundColor || '#0f0f0f',
          'theme.surfaceColor':    t.theme?.surfaceColor    || '#1a1a1a',
          'theme.fontFamily':      t.theme?.fontFamily      || 'Playfair Display',
          'theme.borderRadius':    t.theme?.borderRadius    || '1.5rem',
          'theme.mode':            t.theme?.mode            || 'dark',
          address:                 t.address                || '',
          location:                t.location               || { lat: 28.6139, lng: 77.2090 }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.tenantId]);

  const handlePreview = () => {
    const theme = resolveTheme({
      ...tenant,
      businessName: form.businessName,
      theme: {
        primaryColor:    form['theme.primaryColor'],
        secondaryColor:  form['theme.secondaryColor'],
        backgroundColor: form['theme.backgroundColor'],
        surfaceColor:    form['theme.surfaceColor'],
        fontFamily:      form['theme.fontFamily'],
        borderRadius:    form['theme.borderRadius'],
        mode:            form['theme.mode'],
      },
    });
    applyThemeToDom(theme);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        businessName: form.businessName,
        theme: {
          primaryColor:    form['theme.primaryColor'],
          secondaryColor:  form['theme.secondaryColor'],
          backgroundColor: form['theme.backgroundColor'],
          surfaceColor:    form['theme.surfaceColor'],
          fontFamily:      form['theme.fontFamily'],
          borderRadius:    form['theme.borderRadius'],
          mode:            form['theme.mode'],
        },
        address: form.address,
        location: form.location,
      };

      // Upload logo if selected
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        const r = await saApi.post('/admin/branding/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        payload.logo = r.data.data?.logo;
      }

      // Upload banner if selected
      if (bannerFile) {
        const fd = new FormData();
        fd.append('banner', bannerFile);
        const r = await saApi.post('/admin/branding/banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        payload.banner = r.data.data?.banner;
      }

      await saApi.put('/admin/branding', payload);
      handlePreview();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save branding');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-primary" size={28} /></div>;

  const primary = form['theme.primaryColor'];

  return (
    <div className="space-y-8 pb-10 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${primary}20` }}>
          <Palette size={20} style={{ color: primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Branding & Theme</h2>
          <p className="text-[11px] text-text-muted">Customize your storefront and admin panel appearance</p>
        </div>
      </div>

      {/* Live Preview Bar */}
      <div className="rounded-2xl border border-white/10 p-4 flex items-center gap-4 overflow-hidden relative">
        <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: primary }} />
        <div className="flex-1 h-4 rounded-full" style={{ background: form['theme.backgroundColor'] }} />
        <div className="w-16 h-4 rounded-full" style={{ background: form['theme.secondaryColor'] }} />
        <span className="text-[10px] text-text-muted uppercase tracking-widest flex-shrink-0">Live Preview</span>
        <button onClick={handlePreview} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-white/20 text-text-muted hover:text-white transition-all flex-shrink-0">
          <Eye size={12} /> Apply
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div className="md:col-span-2">
          <label className={LABEL}>Business Name</label>
          <input className={INPUT} value={form.businessName} onChange={e => set('businessName', e.target.value)} />
        </div>

        {/* Colors */}
        {[
          { key: 'theme.primaryColor',    label: 'Primary Color',    hint: 'Buttons, accents, highlights' },
          { key: 'theme.secondaryColor',  label: 'Secondary Color',  hint: 'Hover states, secondary elements' },
          { key: 'theme.backgroundColor', label: 'Background Color', hint: 'Page background' },
          { key: 'theme.surfaceColor',    label: 'Surface Color',    hint: 'Cards, panels, modals' },
        ].map(f => (
          <div key={f.key}>
            <label className={LABEL}>{f.label}</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer flex-shrink-0" />
              <div className="flex-1">
                <input className={INPUT} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
                <p className="text-[10px] text-text-muted mt-1">{f.hint}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Font */}
        <div>
          <label className={LABEL}>Font Family</label>
          <select className={INPUT} value={form['theme.fontFamily']} onChange={e => set('theme.fontFamily', e.target.value)}>
            {['Playfair Display, serif', 'Inter, sans-serif', 'Georgia, serif', 'Poppins, sans-serif', 'Roboto, sans-serif'].map(f => (
              <option key={f} value={f} className="bg-bg-dark">{f.split(',')[0]}</option>
            ))}
          </select>
        </div>

        {/* Border Radius */}
        <div>
          <label className={LABEL}>Border Radius</label>
          <select className={INPUT} value={form['theme.borderRadius']} onChange={e => set('theme.borderRadius', e.target.value)}>
            {[['0.5rem','Sharp'],['0.75rem','Slightly Rounded'],['1rem','Rounded'],['1.5rem','More Rounded'],['2rem','Very Rounded'],['9999px','Pill']].map(([v,l]) => (
              <option key={v} value={v} className="bg-bg-dark">{l} ({v})</option>
            ))}
          </select>
        </div>

        {/* Logo Upload */}
        <div>
          <label className={LABEL}>Logo</label>
          <div className="flex items-center gap-3">
            {(tenant?.logo || logoFile) && (
              <img src={logoFile ? URL.createObjectURL(logoFile) : tenant.logo} alt="logo"
                className="w-12 h-12 rounded-xl object-cover border border-white/10" />
            )}
            <label className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 cursor-pointer transition-all text-sm text-text-muted hover:text-white">
              <Image size={16} />
              {logoFile ? logoFile.name : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Banner Upload */}
        <div>
          <label className={LABEL}>Homepage Banner</label>
          <div className="flex items-center gap-3">
            {(tenant?.banner || bannerFile) && (
              <img src={bannerFile ? URL.createObjectURL(bannerFile) : tenant.banner} alt="banner"
                className="w-20 h-12 rounded-xl object-cover border border-white/10" />
            )}
            <label className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 cursor-pointer transition-all text-sm text-text-muted hover:text-white">
              <Image size={16} />
              {bannerFile ? bannerFile.name : 'Upload Banner'}
              <input type="file" accept="image/*" className="hidden" onChange={e => setBannerFile(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Location & Map */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-primary" />
            <span className={LABEL}>Store Location</span>
          </div>
          
          <div>
            <label className={LABEL}>Physical Address</label>
            <textarea 
              className={`${INPUT} min-h-[80px] py-3`} 
              placeholder="Enter full restaurant address..."
              value={form.address} 
              onChange={e => set('address', e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className={LABEL}>Pin on Map (Drag marker to adjust)</label>
            <div className="rounded-3xl border border-white/10 overflow-hidden">
              <MapPicker 
                lat={form.location?.lat} 
                lng={form.location?.lng} 
                onChange={loc => set('location', loc)} 
              />
            </div>
            <div className="flex gap-4 text-[10px] text-text-muted">
              <span>Lat: {form.location?.lat?.toFixed(6)}</span>
              <span>Lng: {form.location?.lng?.toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Account Security</h3>
          <p className="text-[11px] text-text-muted">Update your authenticated administrator account access password</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          {pwdMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${pwdMsg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {pwdMsg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Current Password (Optional if reset)</label>
              <input type="password" placeholder="••••••••" value={pwdForm.currentPassword} onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>New Password</label>
              <input type="password" placeholder="Minimum 6 characters" value={pwdForm.newPassword} onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} className={INPUT} />
            </div>
          </div>
          <button type="button" onClick={handleUpdatePassword} disabled={pwdUpdating} className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all">
            {pwdUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button onClick={handlePreview}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 text-text-muted hover:text-white hover:border-white/20 text-sm font-bold transition-all">
          <Eye size={15} /> Preview
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl text-black font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
          style={{ background: primary }}>
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </div>
  );
};

export default BrandingSettings;
