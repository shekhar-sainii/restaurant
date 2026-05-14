import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  ShieldCheck, Building2, TrendingUp, IndianRupee, Plus, Power, Trash2,
  RefreshCw, X, LogOut, CheckCircle, Edit2, AlertTriangle, Globe,
  CreditCard, Layers, Save, ExternalLink, BarChart3, Users, Settings, Layout, Image, Type
} from 'lucide-react';

// ── Super Admin API (no tenant header) ───────────────────────────────────────
const saApi = axios.create({ baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1' });
saApi.interceptors.request.use(config => {
  const saved = localStorage.getItem('sa_auth');
  if (saved) { try { config.headers['Authorization'] = `Bearer ${JSON.parse(saved).token}`; } catch (_) {} }
  delete config.headers['X-Tenant-Slug'];
  return config;
});

// ── Shared styles ─────────────────────────────────────────────────────────────
const CARD  = "bg-white/5 border border-white/10 rounded-2xl";
const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-purple-500/40 transition-all";
const LABEL = "text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5";
const BTN_P = "bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50";
const BTN_G = "bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all";

const BUSINESS_TYPES = ['RESTAURANT'];
const PLANS = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
const PLAN_STYLE = {
  FREE: 'bg-gray-500/10 text-gray-400', STARTER: 'bg-blue-500/10 text-blue-400',
  PRO: 'bg-purple-500/10 text-purple-400', ENTERPRISE: 'bg-yellow-500/10 text-yellow-400',
};
const STATUS_STYLE = {
  ACTIVE: 'bg-green-500/10 text-green-400', INACTIVE: 'bg-gray-500/10 text-gray-400',
  SUSPENDED: 'bg-red-500/10 text-red-400',
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, type, tenant }) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen || !tenant) return null;
  const cfg = {
    delete:     { icon: Trash2,      color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    title: 'Delete Restaurant?',  btn: 'bg-red-500 hover:bg-red-400',      btnText: 'Delete' },
    deactivate: { icon: Power,       color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', title: 'Deactivate?',         btn: 'bg-orange-500 hover:bg-orange-400', btnText: 'Deactivate' },
    activate:   { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  title: 'Activate?',           btn: 'bg-green-600 hover:bg-green-500',   btnText: 'Activate' },
  }[type] || {};
  const Icon = cfg.icon;
  const handle = async () => { setLoading(true); await onConfirm(); setLoading(false); };
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`relative w-full max-w-sm bg-[#111] border ${cfg.border} rounded-3xl p-8 text-center shadow-2xl`}>
        <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center mx-auto mb-4`}>
          <Icon size={26} className={cfg.color} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{cfg.title}</h3>
        <p className="text-gray-400 text-sm mb-2"><span className="text-white font-bold">{tenant.businessName}</span></p>
        {type === 'delete' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-400 text-xs">
            <AlertTriangle size={13} /> Irreversible — all data will be lost
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className={`flex-1 py-3 rounded-2xl text-sm font-bold ${BTN_G}`}>Cancel</button>
          <button onClick={handle} disabled={loading} className={`flex-1 py-3 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 ${cfg.btn}`}>
            {loading ? 'Processing...' : cfg.btnText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Edit Tenant Modal ─────────────────────────────────────────────────────────
const EditModal = ({ isOpen, tenant, onClose, onSaved }) => {
  const [form, setForm] = useState({});
  const [tab, setTab]   = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  
  // Password Reset sub-states
  const [newPwd, setNewPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    if (tenant) {
      setForm({
        businessName: tenant.businessName || '',
        subscriptionPlan: tenant.subscriptionPlan || 'FREE',
        status: tenant.status || 'ACTIVE',
        contactEmail: tenant.contactEmail || '',
        contactPhone: tenant.contactPhone || '',
        'theme.primaryColor':    tenant.theme?.primaryColor    || '#c9a227',
        'theme.backgroundColor': tenant.theme?.backgroundColor || '#0f0f0f',
        'paymentSettings.cashEnabled': tenant.paymentSettings?.cashEnabled ?? true,
        'paymentSettings.upiEnabled':  tenant.paymentSettings?.upiEnabled  ?? true,
        'paymentSettings.upiIdPrimary':    tenant.paymentSettings?.upiIdPrimary    || '',
        'paymentSettings.upiIdSecondary':  tenant.paymentSettings?.upiIdSecondary  || '',
        'paymentSettings.upiMerchantName': tenant.paymentSettings?.upiMerchantName || '',
        'enabledModules.dineIn':       tenant.enabledModules?.dineIn       ?? true,
        'enabledModules.delivery':     tenant.enabledModules?.delivery     ?? true,
        'enabledModules.guestOrdering':tenant.enabledModules?.guestOrdering ?? true,
        'enabledModules.chat':         tenant.enabledModules?.chat         ?? true,
      });
      setTab('basic'); setError(''); setPwdMsg(''); setNewPwd('');
    }
  }, [tenant]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      const payload = {};
      for (const [k, v] of Object.entries(form)) {
        const parts = k.split('.');
        if (parts.length === 1) payload[k] = v;
        else { if (!payload[parts[0]]) payload[parts[0]] = {}; payload[parts[0]][parts[1]] = v; }
      }
      await saApi.put(`/super-admin/tenants/${tenant.tenantId}`, payload);
      window.dispatchEvent(new CustomEvent('tenant-theme-updated'));
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPwd || newPwd.length < 6) {
      setPwdMsg('Password must be at least 6 characters');
      return;
    }
    setPwdLoading(true); setPwdMsg('');
    try {
      await saApi.patch(`/super-admin/tenants/${tenant.tenantId}/password`, { newPassword: newPwd });
      setPwdMsg('Password reset successfully!');
      setNewPwd('');
    } catch (err) {
      setPwdMsg(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!isOpen || !tenant) return null;
  const TABS = [{ id:'basic',label:'Basic',icon:Building2 },{ id:'theme',label:'Theme',icon:Globe },{ id:'payment',label:'Payment',icon:CreditCard },{ id:'modules',label:'Modules',icon:Layers },{ id:'security',label:'Security',icon:ShieldCheck }];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-xl bg-[#111] border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/5 flex-shrink-0">
          <div><h2 className="text-lg font-bold text-white">Edit Restaurant</h2><p className="text-[11px] text-gray-500 mt-0.5">{tenant.businessName} · /{tenant.slug}</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white"><X size={18}/></button>
        </div>
        <div className="flex gap-1 px-7 pt-4 flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab===t.id?'bg-purple-600 text-white':'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <t.icon size={12}/>{t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl p-3">{error}</p>}
          {tab === 'basic' && (<>
            <div><label className={LABEL}>Business Name</label><input className={INPUT} value={form.businessName} onChange={e=>set('businessName',e.target.value)}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={LABEL}>Plan</label><select className={INPUT} value={form.subscriptionPlan} onChange={e=>set('subscriptionPlan',e.target.value)}>{PLANS.map(p=><option key={p} value={p} className="bg-[#111]">{p}</option>)}</select></div>
              <div><label className={LABEL}>Status</label><select className={INPUT} value={form.status} onChange={e=>set('status',e.target.value)}>{['ACTIVE','INACTIVE','SUSPENDED'].map(s=><option key={s} value={s} className="bg-[#111]">{s}</option>)}</select></div>
            </div>
            <div><label className={LABEL}>Contact Email</label><input className={INPUT} type="email" value={form.contactEmail} onChange={e=>set('contactEmail',e.target.value)}/></div>
            <div><label className={LABEL}>Contact Phone</label><input className={INPUT} value={form.contactPhone} onChange={e=>set('contactPhone',e.target.value)}/></div>
          </>)}
          {tab === 'theme' && (<>
            {[{k:'theme.primaryColor',l:'Primary Color'},{k:'theme.backgroundColor',l:'Background Color'}].map(f=>(
              <div key={f.k}><label className={LABEL}>{f.l}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form[f.k]} onChange={e=>set(f.k,e.target.value)} className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer flex-shrink-0"/>
                  <input className={INPUT} value={form[f.k]} onChange={e=>set(f.k,e.target.value)}/>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-white/10 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{background:form['theme.primaryColor']}}/>
              <div className="flex-1 h-10 rounded-xl" style={{background:form['theme.backgroundColor']}}/>
              <span className="text-xs text-gray-500">Preview</span>
            </div>
          </>)}
          {tab === 'payment' && (<>
            <div className="grid grid-cols-2 gap-4">
              {[{k:'paymentSettings.cashEnabled',l:'Cash'},{k:'paymentSettings.upiEnabled',l:'UPI'}].map(f=>(
                <div key={f.k} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-sm text-white">{f.l}</span>
                  <button onClick={()=>set(f.k,!form[f.k])} className={`w-11 h-6 rounded-full transition-all relative ${form[f.k]?'bg-purple-600':'bg-white/10'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[f.k]?'left-6':'left-1'}`}/>
                  </button>
                </div>
              ))}
            </div>
            <div><label className={LABEL}>UPI ID Primary</label><input className={INPUT} value={form['paymentSettings.upiIdPrimary']} onChange={e=>set('paymentSettings.upiIdPrimary',e.target.value)} placeholder="merchant@upi"/></div>
            <div><label className={LABEL}>UPI ID Secondary</label><input className={INPUT} value={form['paymentSettings.upiIdSecondary']} onChange={e=>set('paymentSettings.upiIdSecondary',e.target.value)}/></div>
            <div><label className={LABEL}>Merchant Name</label><input className={INPUT} value={form['paymentSettings.upiMerchantName']} onChange={e=>set('paymentSettings.upiMerchantName',e.target.value)}/></div>
          </>)}
          {tab === 'modules' && (
            <div className="space-y-3">
              {[{k:'enabledModules.dineIn',l:'Dine-In',d:'Table-based dining'},{k:'enabledModules.delivery',l:'Delivery',d:'Home delivery orders'},{k:'enabledModules.guestOrdering',l:'Guest Ordering',d:'Order without login'},{k:'enabledModules.chat',l:'Staff Chat',d:'Internal messaging'}].map(f=>(
                <div key={f.k} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div><p className="text-sm text-white font-bold">{f.l}</p><p className="text-[11px] text-gray-500">{f.d}</p></div>
                  <button onClick={()=>set(f.k,!form[f.k])} className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${form[f.k]?'bg-purple-600':'bg-white/10'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[f.k]?'left-6':'left-1'}`}/>
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === 'security' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-purple-400 font-bold mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14}/> Reset Admin Password
                </p>
                <p className="text-[11px] text-gray-500 mb-4">
                  Forcefully update the account password for <span className="text-gray-300 font-bold">{tenant.ownerAdminId?.email || 'this tenant admin'}</span>.
                </p>
                {pwdMsg && (
                  <div className={`p-3 rounded-xl text-xs mb-3 font-bold ${pwdMsg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {pwdMsg}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className={LABEL}>New Password</label>
                    <input type="text" placeholder="Minimum 6 characters" value={newPwd} onChange={e=>setNewPwd(e.target.value)} className={INPUT} />
                  </div>
                  <button type="button" onClick={handleResetPassword} disabled={pwdLoading} className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${BTN_P}`}>
                    {pwdLoading ? 'Processing...' : 'Force Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-7 py-5 border-t border-white/5 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className={`flex-1 py-3 rounded-2xl text-sm font-bold ${BTN_G}`}>Cancel</button>
          <button onClick={handleSave} disabled={loading} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 ${BTN_P}`}>
            <Save size={14}/>{loading?'Saving...':'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Create Restaurant Modal ───────────────────────────────────────────────────
const CreateModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ tenantId:'',slug:'',businessName:'',adminName:'',adminEmail:'',adminPassword:'',adminMobile:'',subscriptionPlan:'FREE' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await saApi.post('/super-admin/tenants', { ...form, businessType: 'RESTAURANT' }); onCreated(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to create'); }
    finally { setLoading(false); }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-[#111] border border-purple-500/20 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 sticky top-0 bg-[#111]">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center"><Building2 size={16} className="text-purple-400"/></div><h2 className="text-lg font-bold text-white">Add Restaurant</h2></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white"><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl p-3">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            {[{k:'tenantId',l:'Tenant ID',p:'restaurant01'},{k:'slug',l:'URL Slug',p:'restaurant01'}].map(f=>(
              <div key={f.k}><label className={LABEL}>{f.l}</label><input required className={INPUT} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>
            ))}
            <div className="col-span-2"><label className={LABEL}>Restaurant Name</label><input required className={INPUT} value={form.businessName} onChange={e=>setForm(p=>({...p,businessName:e.target.value}))} placeholder="Pizza Kings"/></div>
          </div>
          <div><label className={LABEL}>Plan</label><select className={INPUT} value={form.subscriptionPlan} onChange={e=>setForm(p=>({...p,subscriptionPlan:e.target.value}))}>{PLANS.map(p=><option key={p} value={p} className="bg-[#111]">{p}</option>)}</select></div>
          <p className={LABEL + ' pt-2'}>Admin Account</p>
          <div className="grid grid-cols-2 gap-4">
            {[{k:'adminName',l:'Name',t:'text',p:'Admin Name'},{k:'adminMobile',l:'Mobile',t:'tel',p:'9876543210'}].map(f=>(
              <div key={f.k}><label className={LABEL}>{f.l}</label><input required type={f.t} className={INPUT} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>
            ))}
            <div className="col-span-2"><label className={LABEL}>Email</label><input required type="email" className={INPUT} value={form.adminEmail} onChange={e=>setForm(p=>({...p,adminEmail:e.target.value}))} placeholder="admin@restaurant.com"/></div>
            <div className="col-span-2"><label className={LABEL}>Password</label><input required type="password" className={INPUT} value={form.adminPassword} onChange={e=>setForm(p=>({...p,adminPassword:e.target.value}))} placeholder="Min 6 chars"/></div>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-2xl mt-2 flex items-center justify-center gap-2 ${BTN_P}`}>
            {loading?'Creating...':<><Plus size={14}/>Add Restaurant</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('restaurants');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [confirm, setConfirm]   = useState(null);

  const saUser = (() => { try { return JSON.parse(localStorage.getItem('sa_auth'))?.user; } catch { return null; } })();

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([saApi.get('/super-admin/stats'), saApi.get('/super-admin/tenants')]);
      setStats(sRes.data.data);
      setTenants(tRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem('sa_auth'); navigate('/super-admin/login'); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!saUser || saUser.role !== 'SUPER_ADMIN') { navigate('/super-admin/login'); return; }
    load();
  }, []);

  const handleConfirm = async () => {
    const { type, tenant } = confirm;
    if (type === 'delete') await saApi.delete(`/super-admin/tenants/${tenant.tenantId}`);
    else await saApi.patch(`/super-admin/tenants/${tenant.tenantId}/status`);
    setConfirm(null); load();
  };

  const TABS = [
    { id: 'restaurants', label: 'Restaurants', icon: Building2 },
    { id: 'analytics',   label: 'Analytics',   icon: BarChart3  },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Top Navbar ── */}
      <div className="border-b border-white/5 bg-[#0f0f0f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <ShieldCheck size={18} className="text-purple-400"/>
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">Platform Control</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Super Admin</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab===t.id?'bg-purple-600 text-white':'text-gray-500 hover:text-white'}`}>
                <t.icon size={12}/>{t.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={load} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 text-gray-500 hover:text-white transition-all">
              <RefreshCw className={loading?'animate-spin':''} size={15}/>
            </button>
            <button onClick={() => { localStorage.removeItem('sa_auth'); navigate('/super-admin/login'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/30 text-gray-500 hover:text-red-400 text-xs font-bold transition-all">
              <LogOut size={14}/> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Total Restaurants', value:stats.totalTenants,  icon:Building2,  color:'text-purple-400', bg:'bg-purple-400/10' },
              { label:'Active',            value:stats.activeTenants, icon:CheckCircle,color:'text-green-400',  bg:'bg-green-400/10'  },
              { label:'Total Orders',      value:stats.totalOrders,   icon:TrendingUp, color:'text-blue-400',   bg:'bg-blue-400/10'   },
              { label:'Revenue',           value:`₹${(stats.totalRevenue||0).toLocaleString()}`, icon:IndianRupee, color:'text-yellow-400', bg:'bg-yellow-400/10' },
            ].map((s,i) => (
              <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                className={`${CARD} p-5`}>
                <div className="flex items-center justify-between">
                  <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{s.label}</p><p className="text-2xl font-black">{s.value}</p></div>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}><s.icon size={20}/></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Mobile Tabs ── */}
        <div className="flex md:hidden gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab===t.id?'bg-purple-600 text-white':'text-gray-500'}`}>
              <t.icon size={12}/>{t.label}
            </button>
          ))}
        </div>

        {/* ── Restaurants Tab ── */}
        {activeTab === 'restaurants' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Restaurants</h2>
                <p className="text-gray-500 text-sm mt-0.5">{tenants.length} registered</p>
              </div>
              <button onClick={() => setCreateOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs ${BTN_P}`}>
                <Plus size={14}/> Add Restaurant
              </button>
            </div>

            {/* Restaurant Cards */}
            {loading && tenants.length === 0 ? (
              <div className="flex justify-center py-16"><RefreshCw className="animate-spin text-purple-400" size={28}/></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {tenants.map((t, i) => (
                  <motion.div key={t.tenantId} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                    className={`${CARD} p-6 hover:border-purple-500/20 transition-all`}>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-black"
                          style={{ background: t.theme?.primaryColor || '#c9a227' }}>
                          {t.businessName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white">{t.businessName}</p>
                          <p className="text-[11px] text-gray-500 font-mono">/{t.slug}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${STATUS_STYLE[t.status]||'bg-gray-500/10 text-gray-400'}`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Plan</span>
                        <span className={`font-black uppercase tracking-widest px-2 py-0.5 rounded-lg text-[10px] ${PLAN_STYLE[t.subscriptionPlan]||'bg-gray-500/10 text-gray-400'}`}>{t.subscriptionPlan}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Admin</span>
                        <span className="text-gray-300 truncate max-w-[160px]">{t.ownerAdminId?.email || '—'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Database</span>
                        <span className={`text-[10px] font-black uppercase ${t.dbMode==='DEDICATED'?'text-green-400':'text-yellow-400'}`}>{t.dbMode}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      <a href={`/${t.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 text-[10px] font-black uppercase tracking-widest transition-all">
                        <ExternalLink size={11}/> View
                      </a>
                      <button onClick={() => setEditTenant(t)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Edit2 size={11}/> Edit
                      </button>
                      <button onClick={() => setConfirm({ type: t.status==='ACTIVE'?'deactivate':'activate', tenant: t })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t.status==='ACTIVE'?'bg-orange-500/5 border border-orange-500/20 text-orange-400 hover:bg-orange-500/10':'bg-green-500/5 border border-green-500/20 text-green-400 hover:bg-green-500/10'}`}>
                        <Power size={11}/> {t.status==='ACTIVE'?'Off':'On'}
                      </button>
                      <button onClick={() => setConfirm({ type:'delete', tenant: t })}
                        className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  </motion.div>
                ))}
                {tenants.length === 0 && !loading && (
                  <div className="col-span-3 text-center py-16 text-gray-500">
                    <Building2 size={40} className="mx-auto mb-4 opacity-30"/>
                    <p>No restaurants yet.</p>
                    <button onClick={() => setCreateOpen(true)} className={`mt-4 px-6 py-3 rounded-2xl text-xs ${BTN_P}`}>Add First Restaurant</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && stats?.tenantStats && (
          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <BarChart3 size={18} className="text-purple-400"/>
              <h3 className="font-bold text-white">Per-Restaurant Revenue</h3>
            </div>
            <div className="divide-y divide-white/5">
              {stats.tenantStats.map(s => (
                <div key={s._id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-xs">{s._id?.[0]?.toUpperCase()}</div>
                    <span className="font-mono text-sm text-gray-300">{s._id}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right"><p className="text-[10px] text-gray-500 uppercase tracking-widest">Orders</p><p className="font-bold text-white">{s.orders}</p></div>
                    <div className="text-right"><p className="text-[10px] text-gray-500 uppercase tracking-widest">Revenue</p><p className="font-black text-yellow-400">₹{s.revenue?.toLocaleString()}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <CreateModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load(); }} />
      <EditModal isOpen={!!editTenant} tenant={editTenant} onClose={() => setEditTenant(null)} onSaved={() => { setEditTenant(null); load(); }} />
      <AnimatePresence>
        {confirm && <ConfirmModal isOpen={!!confirm} type={confirm.type} tenant={confirm.tenant} onClose={() => setConfirm(null)} onConfirm={handleConfirm} />}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
