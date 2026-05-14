import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  FiSearch, FiDollarSign, FiZap, FiRefreshCw,
  FiCheckCircle, FiClock, FiAlertCircle, FiEdit2
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
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 text-text-muted hover:text-primary text-[9px] font-black uppercase tracking-widest transition-all"
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
                  className={`w-full flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${cfg.color}`}>
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
        // val is null for cash orders (no Payment record created), UPI orders have 'UPI'
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
            className="w-full bg-bg-neutral/40 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-primary/40 transition-all text-sm placeholder:text-white/10" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
            {['ALL', 'CASH', 'UPI'].map(m => (
              <button key={m} onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${methodFilter === m ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
            {['ALL', 'PAID', 'PENDING', 'FAILED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>

          <button onClick={load}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary">
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
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
