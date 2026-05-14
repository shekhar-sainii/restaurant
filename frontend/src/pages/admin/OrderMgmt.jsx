import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import Modal from '../../components/common/Modal';
import DeliveryPaymentModal from '../../components/admin/DeliveryPaymentModal';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../../services/socket';
import { 
  FiSearch, 
  FiShoppingBag, 
  FiClock, 
  FiCheckCircle, 
  FiTruck,
  FiEye,
  FiRefreshCw,
  FiUser,
  FiHash,
  FiTarget,
  FiCreditCard,
  FiMapPin
} from 'react-icons/fi';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

// ... (rest of the component imports)

const STATUS_OPTIONS = [
  { id: 'RECEIVED',         label: 'Received',        color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'PREPARING',        label: 'Preparing',        color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  { id: 'READY',            label: 'Ready',            color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'DELIVERED',        label: 'Delivered',        color: 'text-green-500',  bg: 'bg-green-500/10' },
  { id: 'CANCELLED',        label: 'Cancelled',        color: 'text-red-500',    bg: 'bg-red-500/10' },
];

const NEXT_ACTION = {
  RECEIVED:         { label: 'Start Preparing',  next: 'PREPARING'        },
  PREPARING:        { label: 'Mark Ready',        next: 'READY'            },
  READY:            { label: 'Out for Delivery',  next: 'OUT_FOR_DELIVERY' },
  OUT_FOR_DELIVERY: { label: 'Mark Delivered',    next: 'DELIVERED'        },
};

// Card used on mobile / kitchen / delivery views
const OrderCard = ({ order, role, onStatusUpdate, onPaymentCollect, onDetail }) => {
  const [loading, setLoading] = useState(false);
  const status = order.orderStatus;
  const cfg = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];
  const nextAction = NEXT_ACTION[status];

  const isActionable = !!nextAction; // all roles can advance any order

  const handleNext = async () => {
    if (!nextAction) return;
    const isCashUnpaid = (!order.paymentMethod || order.paymentMethod === 'CASH')
      && order.paymentStatus !== 'PAID';
    if (nextAction.next === 'DELIVERED' && isCashUnpaid) {
      onPaymentCollect(order);
      return;
    }
    setLoading(true);
    try {
      await adminService.updateOrderStatus(order._id, nextAction.next);
      onStatusUpdate();
    } catch { alert('Failed to update status'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-3xl border ${cfg?.color?.replace('text-', 'border-')}/20 p-5 space-y-4`}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-[10px] text-text-muted block">#{order.orderNumber}</span>
          <p className="font-bold text-white truncate">{order.userId?.name || order.guestName || 'Guest'}</p>
          <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
            <FiMapPin size={10} className="text-primary flex-shrink-0" />
            {order.orderType === 'DINING' ? `Table ${order.tableNumber}` : 'Delivery'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${cfg?.bg} ${cfg?.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg?.color?.replace('text-', 'bg-')} animate-pulse`} />
          {cfg?.label}
        </span>
      </div>

      {/* Items */}
      <div className="bg-black/20 rounded-2xl p-3 border border-white/5 space-y-1.5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-text-muted"><span className="text-primary font-black">{item.qty}x</span> {item.name}</span>
            <span className="text-white font-bold">₹{(item.discountedPrice ?? item.price) * item.qty}</span>
          </div>
        ))}
        <div className="pt-1.5 mt-1 border-t border-white/5 flex justify-between">
          <span className="text-[10px] text-text-muted uppercase tracking-widest">Total</span>
          <span className="font-black text-primary text-sm">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex gap-2">
        <button onClick={() => onDetail(order)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all text-text-muted flex-shrink-0">
          <FiEye size={15} />
        </button>

        {isActionable && nextAction && (
          <button onClick={handleNext} disabled={loading}
            className="flex-1 btn-primary py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50">
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            {loading ? 'Updating...' : nextAction.label}
          </button>
        )}

        {/* Admin: also show status dropdown */}
        {role === 'ADMIN' && (
          <select value={status}
            onChange={(e) => { /* handled via card button for mobile, keep for admin */ }}
            className="bg-white/5 border border-white/5 rounded-xl text-[9px] px-2 py-1 outline-none text-text-muted hover:border-primary/40 focus:border-primary transition-all cursor-pointer hidden"
          />
        )}
      </div>
    </motion.div>
  );
};

