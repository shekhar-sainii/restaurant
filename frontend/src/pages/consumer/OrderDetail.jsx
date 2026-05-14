import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MapPin, 
  Utensils, 
  Home, 
  Smartphone, 
  ArrowLeft,
  ChevronRight,
  Receipt,
  Truck,
  QrCode,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { publicService } from '../../services/public.service';
import socket from '../../services/socket';
import { useTenant } from '../../context/TenantContext';

const OrderDetail = () => {
  const { id } = useParams();
  const { tenant, slug } = useTenant();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await publicService.fetchOrderById(id);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    socket.on('order:updated', (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
      }
    });

    return () => socket.off('order:updated');
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="animate-spin text-primary" size={64} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Syncing Ritual...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6">
      <XCircle size={64} className="text-red-500 mb-6" />
      <h2 className="text-3xl font-playfair font-bold mb-4">Order Record Missing</h2>
      <Link to={`/${slug}`} className="btn-primary px-12 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-black">
        Return to Storefront
      </Link>
    </div>
  );

  const statusSteps = order.orderType === 'DINING' 
    ? ['RECEIVED', 'PREPARING', 'READY', 'SERVED']
    : ['RECEIVED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const stepLabels = {
    RECEIVED: 'Received',
    PREPARING: 'Preparing',
    READY: 'Cooked',
    SERVED: 'Served',
    OUT_FOR_DELIVERY: 'On Way',
    DELIVERED: 'Arrived'
  };

  const currentIdx = statusSteps.indexOf(order.orderStatus);
  const progressPct = (currentIdx / (statusSteps.length - 1)) * 100;

  // UPI Data Generation if pending
  const isUpiPending = order.paymentMethod === 'UPI' && order.paymentStatus === 'PENDING';
  const dummyUpi = tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi';
  const upiLink = `upi://pay?pa=${dummyUpi}&pn=${encodeURIComponent(tenant.businessName)}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + order.orderNumber)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto text-white">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <Link to={`/${slug}/orders`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-white transition-all mb-4">
             <ArrowLeft size={14} /> Historical Records
          </Link>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold tracking-tighter">
            Live <span className="text-primary italic">Tracker</span>
          </h1>
        </div>
        <div className="text-right glass px-6 py-4 rounded-[2rem] border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted block text-center mb-1">Ritual Reference</span>
          <h2 className="text-2xl font-mono font-bold text-primary">#{order.orderNumber}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Tracker & Payment */}
        <div className="lg:col-span-2 space-y-8 text-white">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
            
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(201,162,39,0.2)]">
                {order.orderStatus === 'RECEIVED' && <Receipt className="text-primary animate-pulse" size={40} />}
                {order.orderStatus === 'PREPARING' && <Loader2 className="text-primary animate-spin" size={40} />}
                {order.orderStatus === 'READY' && <CheckCircle2 className="text-green-500" size={40} />}
                {(order.orderStatus === 'SERVED' || order.orderStatus === 'DELIVERED') && <CheckCircle2 className="text-primary" size={40} />}
                {order.orderStatus === 'OUT_FOR_DELIVERY' && <Truck className="text-primary animate-bounce-slow" size={40} />}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4 tracking-tight">
                {order.orderStatus === 'RECEIVED' ? 'Gathering Ingredients' :
                 order.orderStatus === 'PREPARING' ? 'Culinary Creation' :
                 order.orderStatus === 'READY' ? 'Ready for Savoring' :
                 order.orderStatus === 'SERVED' || order.orderStatus === 'DELIVERED' ? 'Experience Complete' : 'En Route to You'}
              </h2>
              <p className="text-text-muted italic max-w-sm font-light">
                {order.orderType === 'DINING' ? `Ensuring every detail is perfect for Table #${order.tableNumber}` : `Our courier is ensuring your gourmet delivery remains pristine`}
              </p>
            </div>

            {/* Premium Stepper */}
            <div className="relative px-4 pb-4">
              <div className="absolute top-6 left-10 right-10 h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                   className="h-full bg-primary shadow-[0_0_20px_rgba(201,162,39,0.6)]" transition={{ duration: 1.5, ease: "easeInOut" }} />
              </div>

              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const active = idx <= currentIdx;
                  const current = idx === currentIdx;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 z-10 ${active ? 'bg-primary border-primary text-black shadow-2xl scale-110' : 'bg-bg-dark border-white/10 text-white/10'}`}>
                        {idx < currentIdx ? <CheckCircle2 size={18} /> : <span className="font-black text-sm">{idx + 1}</span>}
                      </div>
                      <span className={`mt-4 text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${active ? 'text-primary' : 'text-text-muted'} ${current ? 'animate-pulse' : ''}`}>
                        {stepLabels[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Conditional UPI Panel */}
          <AnimatePresence>
            {isUpiPending && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-12 rounded-[4rem] border-2 border-primary/30 shadow-2xl text-center relative overflow-hidden bg-primary/[0.02]">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                <div className="flex flex-col md:flex-row items-center gap-12">
                   <div className="bg-white p-6 rounded-[3rem] shadow-2xl group hover:scale-105 transition-transform duration-700">
                      <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
                   </div>
                   <div className="flex-1 text-left space-y-6">
                      <h3 className="text-3xl font-playfair font-bold">Awaiting Settlement</h3>
                      <p className="text-text-muted text-sm italic font-light">Your selection is reserved. Complete the digital ritual via scanned QR or deep-link to initiate preparation.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a href={upiLink} className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-primary transition-all">
                          <Smartphone size={16} /> Open UPI App
                        </a>
                        <div className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
                           <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Payable Amount</span>
                           <span className="text-xl font-black text-primary">₹{order.totalAmount}</span>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1 space-y-8 text-white">
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
             className="glass p-10 rounded-[3rem] border border-white/5 shadow-2xl">
             <h3 className="text-2xl font-playfair font-bold mb-8 flex items-center gap-4">
                <Receipt className="text-primary" size={24} /> Selection
             </h3>
             <div className="space-y-6 mb-10 overflow-y-auto max-h-[30vh] pr-2 no-scrollbar">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start text-sm border-b border-white/5 pb-4 last:border-0">
                    <div className="flex flex-col">
                       <span className="font-bold leading-tight">{item.name}</span>
                       <span className="text-[10px] text-text-muted uppercase font-black mt-1">QTY: {item.quantity}</span>
                    </div>
                    <span className="font-black text-primary">₹{(item.price) * item.quantity}</span>
                  </div>
                ))}
             </div>
             <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Grand Total</span>
                <span className="text-4xl font-playfair font-bold text-primary">₹{order.totalAmount}</span>
             </div>
           </motion.div>

           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-text-muted font-black uppercase tracking-widest">Protocol</span>
                 <span className="font-bold uppercase tracking-widest">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-text-muted font-black uppercase tracking-widest">Security</span>
                 <div className="flex items-center gap-2 text-green-500 font-black uppercase tracking-[0.2em] text-[10px]">
                    <ShieldCheck size={14} /> Verified
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
