import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  ChefHat, Truck, Plus, RefreshCw, UserCheck, UserX,
  Trash2, X, TrendingUp, Package, IndianRupee, Users
} from 'lucide-react';

const ROLE_CONFIG = {
  KITCHEN:  { label: 'Kitchen',  icon: ChefHat, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  DELIVERY: { label: 'Delivery', icon: Truck,    color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
};

const AddStaffModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm]     = useState({ name: '', email: '', mobile: '', password: '', role: 'KITCHEN' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const reset = () => { setForm({ name: '', email: '', mobile: '', password: '', role: 'KITCHEN' }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await adminService.createStaff(form);
      reset(); onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff account');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <h2 className="text-lg font-playfair font-bold text-white">Add Staff Member</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            {['KITCHEN', 'DELIVERY'].map(r => {
              const cfg = ROLE_CONFIG[r];
              return (
                <button type="button" key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${form.role === r ? `${cfg.border} ${cfg.bg} ${cfg.color}` : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'}`}>
                  <cfg.icon size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {[
            { key: 'name',     label: 'Full Name',    type: 'text',     placeholder: 'e.g. Ravi Kumar' },
            { key: 'email',    label: 'Email',         type: 'email',    placeholder: 'staff@example.com' },
            { key: 'mobile',   label: 'Mobile',        type: 'tel',      placeholder: '9876543210' },
            { key: 'password', label: 'Password',      type: 'password', placeholder: 'Min 6 characters' },
          ].map(field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{field.label}</label>
              <input type={field.type} required value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:border-primary/40 transition-all text-sm"
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
            {loading ? 'Creating...' : 'Create Staff Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const StaffMgmt = () => {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [addOpen, setAddOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchStaff();
      setStaff(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (id) => {
    try { await adminService.toggleStaffStatus(id); load(); }
    catch { alert('Failed to update status'); }
  };

  const handleDelete = async () => {
    try { await adminService.deleteStaff(deleteTarget._id); setDeleteTarget(null); load(); }
    catch { alert('Failed to delete staff'); }
  };

  const filtered = roleFilter === 'ALL' ? staff : staff.filter(s => s.role === roleFilter);
  const kitchenCount  = staff.filter(s => s.role === 'KITCHEN').length;
  const deliveryCount = staff.filter(s => s.role === 'DELIVERY').length;
  const activeCount   = staff.filter(s => s.isActive).length;

  // Monthly stats from first staff member (shared stats)
  const monthlyStats = staff[0]?.monthlyStats;

  return (
    <div className="space-y-8 pb-10">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff',       value: staff.length,                                    icon: Users,        color: 'text-primary',    bg: 'bg-primary/10'    },
          { label: 'Kitchen',           value: kitchenCount,                                    icon: ChefHat,      color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Delivery',          value: deliveryCount,                                   icon: Truck,        color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
          { label: 'Active',            value: activeCount,                                     icon: UserCheck,    color: 'text-green-400',  bg: 'bg-green-400/10'  },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={22} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Income Summary */}
      {monthlyStats && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white">Monthly Overview</h3>
              <p className="text-[10px] text-text-muted">{monthlyStats.month}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-orange-400" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Kitchen Orders</p>
              </div>
              <p className="text-2xl font-black text-white">{monthlyStats.ordersHandled}</p>
              <p className="text-[10px] text-text-muted mt-1">Prepared this month</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={14} className="text-blue-400" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Deliveries</p>
              </div>
              <p className="text-2xl font-black text-white">{monthlyStats.ordersHandled}</p>
              <p className="text-[10px] text-text-muted mt-1">Completed this month</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee size={14} className="text-primary" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Revenue Generated</p>
              </div>
              <p className="text-2xl font-black text-primary">₹{(monthlyStats.revenueGenerated || 0).toLocaleString()}</p>
              <p className="text-[10px] text-text-muted mt-1">Paid orders this month</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
          {['ALL', 'KITCHEN', 'DELIVERY'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary">
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
          <button onClick={() => setAddOpen(true)}
            className="btn-primary px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Plus size={15} /> Add Staff
          </button>
        </div>
      </div>

      {/* Staff Cards */}
      {loading && staff.length === 0 ? (
        <div className="flex justify-center py-16"><RefreshCw className="animate-spin text-primary" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl border border-white/5 p-16 text-center">
          <Users size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted font-bold">No staff members found.</p>
          <button onClick={() => setAddOpen(true)} className="btn-primary mt-6 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
            <Plus size={14} /> Add First Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((member, i) => {
              const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.KITCHEN;
              const RoleIcon = cfg.icon;
              return (
                <motion.div key={member._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass rounded-3xl border ${cfg.border} p-6 space-y-5`}>

                  {/* Avatar + Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      {member.image
                        ? <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                        : <RoleIcon size={24} className={cfg.color} />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white truncate">{member.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                          <RoleIcon size={9} />{cfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">{member.email || member.mobile}</p>
                      <p className="text-[11px] text-text-muted">{member.mobile}</p>
                    </div>
                  </div>

                  {/* Monthly mini stats */}
                  {member.monthlyStats && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-lg font-black text-white">{member.monthlyStats.ordersHandled}</p>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest">Orders</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${member.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </p>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest">Status</p>
                      </div>
                    </div>
                  )}

                  {/* Joined */}
                  <p className="text-[10px] text-text-muted">
                    Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-white/5">
                    <button onClick={() => handleToggleStatus(member._id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        member.isActive
                          ? 'border-red-400/20 bg-red-400/5 text-red-400 hover:bg-red-400/10'
                          : 'border-green-400/20 bg-green-400/5 text-green-400 hover:bg-green-400/10'
                      }`}>
                      {member.isActive ? <><UserX size={13} /> Block</> : <><UserCheck size={13} /> Activate</>}
                    </button>
                    <button onClick={() => setDeleteTarget(member)}
                      className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AddStaffModal isOpen={addOpen} onClose={() => setAddOpen(false)} onCreated={() => { setAddOpen(false); load(); }} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remove Staff Member?"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Yes, Remove"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default StaffMgmt;
