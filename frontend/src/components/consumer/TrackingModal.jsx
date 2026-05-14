import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  Receipt, 
  Truck, 
  Clock, 
  XCircle, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import socket from '../../services/socket';
import { publicService } from '../../services/public.service';

const TrackingModal = ({ orderId, isOpen, onClose, tenant, slug }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchOrder = async () => {
        try {
          const res = await publicService.fetchOrderById(orderId);
          setOrder(res.data);
        } catch (err) {
          console.error("Tracking Error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
      
      socket.on('order:updated', (updated) => {
        if (updated._id === orderId) setOrder(updated);
      });
      return () => socket.off('order:updated');
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const isCompleted = order?.orderStatus === 'DELIVERED' || order?.orderStatus === 'SERVED';
  const isCancelled = order?.orderStatus === 'CANCELLED';
  const isActive = order && !isCompleted && !isCancelled;

  const statusSteps = order?.orderType === 'DINING' 
    ? ['RECEIVED', 'PREPARING', 'READY', 'SERVED']
    : ['RECEIVED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const currentIdx = statusSteps.indexOf(order?.orderStatus);
  const progressPct = (currentIdx / (statusSteps.length - 1)) * 100;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl glass border border-white/10 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
             <div>
               <h3 className="text-2xl font-playfair font-bold text-white">Live Ritual Status</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Ref: #{order?.orderNumber}</p>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-white">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                 <Loader2 className="animate-spin text-primary" size={48} />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Syncing Connection...</p>
              </div>
            ) : isCancelled ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-12 gap-6">
                 <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <XCircle size={48} />
                 </div>
                 <h2 className="text-4xl font-playfair font-bold text-white">Order Cancelled</h2>
                 <p className="text-text-muted italic max-w-sm mb-6">Deepest apologies. Your order was cancelled due to kitchen constraints or other unforeseen hurdles. We invite you to attempt the ritual again.</p>
                 <button onClick={onClose} className="btn-primary px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Acknowledge</button>
              </motion.div>
            ) : isCompleted ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-12 gap-6">
                 <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={48} />
                 </div>
                 <h2 className="text-4xl font-playfair font-bold text-white">Successfully {order.orderStatus === 'SERVED' ? 'Served' : 'Delivered'}</h2>
                 <p className="text-text-muted italic max-w-sm mb-6">The culinary journey is complete. We trust every detail met your expectations. Until our next encounter.</p>
                 <button onClick={onClose} className="btn-primary px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Excellent</button>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* Active Tracking UI */}
                <div className="flex flex-col items-center text-center">
                   <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-6 shadow-2xl border border-primary/20 text-primary">
                      {order.orderStatus === 'PREPARING' ? <Loader2 className="animate-spin" size={32} /> : <Clock className="animate-pulse" size={32} />}
                   </div>
                   <h2 className="text-3xl font-playfair font-bold text-white tracking-tight">
                     {order.orderStatus === 'RECEIVED' ? 'Ritual Acknowledged' : 'Crafting Excellence'}
                   </h2>
                   <p className="text-text-muted italic text-sm mt-3 font-light">
                      Currently {order.orderStatus.toLowerCase().replace('_', ' ')} for {order.orderType === 'DINING' ? `Table ${order.tableNumber}` : 'your location'}
                   </p>
                </div>

                {/* Progress Mini-Bar */}
                <div className="relative py-8">
                  <div className="absolute top-12 left-10 right-10 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} className="h-full bg-primary" />
                  </div>
                  <div className="relative flex justify-between">
                     {statusSteps.map((step, idx) => (
                        <div key={step} className="flex flex-col items-center gap-4">
                           <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-700 ${idx <= currentIdx ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/5 text-white/20'}`}>
                              {idx < currentIdx ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                           </div>
                        </div>
                     ))}
                  </div>
                </div>

                {/* Selection Details */}
                <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
                   <div className="flex items-center gap-3 mb-4">
                      <Receipt size={18} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Selection Items</span>
                   </div>
                   <div className="space-y-4 max-h-[20vh] overflow-y-auto no-scrollbar pr-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                           <span className="text-white/80 font-medium">{item.name} <span className="text-[10px] text-text-muted ml-2">X{item.qty || item.quantity}</span></span>
                           <span className="font-black text-primary">₹{item.price * (item.qty || item.quantity)}</span>
                        </div>
                      ))}
                   </div>
                   <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Investment</span>
                      <span className="text-3xl font-playfair font-bold text-primary">₹{order.totalAmount}</span>
                   </div>
                </div>

                {/* UPI Panel */}
                {order.paymentMethod === 'UPI' && order.paymentStatus === 'PENDING' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          <Smartphone size={20} />
                       </div>
                       <div>
                          <h4 className="text-xl font-bold text-white">Complete Payment</h4>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Pay via scanned QR or UPI App</p>
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                       <div className="bg-white p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi'}&pn=${encodeURIComponent(tenant?.businessName || 'Pizza King')}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + order.orderNumber)}`)}`} 
                            alt="UPI QR" 
                            className="w-40 h-40" 
                          />
                       </div>
                       <div className="flex-1 w-full space-y-4">
                          <a 
                            href={`upi://pay?pa=${tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi'}&pn=${encodeURIComponent(tenant?.businessName || 'Pizza King')}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + order.orderNumber)}`}
                            className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-primary active:scale-95 shadow-xl"
                          >
                             <Smartphone size={18} /> Open UPI App
                          </a>
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                             <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-text-muted mb-1">
                                <span>Payable ID</span>
                                <ShieldCheck size={10} className="text-primary" />
                             </div>
                             <p className="text-sm font-mono font-bold text-white truncate">
                                {tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi'}
                             </p>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-8 border-t border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
             <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-green-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Secured Protocol</span>
             </div>
             <p className="text-[9px] text-text-muted italic">Verified by {tenant?.businessName}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackingModal;
