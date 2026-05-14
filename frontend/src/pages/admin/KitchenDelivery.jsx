import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import { adminService } from '../../services/admin.service';
import socket from '../../services/socket';
import DeliveryPaymentModal from '../../components/admin/DeliveryPaymentModal';
import {
  ChefHat, Truck, Clock, CheckCircle2, Package,
  RefreshCw, Bell, MapPin, Hash, Printer, Volume2, VolumeX, X
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

// Pure JavaScript Acoustic Audio Alert Engine via Web Audio API
const playAudioChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Arpeggio notes simulating a classic high-end KDS notification chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.24); // D6
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.log("Audio play blocked or unsupported by client framework", e);
  }
};

const OrderCard = ({ order, role, onStatusUpdate, onPaymentCollect, onPrintKot }) => {
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
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[11px] text-text-muted flex items-center gap-1">
              <MapPin size={10} className="text-primary" />
              {order.orderType === 'DINING' ? `Table ${order.tableNumber}` : 'Delivery'}
            </p>
            <button 
              onClick={() => onPrintKot?.(order)}
              className="text-[9px] text-text-muted hover:text-primary transition-colors flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:border-primary/20 cursor-pointer"
              title="Print Kitchen Order Ticket"
            >
              <Printer size={10} /> Print KOT
            </button>
          </div>
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
          className="w-full btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
  const [printKotOrder, setPrintKotOrder] = useState(null);
  const [activeTab, setActiveTab]     = useState('active'); // active | done

  // Advanced ref management for WebSocket sound state to avoid stale closures
  const [audioEnabled, setAudioEnabledState] = useState(false);
  const audioEnabledRef = useRef(false);

  const toggleAudio = () => {
    const nextState = !audioEnabledState;
    setAudioEnabledState(nextState);
    audioEnabledRef.current = nextState;
    if (nextState) {
      playAudioChime();
    }
  };

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

    // New order alert handling with native Web Audio chime triggering
    const handleNew = (order) => {
      setNewOrderAlert(order);
      if (audioEnabledRef.current) {
        playAudioChime();
      }
    };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <RoleIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-playfair font-bold text-white">{roleLabel}</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">
              {activeOrders.length} active · {doneOrders.length} done today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Active Audio State Toggle Button */}
          <button 
            onClick={toggleAudio}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
              audioEnabledState 
                ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                : 'bg-white/5 border-white/10 text-text-muted hover:text-white'
            }`}
            title="Click to toggle proactive browser acoustic chimes on new orders"
          >
            {audioEnabledState ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} />}
            <span>{audioEnabledState ? 'KDS Audio ON' : 'Audio OFF'}</span>
          </button>

          <button onClick={load}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary cursor-pointer">
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit">
        {[
          { id: 'active', label: 'Active', count: activeOrders.length },
          { id: 'done',   label: 'Done',   count: doneOrders.length   },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.id ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>
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
                onPrintKot={(o) => setPrintKotOrder(o)}
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
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center relative shrink-0">
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
                  onClick={() => { 
                    setPrintKotOrder(newOrderAlert);
                    setNewOrderAlert(null); 
                    load(); 
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer size={15} /> Print KOT
                </button>
                <button
                  onClick={() => { setNewOrderAlert(null); load(); }}
                  className="flex-1 btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sophisticated Auto-Thermal Printer KOT output dialog overlay */}
      <AnimatePresence>
        {printKotOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-black rounded-3xl p-6 w-full max-w-xs shadow-2xl relative font-mono text-xs flex flex-col"
            >
              {/* Receipt Output Top bar */}
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-dashed border-gray-300 shrink-0">
                <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                  ESC/POS KOT
                </span>
                <button 
                  onClick={() => setPrintKotOrder(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Printable Body Area */}
              <div id="kot-printable-area" className="space-y-3 py-2 flex-1 overflow-y-auto no-scrollbar">
                <div className="text-center space-y-0.5">
                  <h3 className="font-black text-sm uppercase tracking-wider">KITCHEN TICKET</h3>
                  <p className="text-[10px] text-gray-500">Ref: #{printKotOrder.orderNumber}</p>
                  <p className="text-[10px] font-bold mt-1 bg-gray-100 py-0.5 rounded inline-block px-2">
                    {printKotOrder.orderType === 'DINING' ? `TABLE #${printKotOrder.tableNumber}` : 'DELIVERY PROTOCOL'}
                  </p>
                </div>

                <div className="text-[10px] text-gray-500 pt-2 border-t border-gray-200 flex justify-between">
                  <span>Date: {new Date(printKotOrder.createdAt).toLocaleDateString()}</span>
                  <span>Time: {new Date(printKotOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Items List */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest grid grid-cols-4 font-bold border-b border-gray-100 pb-1">
                    <span className="col-span-3">Item Descriptor</span>
                    <span className="text-right">Qty</span>
                  </div>
                  {printKotOrder.items?.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 text-xs font-bold pt-0.5">
                      <span className="col-span-3 truncate pr-1">{item.name}</span>
                      <span className="text-right text-base font-black">x{item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-2 border-t border-dashed border-gray-400 text-center text-[9px] text-gray-400 space-y-1">
                  <p>*** END OF KOT MESSAGE ***</p>
                  <p className="text-[8px]">DineSync Automated Gateway hardware emulation</p>
                </div>
              </div>

              {/* Hardware Actions Footer */}
              <div className="pt-4 mt-2 border-t border-gray-200 space-y-2 shrink-0">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <Printer size={13} /> Trigger Hardware Print
                </button>
                <button
                  onClick={() => setPrintKotOrder(null)}
                  className="w-full text-gray-500 hover:text-black font-bold py-2 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Dismiss Terminal Preview
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
