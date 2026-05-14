import { useState, useEffect } from 'react';
import { orderService } from '../../services/order.service';
import { publicService } from '../../services/public.service';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import socket from '../../services/socket';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ChevronRight, 
  MapPin, 
  Hash,
  RefreshCw,
  Receipt,
  Utensils,
  Loader2
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import TrackingModal from '../../components/consumer/TrackingModal';
import { useSearchParams } from 'react-router-dom';

const STATUS_CONFIG = {
  RECEIVED:         { label: 'Received',        color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  PENDING:          { label: 'Pending',         color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  CONFIRMED:        { label: 'Confirmed',       color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: Package },
  PREPARING:        { label: 'Preparing',       color: 'text-blue-500',   bg: 'bg-blue-500/10',   icon: Loader2 },
  READY:            { label: 'Ready',           color: 'text-purple-500', bg: 'bg-purple-500/10', icon: CheckCircle2 },
  SERVED:           { label: 'Served',          color: 'text-green-500',  bg: 'bg-green-500/10',  icon: CheckCircle2 },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: Truck },
  DELIVERED:        { label: 'Delivered',       color: 'text-green-500',  bg: 'bg-green-500/10',  icon: CheckCircle2 },
  CANCELLED:        { label: 'Cancelled',       color: 'text-red-500',    bg: 'bg-red-500/10',    icon: Hash },
};

const OrderCard = ({ order, slug, onTrack }) => {
  const { theme } = useTenant();
  const primary = theme?.primaryColor || '#c9a227';
  const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.RECEIVED;
  const StatusIcon = status.icon === Loader2 ? Loader2 : status.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[2.5rem] border border-white/5 overflow-hidden group transition-all p-8 mb-6 shadow-2xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: primary }}>ID #{order.orderNumber}</span>
             <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status.bg}`} style={{ color: status.color?.startsWith('text-') ? undefined : status.color }}>
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                {status.label}
             </span>
          </div>
          
          <h3 className="text-2xl font-playfair font-bold text-white leading-tight">
            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </h3>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest">
               <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: primary }}><MapPin size={14} /></div>
               {order.orderType === 'DINING' ? `Table ${order.tableNumber}` : 'Home Delivery'}
            </div>
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest">
               <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: primary }}><Receipt size={14} /></div>
               {order.items.length} Items
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-6">
           <p className="text-3xl font-black text-white">₹{order.totalAmount}</p>
           <button onClick={() => onTrack(order._id)} className="flex items-center gap-2 group/btn text-[10px] font-black uppercase tracking-[0.2em] text-black px-6 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl outline-none"
             style={{ backgroundColor: primary }}>
              Track Live <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>


      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
         <div className="flex -space-x-3">
            {order.items.slice(0, 4).map((item, i) => (
              <div key={i} className="w-12 h-12 rounded-2xl border-2 border-bg-dark bg-bg-neutral overflow-hidden shadow-2xl">
                <img src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
              </div>
            ))}
            {order.items.length > 4 && (
              <div className="w-12 h-12 rounded-2xl border-2 border-bg-dark bg-primary flex items-center justify-center text-[10px] font-black text-black">
                +{order.items.length - 4}
              </div>
            )}
         </div>
         <p className="text-[10px] text-text-muted italic font-light tracking-wide mr-2">Ordered at {order.tenantName || 'this restaurant'}</p>
      </div>
    </motion.div>
  );
};

const Orders = () => {
  const { tenant, slug, theme } = useTenant();
  const primary = theme?.primaryColor || '#c9a227';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector(selectAuth);
  const [searchParams, setSearchParams] = useSearchParams();

  // Tracking Modal State
  const [trackingId, setTrackingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const response = await orderService.fetchMyOrders();
        setOrders(response.data || []);
      } else {
        const rawGuests = localStorage.getItem('guest_orders');
        if (rawGuests) {
          const guestLogs = JSON.parse(rawGuests);
          const TWELVE_HOURS = 12 * 60 * 60 * 1000;
          const validLogs = guestLogs.filter(log => (Date.now() - (log.timestamp || 0)) < TWELVE_HOURS);
          
          if (validLogs.length > 0) {
            if (validLogs.length !== guestLogs.length) {
              localStorage.setItem('guest_orders', JSON.stringify(validLogs));
            }
            const validIds = validLogs.map(log => log.id);
            const response = await publicService.fetchGuestOrders(validIds); 
            setOrders(response.data || []);
          } else {
            localStorage.removeItem('guest_orders');
            setOrders([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleOrderUpdate = (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    };
    socket.on('order:updated', handleOrderUpdate);

    // Auto-open tracker if orderId is in URL
    const trackId = searchParams.get('track');
    if (trackId) {
       setTrackingId(trackId);
       setIsModalOpen(true);
    }

    return () => socket.off('order:updated', handleOrderUpdate);
  }, [isAuthenticated, tenant, searchParams]);

  const handleTrackClick = (id) => {
    setTrackingId(id);
    setIsModalOpen(true);
    setSearchParams({ track: id });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTrackingId(null);
    setSearchParams({});
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 block" style={{ color: primary }}>Gourmet Timeline</span>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold tracking-tight">Active <span className="italic" style={{ color: primary }}>Orders</span></h1>
        </div>
        <button onClick={loadOrders} className="p-4 rounded-2xl glass border border-white/10 transition-all text-text-muted shadow-2xl group" 
          style={{ '--hover-color': primary }}>
           <RefreshCw size={24} className={`${loading ? 'animate-spin' : ''} group-hover:text-primary transition-colors`} style={{ color: loading ? primary : undefined }} />
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
           <Loader2 className="animate-spin text-primary" size={48} />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sifting records...</p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass p-20 rounded-[4rem] border border-white/5 text-center flex flex-col items-center gap-8 shadow-2xl">
          <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Utensils size={48} />
          </div>
          <h2 className="text-4xl font-playfair font-bold">No Records Found</h2>
          <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed italic font-light">
             Your culinary history at {tenant?.businessName} is currently clear. Begin your journey explore our selection.
          </p>
          <Link to={`/${slug}`} className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl text-black transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primary }}>
             Explore Menu
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} slug={slug} onTrack={handleTrackClick} />
          ))}
        </div>
      )}

      {/* Real-time Tracking Modal */}
      <TrackingModal 
        isOpen={isModalOpen} 
        orderId={trackingId} 
        onClose={handleCloseModal}
        tenant={tenant}
        slug={slug}
      />
    </div>
  );
};

export default Orders;