const OrderMgmt = () => {
  const { user } = useSelector(selectAuth);
  const role = user?.role || 'ADMIN';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');

  // Payment collection modal — shown after DELIVERED on cash orders
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.fetchOrders();
      // Our backend now populates user and products thanks to the BaseRepository fix
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const handleUpdate = (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
    };
    socket.on('order:updated', handleUpdate);
    return () => socket.off('order:updated', handleUpdate);
  }, []);

  const handleOpenStatusModal = (order, newStatus) => {
    setSelectedOrder(order);
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedOrder || !pendingStatus) return;

    // For unpaid orders being marked DELIVERED:
    // DON'T update status yet — open payment modal first.
    // Status will be updated AFTER payment is confirmed inside DeliveryPaymentModal.
    const isUnpaid = selectedOrder.paymentStatus !== 'PAID';

    if (pendingStatus === 'DELIVERED' && isUnpaid) {
      setIsStatusModalOpen(false);
      setIsPaymentModalOpen(true);
      return;
    }

    // All other status changes — update immediately
    try {
      await adminService.updateOrderStatus(selectedOrder._id, pendingStatus);
      setIsStatusModalOpen(false);
      loadOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const customerName = o.userId?.name || o.guestName || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'orderNumber', 
      label: 'Order ID', 
      render: (val) => <span className="font-mono text-[10px] text-text-muted">#{val}</span>
    },
    { 
      key: 'userId', 
      label: 'Customer', 
      render: (user, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-white">{user?.name || row.guestName || 'Guest'}</span>
          <span className="text-[10px] text-text-muted">{user?.mobile || row.guestMobile || 'No Mobile'}</span>
        </div>
      )
    },
    { 
      key: 'items', 
      label: 'Order Details', 
      render: (items) => (
        <div className="max-w-[200px]">
          <p className="truncate text-xs text-text-muted">
            {items?.map(item => `${item.qty}x ${item.name}`).join(', ') || 'Processing...'}
          </p>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 inline-block">
            {items?.length || 0} Items
          </span>
        </div>
      )
    },
    { 
      key: 'totalAmount', 
      label: 'Total', 
      render: (val) => <span className="font-black text-white">₹{val}</span>
    },
    { 
      key: 'orderStatus', 
      label: 'Progress', 
      render: (status, row) => {
        const config = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];
        return (
          <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
              {config.label}
            </span>
            <select
              value={status}
              onChange={(e) => handleOpenStatusModal(row, e.target.value)}
              className="bg-white/5 border border-white/5 rounded-lg text-[9px] px-2 py-1 outline-none text-text-muted hover:border-primary/40 focus:border-primary transition-all cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id} className="bg-bg-dark">{opt.label}</option>
              ))}
            </select>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Dashboard Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Live Orders', count: orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length, icon: FiShoppingBag, color: 'text-primary' },
           { label: 'Pending', count: orders.filter(o => o.orderStatus === 'PENDING').length, icon: FiClock, color: 'text-yellow-500' },
           { label: 'Ready', count: orders.filter(o => o.orderStatus === 'READY').length, icon: FiCheckCircle, color: 'text-purple-500' },
           { label: 'Delivered', count: orders.filter(o => o.orderStatus === 'DELIVERED').length, icon: FiTruck, color: 'text-green-500' },
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl"
           >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-20 h-20 ${stat.color.replace('text-', 'bg-')}/5 rounded-full blur-3xl`} />
           </motion.div>
         ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-neutral/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all placeholder:text-white/10 text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
            {['ALL', 'RECEIVED', 'READY', 'DELIVERED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button 
            onClick={loadOrders}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
          </button>
        </div>
      </div>

      {/* Card view: always for KITCHEN/DELIVERY; on mobile for ADMIN */}
      <div className={role !== 'ADMIN' ? 'block' : 'block md:hidden'}>
        {loading && filteredOrders.length === 0 ? (
          <div className="flex justify-center py-16">
            <FiRefreshCw className="animate-spin text-primary" size={24} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass rounded-3xl border border-white/5 p-12 text-center text-text-muted">No orders found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredOrders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  role={role}
                  onStatusUpdate={loadOrders}
                  onPaymentCollect={(o) => { setSelectedOrder(o); setIsPaymentModalOpen(true); }}
                  onDetail={handleOpenDetail}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Table view: desktop only for ADMIN */}
      {role === 'ADMIN' && (
        <div className="hidden md:block">
          <AdminTable
            columns={columns}
            data={filteredOrders}
            loading={loading}
            actions={(row) => (
              <button
                onClick={() => handleOpenDetail(row)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all text-text-muted"
              >
                <FiEye size={16} />
              </button>
            )}
          />
        </div>
      )}

      {/* Order Intelligence Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Order Intelligence"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">System ID</span>
                <p className="text-sm font-mono text-primary font-bold">#{selectedOrder.orderNumber}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                STATUS_OPTIONS.find(s => s.id === selectedOrder.orderStatus)?.bg || 'bg-primary/10'
              } ${
                STATUS_OPTIONS.find(s => s.id === selectedOrder.orderStatus)?.color || 'text-primary'
              }`}>
                {selectedOrder.orderStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <FiUser className="text-primary mb-1" />
                <p className="text-[10px] text-text-muted uppercase font-black">Customer</p>
                <p className="text-sm text-white font-bold">{selectedOrder.userId?.name || selectedOrder.guestName || 'Guest'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <FiTarget className="text-primary mb-1" />
                <p className="text-[10px] text-text-muted uppercase font-black">Table #</p>
                <p className="text-sm text-white font-bold">{selectedOrder.tableNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <FiHash className="text-primary" /> Selection Breakdown
              </h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                        {item.qty}x
                      </span>
                      <span className="text-white/80">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">₹{(item.discountedPrice || item.price) * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                   <FiCreditCard className="text-primary" />
                   <span className="font-black uppercase text-[10px] tracking-widest text-text-muted">Total Due</span>
                </div>
                <span className="font-black text-primary">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
               <p className="text-[9px] text-text-muted text-center uppercase font-black tracking-widest">
                 Placed on {new Date(selectedOrder.createdAt).toLocaleString()} • Electronic Settlement Verified
               </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Confirmation Modal */}
      <ConfirmModal
        isOpen={isStatusModalOpen}
        title="Update Order Status?"
        message={`Are you sure you want to change order #${selectedOrder?.orderNumber} status to "${pendingStatus}"?`}
        confirmText="Update Status"
        onConfirm={handleStatusConfirm}
        onCancel={() => setIsStatusModalOpen(false)}
        type="warning"
      />

      {/* Payment Collection Modal — for cash orders being marked DELIVERED */}
      <DeliveryPaymentModal
        isOpen={isPaymentModalOpen}
        order={selectedOrder}
        onClose={() => { setIsPaymentModalOpen(false); loadOrders(); }}
        onDone={() => { setIsPaymentModalOpen(false); loadOrders(); }}
      />
    </div>
  );
};

export default OrderMgmt;
