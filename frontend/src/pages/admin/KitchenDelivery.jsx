import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import { adminService } from '../../services/admin.service';
import socket from '../../services/socket';
import DeliveryPaymentModal from '../../components/admin/DeliveryPaymentModal';
import {
  ChefHat, Truck, Clock, CheckCircle2, Package,
  RefreshCw, Bell, MapPin, Hash
} from 'lucide-react';

const STATUS_FLOW = {
  KITCHEN:  ['RECEIVED', 'PREPARING', 'READY'],
  DELIVERY: ['READY', 'OUT_FOR_DELIVERY', 'DELIVERED'],
};

const STATUS_CONFIG = {
  RECEIVED:         { label: 'Received',        color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  PREPARING:        { label: 'Preparing',        color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
  READY:            { label: 'Ready',            color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  DELIVERED:        { label: 'Delivered',        color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20'  },
  CANCELLED:        { label: 'Cancelled',        color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20'    },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/20'   },
};

// Next status button label
const NEXT_ACTION = {
  RECEIVED:         { label: 'Start Preparing', next: 'PREPARING' },
  PREPARING:        { label: 'Mark Ready',       next: 'READY'     },
  READY:            { label: 'Out for Delivery', next: 'OUT_FOR_DELIVERY' },
  OUT_FOR_DELIVERY: { label: 'Mark Delivered',   next: 'DELIVERED' },
};

const OrderCard = ({ order, role, onStatusUpdate, onPaymentCollect }) => {
  const [loading, setLoading] = useState(false);
  const status = order.orderStatus;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;
  const nextAction = NEXT_ACTION[status];

  // Determine if this card is actionable for this role
  // All roles can advance any order — kitchen and delivery both can deliver
  const isActionable = !!nextAction;

  const handleNext = async () => {
    if (!nextAction) return;
    // If marking DELIVERED and unpaid → trigger payment modal
    const isUnpaid = order.paymentStatus !== 'PAID';
    if (nextAction.next === 'DELIVERED' && isUnpaid) {
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-3xl border ${cfg.border} p-6 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] text-text-muted">#{order.orderNumber}</span>
          <p className="font-bold text-white mt-0.5">
            {order.userId?.name || order.guestName || 'Guest'}
          </p>
          <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-primary" />
            {order.orderType === 'DINING' ? `Table ${order.tableNumber}` : 'Delivery'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} flex-shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')} animate-pulse`} />
          {cfg.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 bg-black/20 rounded-2xl p-3 border border-white/5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-text-muted">
              <span className="text-primary font-black">{item.qty}x</span> {item.name}
            </span>
            <span className="text-white font-bold">₹{(item.discountedPrice ?? item.price) * item.qty}</span>
          </div>
        ))}
        <div className="pt-2 mt-1 border-t border-white/5 flex justify-between">
          <span className="text-[10px] text-text-muted uppercase tracking-widest">Total</span>
          <span className="font-black text-primary">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Time */}
      <p className="text-[10px] text-text-muted flex items-center gap-1.5">
        <Clock size={10} />
        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Action button */}
      {isActionable && nextAction && (
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <RefreshCw size={14} className="animate-spin" />
            : <CheckCircle2 size={14} />
          }
          {loading ? 'Updating...' : nextAction.label}
        </button>
      )}
    </motion.div>
  );
};

const KitchenDelivery = () => {
  const { user } = useSelector(selectAuth);
  const role = user?.role; // 'KITCHEN' | 'DELIVERY'

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [paymentOrder, setPaymentOrder]   = useState(null);
  const [activeTab, setActiveTab]     = useState('active'); // active | done

  const relevantStatuses = {
    KITCHEN:  { active: ['RECEIVED', 'PREPARING'], done: ['READY', 'DELIVERED', 'CANCELLED'] },
    DELIVERY: { active: ['READY', 'OUT_FOR_DELIVERY'], done: ['DELIVERED', 'CANCELLED'] },
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchOrders();
      setOrders(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();

    // New order alert
    const handleNew = (order) => setNewOrderAlert(order);

    // Live status update
    const handleUpdate = (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
    };

    socket.on('order:new', handleNew);
    socket.on('order:updated', handleUpdate);
    return () => {
      socket.off('order:new', handleNew);
      socket.off('order:updated', handleUpdate);
    };
  }, [load]);

  const statuses = relevantStatuses[role] || relevantStatuses.KITCHEN;
  const activeOrders = orders.filter(o => statuses.active.includes(o.orderStatus));
  const doneOrders   = orders.filter(o => statuses.done.includes(o.orderStatus));
  const displayed    = activeTab === 'active' ? activeOrders : doneOrders;

  const roleLabel = role === 'KITCHEN' ? 'Kitchen Terminal' : 'Delivery Fleet';
  const RoleIcon  = role === 'KITCHEN' ? ChefHat : Truck;

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <RoleIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-playfair font-bold text-white">{roleLabel}</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">
              {activeOrders.length} active · {doneOrders.length} done today
            </p>
          </div>
        </div>
        <button onClick={load}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary">
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit">
        {[
          { id: 'active', label: 'Active', count: activeOrders.length },
          { id: 'done',   label: 'Done',   count: doneOrders.length   },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
            {tab.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-text-muted'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-primary" size={28} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="glass rounded-3xl border border-white/5 p-16 text-center">
          <Package size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted font-bold">
            {activeTab === 'active' ? 'No active orders right now.' : 'Nothing completed yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayed.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                role={role}
                onStatusUpdate={load}
                onPaymentCollect={(o) => setPaymentOrder(o)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New order alert popup */}
      <AnimatePresence>
        {newOrderAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-neutral border border-primary/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-yellow-400 to-orange-500" />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <Bell className="text-primary relative z-10" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">New Order!</h3>
                  <p className="text-[10px] font-mono text-text-muted">{newOrderAlert.orderNumber}</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Type</span>
                  <span className="text-white font-bold">{newOrderAlert.orderType}</span>
                </div>
                {newOrderAlert.tableNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Table</span>
                    <span className="text-white font-bold">{newOrderAlert.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Items</span>
                  <span className="text-white font-bold">{newOrderAlert.items?.length}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/5 pt-2">
                  <span className="text-text-muted">Total</span>
                  <span className="text-primary font-black">₹{newOrderAlert.totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setNewOrderAlert(null); load(); }}
                  className="flex-1 btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} /> Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment collection modal for delivery */}
      <DeliveryPaymentModal
        isOpen={!!paymentOrder}
        order={paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onDone={() => { setPaymentOrder(null); load(); }}
      />
    </div>
  );
};

export default KitchenDelivery;
