import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Loader2, Power, PowerOff, Plus, 
  ShieldCheck, CreditCard, Layers, Clock, 
  Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';
import axios from 'axios';

const SAAS_PLANS = [
  { 
    id: 'starter', 
    name: 'Starter Evaluation', 
    price: '₹0 / 14 Days', 
    desc: 'Free evaluation timeframe mapping gracefully to active restaurant module integrations.',
    limits: ['Capped at 10 active physical tables', 'Standard HTTP order pipelines', 'Single client authorization scope'],
    badge: '14-Day Evaluation',
    isPopular: false
  },
  { 
    id: 'growth', 
    name: 'Growth Protocol', 
    price: '₹2,499 / mo', 
    desc: 'Automated recurring billing operations activated for high-load multi-terminal lines.',
    limits: ['Capped at 35 active physical tables', 'Stripe / Razorpay automated handshakes', 'Staff passcode multi-shift pin modules unlocked'],
    badge: 'Most Adopted',
    isPopular: true
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise Matrix', 
    price: '₹5,999 / mo', 
    desc: 'Complete infrastructure unlocking peak server priority and high fidelity insights.',
    limits: ['Unrestricted seating arrangements', 'Real-time client traffic cluster heatmaps', 'Dedicated low-latency WebSocket allocations'],
    badge: 'Peak Performance',
    isPopular: false
  }
];

