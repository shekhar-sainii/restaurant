import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Loader2, Power, PowerOff, Plus, ShieldCheck, CreditCard } from 'lucide-react';
import axios from 'axios';

const TenantMgmt = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
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
      setTenants(res.data.data);
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
      setTenants([res.data.data.tenant, ...tenants]);
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
         <div>
            <h1 className="text-3xl font-playfair font-bold text-white mb-2">Tenant Management</h1>
            <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-black">Administer {tenants.length} Root Entities</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="bg-primary text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
           <Plus size={16} /> Mint New Tenant
         </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {tenants.map((tenant, idx) => (
            <motion.div 
               key={tenant.tenantId}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="glass p-6 rounded-3xl border border-white/5 relative flex flex-col group h-full hover:border-primary/20 transition-all shadow-xl"
            >
                <div className="flex items-start justify-between mb-6">
                   <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                     {tenant.logo ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${tenant.logo}`} className="w-full h-full object-contain p-2" /> : <Store size={24} />}
                   </div>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {tenant.status}
                   </span>
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
                       className="py-3 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                       style={{ color: tenant.status === 'ACTIVE' ? '#ef4444' : '#22c55e' }}
                    >
                       {actionLoading === tenant.tenantId ? <Loader2 size={14} className="animate-spin" /> : (
                         tenant.status === 'ACTIVE' ? <><PowerOff size={14} /> Suspend Operations</> : <><Power size={14} /> Activate Entity</>
                       )}
                    </button>
                </div>
            </motion.div>
         ))}
         {tenants.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/5">
               <Store size={48} className="mx-auto text-white/20 mb-4" />
               <p className="text-text-muted font-playfair text-xl italic">The platform is currently barren...</p>
            </div>
         )}
      </div>

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
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white">Cancel</button>
                   <button type="submit" disabled={actionLoading === 'CREATE'} className="bg-primary text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center justify-center">
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
