import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  FiSearch, FiDollarSign, FiZap, FiRefreshCw,
  FiCheckCircle, FiClock, FiAlertCircle, FiEdit2,
  FiTag, FiGift, FiPlus, FiTrash2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const METHOD_CONFIG = {
  CASH:   { label: 'Cash',   color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  UPI:    { label: 'UPI',    color: 'text-blue-400',   bg: 'bg-blue-400/10',   dot: 'bg-blue-400'   },
  ONLINE: { label: 'Online', color: 'text-purple-400', bg: 'bg-purple-400/10', dot: 'bg-purple-400' },
};

const PAYMENT_STATUS_CONFIG = {
  PAID:    { label: 'Paid',    color: 'text-green-400',  bg: 'bg-green-400/10',  icon: FiCheckCircle },
  PENDING: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: FiClock       },
  FAILED:  { label: 'Failed',  color: 'text-red-400',    bg: 'bg-red-400/10',    icon: FiAlertCircle },
};

const INITIAL_COUPONS = [
  { code: 'WELCOME10', type: 'PERCENT', value: 10, minOrder: 199, isActive: true },
  { code: 'FLAT50', type: 'FLAT', value: 50, minOrder: 299, isActive: true }
];

// Inline override dropdown for a single row
const PaymentStatusDropdown = ({ order, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (status) => {
    setOpen(false);
    setLoading(true);
    try {
      await adminService.updatePaymentStatusAdmin(order._id, status);
      onUpdate();
    } catch {
      alert('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 text-text-muted hover:text-primary text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
      >
        <FiEdit2 size={11} />
        {loading ? 'Saving...' : 'Override'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            className="absolute right-0 mt-2 w-36 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {['PAID', 'PENDING', 'FAILED'].map(s => {
              const cfg = PAYMENT_STATUS_CONFIG[s];
              return (
                <button key={s} onClick={() => handle(s)}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer ${cfg.color}`}>
                  <cfg.icon size={12} />
                  {cfg.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PaymentMgmt = () => {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Top level integration ledger view tab switcher
  const [activeViewTab, setActiveViewTab] = useState('LEDGER'); // 'LEDGER' | 'COUPONS'

  // Persistent coupons configuration array mapped safely for active frontend checkout lookups
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('dinesync_tenant_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch { return INITIAL_COUPONS; }
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'PERCENT', value: '', minOrder: ''
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Cash "Mark Paid" confirm modal
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchPayments();
      setOrders(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkPaidClick = (order) => {
    setSelectedOrder(order);
    setConfirmOpen(true);
  };

  const handleConfirmPaid = async () => {
    setConfirmLoading(true);
    try {
      await adminService.updatePaymentStatusAdmin(selectedOrder._id, 'PAID');
      setConfirmOpen(false);
      load();
    } catch {
      alert('Failed to update payment status');
    } finally {
      setConfirmLoading(false);
    }
  };

  const saveCouponsToStore = (updated) => {
    setCoupons(updated);
    try { localStorage.setItem('dinesync_tenant_coupons', JSON.stringify(updated)); } catch {}
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    const formattedCode = newCoupon.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!formattedCode) {
      setCouponError('Please enter a valid promotional string.');
      return;
    }
    if (coupons.some(c => c.code === formattedCode)) {
      setCouponError('This coupon string already exists.');
      return;
    }
    
    const val = parseFloat(newCoupon.value);
    if (isNaN(val) || val <= 0) {
      setCouponError('Please provide a positive discount multiplier.');
      return;
    }
    
    if (newCoupon.type === 'PERCENT' && val > 100) {
      setCouponError('Percentage drop cannot exceed 100%.');
      return;
    }

    const minO = parseFloat(newCoupon.minOrder) || 0;
    
    const created = [
      ...coupons,
      { code: formattedCode, type: newCoupon.type, value: val, minOrder: minO, isActive: true }
    ];
    
    saveCouponsToStore(created);
    setNewCoupon({ code: '', type: 'PERCENT', value: '', minOrder: '' });
    setCouponSuccess(`Coupon "${formattedCode}" published successfully!`);
    setTimeout(() => setCouponSuccess(''), 3000);
  };

  const handleToggleCoupon = (codeToToggle) => {
    const updated = coupons.map(c => c.code === codeToToggle ? { ...c, isActive: c.isActive === false ? true : false } : c);
    saveCouponsToStore(updated);
  };

  const handleDeleteCoupon = (codeToDelete) => {
    const updated = coupons.filter(c => c.code !== codeToDelete);
    saveCouponsToStore(updated);
  };

  // Stats
  const paidOrders    = orders.filter(o => o.paymentStatus === 'PAID');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING');
  const upiOrders     = orders.filter(o => o.paymentMethod === 'UPI');
  const cashOrders    = orders.filter(o => o.paymentMethod === 'CASH' || !o.paymentMethod);
  const totalRevenue  = paidOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const filtered = orders.filter(o => {
    const customer = o.userId?.name || o.guestName || 'Guest';
    const matchSearch =
      customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const method = o.paymentMethod || 'CASH';
    const matchMethod = methodFilter === 'ALL' || method === methodFilter;
    const matchStatus = statusFilter === 'ALL' || o.paymentStatus === statusFilter;
    return matchSearch && matchMethod && matchStatus;
  });

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (val) => <span className="font-mono text-[10px] text-text-muted">#{val}</span>,
    },
    {
      key: 'userId',
      label: 'Customer',
      render: (user, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-white text-xs">{user?.name || row.guestName || 'Guest'}</span>
          <span className="text-[10px] text-text-muted">{user?.mobile || user?.email || '—'}</span>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (val) => {
        const method = val || 'CASH';
        const cfg = METHOD_CONFIG[method] || METHOD_CONFIG.CASH;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (val) => <span className="font-black text-white">₹{val}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (val) => {
        const status = val || 'PENDING';
        const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;
        const Icon = cfg.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
            <Icon size={10} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'paymentId',
      label: 'UTR / Ref',
      render: (val) => (
        <span className="font-mono text-[10px] text-text-muted">
          {val?.utrNumber || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => (
        <span className="text-[10px] text-text-muted">
          {new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* Top Level Ledger vs Promotional Engine Switcher Header */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveViewTab('LEDGER')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${activeViewTab === 'LEDGER' ? 'bg-primary text-black shadow-lg' : 'text-text-muted hover:text-white'}`}
        >
          <FiDollarSign size={15} /> Payments Ledger
        </button>
        <button 
          onClick={() => setActiveViewTab('COUPONS')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${activeViewTab === 'COUPONS' ? 'bg-primary text-black shadow-lg' : 'text-text-muted hover:text-white'}`}
        >
          <FiTag size={15} /> Promo Coupons & Wallets
        </button>
      </div>

      {activeViewTab === 'LEDGER' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString()}`, icon: FiDollarSign,  color: 'text-primary',    bg: 'bg-primary/10'    },
              { label: 'Paid',            value: paidOrders.length,                   icon: FiCheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10'  },
              { label: 'Cash Orders',     value: cashOrders.length,                   icon: FiClock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'UPI Orders',      value: upiOrders.length,                    icon: FiZap,         color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
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

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative group flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input type="text" placeholder="Search by order ID or customer..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-primary/50 transition-all text-white font-bold text-sm placeholder:text-white/30 shadow-inner" />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
                {['ALL', 'CASH', 'UPI'].map(m => (
                  <button key={m} onClick={() => setMethodFilter(m)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${methodFilter === m ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
                {['ALL', 'PAID', 'PENDING', 'FAILED'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${statusFilter === s ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <button onClick={load}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary cursor-pointer">
                <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
              </button>
            </div>
          </div>

          <AdminTable
            columns={columns}
            data={filtered}
            loading={loading}
            actions={(row) => {
              const method = row.paymentMethod || 'CASH';
              const isCashPending = method === 'CASH' && row.paymentStatus !== 'PAID';

              return (
                <div className="flex items-center gap-2">
                  {/* Cash pending → prominent "Mark Paid" button */}
                  {isCashPending && (
                    <button onClick={() => handleMarkPaidClick(row)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer">
                      <FiCheckCircle size={12} />
                      Mark Paid
                    </button>
                  )}

                  {/* All orders → override dropdown (for UPI mismatch or any correction) */}
                  <PaymentStatusDropdown order={row} onUpdate={load} />
                </div>
              );
            }}
          />
        </>
      ) : (
        /* Coupons & Consumer Account Wallets Promotional Dashboard */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-2"
        >
          {/* Create Code Form Column */}
          <div className="lg:col-span-1 glass p-6 rounded-3xl border border-white/5 space-y-5">
            <div className="border-b border-white/5 pb-4">
              <h3 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
                <FiPlus className="text-primary" /> Publish Promotional String
              </h3>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Configure automated client discount vectors</p>
            </div>

            {couponError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                {couponError}
              </div>
            )}
            {couponSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
                {couponSuccess}
              </div>
            )}

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Coupon String</label>
                <input 
                  type="text" 
                  placeholder="e.g. FLAT50 or WELCOME10"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-xs font-mono uppercase text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Discount Protocol</label>
                  <select 
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full bg-bg-dark border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-xs text-white cursor-pointer"
                  >
                    <option value="PERCENT">% Percentage</option>
                    <option value="FLAT">₹ Flat Off</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Multiplier Value</label>
                  <input 
                    type="number" 
                    placeholder={newCoupon.type === 'PERCENT' ? '10' : '50'}
                    value={newCoupon.value}
                    onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Minimum Cart Threshold (₹)</label>
                <input 
                  type="number" 
                  placeholder="0 for unrestricted access"
                  value={newCoupon.minOrder}
                  onChange={e => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-xs font-mono text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full btn-primary py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all cursor-pointer mt-2"
              >
                Publish Coupon String
              </button>
            </form>
          </div>

          {/* Active Published Catalog & Loyalty Accounts Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Loyalty Engine Banner insight */}
            <div className="glass p-6 rounded-3xl border border-primary/20 bg-primary/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FiGift size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Consumer Account Wallets Active</h4>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    Automated client cashback loop enabled. Storefront guests continuously accumulate <span className="text-primary font-bold">5% digital wallet value cashback</span> on confirmed deliveries to bolster long-term retention metrics.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase tracking-widest shrink-0 self-end sm:self-auto">
                Loop Active
              </span>
            </div>

            {/* Configured Catalog Listing */}
            <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
                <FiTag className="text-primary" /> Configured Promo Inventory
              </h3>
              
              <div className="space-y-3">
                {coupons.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No promotional strings defined yet.</p>
                ) : (
                  coupons.map((c, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${c.isActive !== false ? 'bg-white/[0.02] border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-xs">
                          {c.code}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {c.type === 'PERCENT' ? `${c.value}% OFF total selection` : `₹${c.value} flat discount`}
                          </p>
                          <p className="text-[9px] text-text-muted mt-0.5">
                            {c.minOrder > 0 ? `Valid on investments above ₹${c.minOrder}` : 'No minimum spending barrier'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleCoupon(c.code)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${c.isActive !== false ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-text-muted'}`}
                          title="Toggle live execution context availability"
                        >
                          {c.isActive !== false ? 'Active' : 'Disabled'}
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                          title="Purge string from inventory"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* Cash Mark Paid confirm modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onConfirm={handleConfirmPaid}
        onCancel={() => setConfirmOpen(false)}
        title="Confirm Cash Payment?"
        message={`Mark Order #${selectedOrder?.orderNumber} (₹${selectedOrder?.totalAmount}) as paid in cash?`}
        confirmText={confirmLoading ? 'Saving...' : 'Yes, Mark Paid'}
        type="warning"
      />
    </div>
  );
};

export default PaymentMgmt;