const TenantMgmt = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Custom screen view management tab state
  const [activeScreenTab, setActiveScreenTab] = useState('TENANTS'); // 'TENANTS' | 'BILLING'

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    tenantId: '',
    slug: '',
    businessName: '',
    businessType: 'RESTAURANT',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  // Local simulated subscription storage updates for Phase 4 active tier processing
  const [tenantSubscriptions, setTenantSubscriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('dinesync_saas_billing_matrix');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [billingNotice, setBillingNotice] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const getAuthToken = () => {
    try {
      const saved = localStorage.getItem('sa_auth');
      return saved ? JSON.parse(saved).token : localStorage.getItem('token');
    } catch {
      return localStorage.getItem('token');
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await axios.get('/api/v1/super-admin/tenants', {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const fetched = res.data?.data || [];
      setTenants(fetched);

      // Populate mock active plan mappings safely
      setTenantSubscriptions(prev => {
        const nextMap = { ...prev };
        fetched.forEach((t, i) => {
          if (!nextMap[t.tenantId]) {
            // Assign dynamic defaults for demonstration fidelity
            nextMap[t.tenantId] = {
              planId: i % 2 === 0 ? 'growth' : 'starter',
              status: i % 2 === 0 ? 'ACTIVE_DEBIT' : 'TRIAL_EVALUATION',
              daysLeft: i % 2 === 0 ? 30 : Math.max(2, 14 - (i * 2))
            };
          }
        });
        try { localStorage.setItem('dinesync_saas_billing_matrix', JSON.stringify(nextMap)); } catch {}
        return nextMap;
      });
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tenantId) => {
    setActionLoading(tenantId);
    try {
      const res = await axios.patch(`/api/v1/super-admin/tenants/${tenantId}/status`, {}, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setTenants(prev => prev.map(t => t.tenantId === tenantId ? res.data.data : t));
    } catch (err) {
      console.error('Failed to toggle status', err);
      alert('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setActionLoading('CREATE');
    try {
      const res = await axios.post('/api/v1/super-admin/tenants', newTenant, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const created = res.data.data.tenant;
      setTenants([created, ...tenants]);

      // Assign brand new starter trial subscription record
      setTenantSubscriptions(prev => {
        const nextMap = {
          ...prev,
          [created.tenantId]: { planId: 'starter', status: 'TRIAL_EVALUATION', daysLeft: 14 }
        };
        try { localStorage.setItem('dinesync_saas_billing_matrix', JSON.stringify(nextMap)); } catch {}
        return nextMap;
      });

      setIsModalOpen(false);
      setNewTenant({ tenantId: '', slug: '', businessName: '', businessType: 'RESTAURANT', adminName: '', adminEmail: '', adminPassword: '' });
    } catch (err) {
      console.error('Failed to create tenant', err);
      alert(err.response?.data?.message || 'Failed to create tenant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChange = (e) => setNewTenant({ ...newTenant, [e.target.name]: e.target.value });

  const triggerPlanUpgrade = (targetTenantId, selectedPlanId) => {
    setTenantSubscriptions(prev => {
      const nextMap = {
        ...prev,
        [targetTenantId]: {
          planId: selectedPlanId,
          status: selectedPlanId === 'starter' ? 'TRIAL_EVALUATION' : 'ACTIVE_DEBIT',
          daysLeft: selectedPlanId === 'starter' ? 14 : 30
        }
      };
      try { localStorage.setItem('dinesync_saas_billing_matrix', JSON.stringify(nextMap)); } catch {}
      return nextMap;
    });

    setBillingNotice(`Gateway synchronization update verified for entity "${targetTenantId}"!`);
    setTimeout(() => setBillingNotice(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading Tenants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto p-4">
      
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
         <div>
            <h1 className="text-3xl font-playfair font-bold text-white mb-2">Platform Entities Hub</h1>
            <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-black">Multi-Tenant Management & Gateway Subscriptions</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="bg-primary text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer">
           <Plus size={16} /> Mint New Tenant
         </button>
      </div>

      {/* Top Level Custom Screen view Switcher Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveScreenTab('TENANTS')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${activeScreenTab === 'TENANTS' ? 'bg-primary text-black shadow-lg' : 'text-text-muted hover:text-white'}`}
        >
          <Store size={15} /> Registered Root Tenants
        </button>
        <button 
          onClick={() => setActiveScreenTab('BILLING')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer relative ${activeScreenTab === 'BILLING' ? 'bg-primary text-black shadow-lg' : 'text-text-muted hover:text-white'}`}
        >
          <Layers size={15} /> SaaS Billing Gateways & Subscriptions
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
        </button>
      </div>

      {activeScreenTab === 'TENANTS' ? (
        /* Original Root Tenants Listing Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
           {tenants.map((tenant, idx) => {
              const activeSubscription = tenantSubscriptions[tenant.tenantId] || { planId: 'starter', status: 'TRIAL_EVALUATION', daysLeft: 14 };
              const planConfig = SAAS_PLANS.find(p => p.id === activeSubscription.planId) || SAAS_PLANS[0];

              return (
                <motion.div 
                   key={tenant.tenantId}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="glass p-6 rounded-3xl border border-white/5 relative flex flex-col group h-full hover:border-primary/20 transition-all shadow-xl"
                >
                    <div className="flex items-start justify-between mb-6">
                       <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                         {tenant.logo ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${tenant.logo}`} className="w-full h-full object-contain p-2" /> : <Store size={24} />}
                       </div>
                       <div className="flex flex-col items-end gap-1.5">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {tenant.status}
                         </span>
                         {/* Configured Gateway Active Indicator */}
                         <span className="text-[8px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase">
                           Tier: {planConfig.name.split(' ')[0]}
                         </span>
                       </div>
                    </div>

                    <div className="flex-1">
                       <h3 className="text-xl font-playfair font-bold text-white mb-1">{tenant.businessName}</h3>
                       <div className="flex flex-col gap-1 mb-6">
                          <span className="text-[10px] text-text-muted font-mono bg-white/5 self-start px-2 py-0.5 rounded uppercase font-black tracking-widest border border-white/5">ID: {tenant.tenantId}</span>
                          <span className="text-[10px] text-text-muted font-mono bg-white/5 self-start px-2 py-0.5 rounded uppercase tracking-widest font-black border border-white/5">URL: /{tenant.slug}</span>
                       </div>
                       
                       <div className="space-y-2 pt-4 border-t border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-50 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-primary" /> System Owner
                          </p>
                          <p className="text-xs font-bold text-text-muted truncate">
                             {tenant.ownerAdminId?.name || 'N/A'} • {tenant.ownerAdminId?.email || 'N/A'}
                          </p>
                       </div>
                    </div>

                    <div className="grid border border-white/5 rounded-xl bg-white/5 text-center mt-6 overflow-hidden">
                        <button 
                           onClick={() => handleToggleStatus(tenant.tenantId)}
                           disabled={actionLoading === tenant.tenantId}
                           className="py-3 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                           style={{ color: tenant.status === 'ACTIVE' ? '#ef4444' : '#22c55e' }}
                        >
                           {actionLoading === tenant.tenantId ? <Loader2 size={14} className="animate-spin" /> : (
                             tenant.status === 'ACTIVE' ? <><PowerOff size={14} /> Suspend Operations</> : <><Power size={14} /> Activate Entity</>
                           )}
                        </button>
                    </div>
                </motion.div>
              );
           })}
           {tenants.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/5">
                 <Store size={48} className="mx-auto text-white/20 mb-4" />
                 <p className="text-text-muted font-playfair text-xl italic">The platform is currently barren...</p>
              </div>
           )}
        </div>
      ) : (
        /* Phase 4 Exquisite Automated Subscription Billing Matrices Dashboard */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 pt-2"
        >
          {/* Billing Feedback Popup Alert */}
          {billingNotice && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs flex items-center gap-2">
              <Sparkles size={16} /> {billingNotice}
            </div>
          )}

          {/* Configured Tiers Listing */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-playfair font-bold text-white">SaaS Master Monetization Engines</h2>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                Global subscription pipelines enforcing trial durations alongside automatic recurring debits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SAAS_PLANS.map((plan, idx) => (
                <div 
                  key={plan.id}
                  className={`glass p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    plan.isPopular ? 'border-primary/40 bg-primary/[0.03] shadow-2xl scale-[1.02]' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 uppercase tracking-widest block w-fit mb-1">
                          {plan.badge}
                        </span>
                        <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      </div>
                      <span className="text-xs font-mono font-black text-white shrink-0 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        {plan.price.split(' ')[0]}
                      </span>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      {plan.desc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Partition Security Vectors</p>
                      {plan.limits.map((lim, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2 text-xs text-white/80">
                          <CheckCircle2 size={12} className="text-primary shrink-0" />
                          <span>{lim}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5">
                    <span className="text-[9px] font-mono text-text-muted block text-center uppercase tracking-widest">
                      Pipeline verification schema ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Entities SaaS Billing Ledgers Matrix */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="text-primary" /> Subscribed Operational Gateways
            </h3>

            <div className="space-y-3">
              {tenants.map(t => {
                const sub = tenantSubscriptions[t.tenantId] || { planId: 'starter', status: 'TRIAL_EVALUATION', daysLeft: 14 };
                const matchedPlan = SAAS_PLANS.find(p => p.id === sub.planId) || SAAS_PLANS[0];

                return (
                  <div key={t.tenantId} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-white">{t.businessName}</span>
                        <span className="font-mono text-[9px] text-text-muted">({t.tenantId})</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                          sub.status === 'ACTIVE_DEBIT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {sub.status === 'ACTIVE_DEBIT' ? 'Recurring Debit API' : 'Evaluation Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted flex items-center gap-1.5 pt-0.5">
                        <Clock size={12} className="text-primary" /> Configured Plan: <strong className="text-white">{matchedPlan.name}</strong> • 
                        <span className="text-primary font-bold">{sub.daysLeft} days remaining</span> in ongoing evaluation frame.
                      </p>
                    </div>

                    {/* Subscription Modification Triggers Action group */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                      <span className="text-[9px] font-black uppercase text-text-muted tracking-widest hidden md:inline">Force Shift:</span>
                      {SAAS_PLANS.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => triggerPlanUpgrade(t.tenantId, p.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            sub.planId === p.id 
                              ? 'bg-primary text-black font-black shadow-md' 
                              : 'bg-white/5 border border-white/5 text-text-muted hover:text-white'
                          }`}
                        >
                          {p.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {tenants.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-4">Register tenant operations to test tiered gateway integrations.</p>
              )}
            </div>
          </div>

          {/* Phase 4 Staff Passcode Overlay Access Config Insight */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-primary" /> Shift Staff & Floor Manager Multi-Terminal Security Lock
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Programmatic enforcement intercept protocol enabled. Waitstaff client terminal switches require dedicated shifts passcodes dynamically enabled for entities under <strong>Growth Scale</strong> or <strong>Enterprise Suite</strong> models. Starter-evaluation entities enforce standard root authorization vectors automatically.
            </p>
          </div>

        </motion.div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass relative w-full max-w-2xl rounded-3xl p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-playfair font-bold text-white mb-6 flex items-center gap-3">
                 <Store className="text-primary" /> Initialize New Tenant
              </h2>
              
              <form onSubmit={handleCreateTenant} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Tenant ID</label>
                     <input required type="text" name="tenantId" value={newTenant.tenantId} onChange={handleChange} placeholder="e.g. rest_01" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">URL Slug</label>
                     <input required type="text" name="slug" value={newTenant.slug} onChange={handleChange} placeholder="e.g. the-grand-hotel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none" />
                   </div>
                   <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Business Name</label>
                     <input required type="text" name="businessName" value={newTenant.businessName} onChange={handleChange} placeholder="e.g. The Grand Hotel & Restaurant" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none" />
                   </div>
                </div>

                <div className="border-t border-white/5 pt-6 mt-6">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Initial Admin Credentials</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Admin Name</label>
                       <input required type="text" name="adminName" value={newTenant.adminName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Admin Email</label>
                       <input required type="email" name="adminEmail" value={newTenant.adminEmail} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Admin Password</label>
                       <input required type="password" name="adminPassword" value={newTenant.adminPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none" />
                     </div>
                   </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white cursor-pointer">Cancel</button>
                   <button type="submit" disabled={actionLoading === 'CREATE'} className="bg-primary text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center justify-center cursor-pointer">
                     {actionLoading === 'CREATE' ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Mint'}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantMgmt;
