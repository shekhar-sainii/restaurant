import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { BellRing, CheckCircle2, XCircle, Clock, ChefHat, Info, Truck } from 'lucide-react';
import socket from '../../services/socket';
import { adminService } from '../../services/admin.service';
import { selectAuth } from '../../redux/slices/authSlice';

const GlobalOrderAlert = () => {
  const { user } = useSelector(selectAuth);
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleNewOrder = (order) => {
      setIncomingOrder(order);
    };

    socket.on('order:new', handleNewOrder);
    return () => socket.off('order:new', handleNewOrder);
  }, []);

  const handleAction = async (status) => {
    if (!incomingOrder) return;
    setIsProcessing(true);
    try {
      await adminService.updateOrderStatus(incomingOrder._id, status);
      setIncomingOrder(null);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Action failed. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const dismissAlert = () => {
    setIncomingOrder(null);
  };

  if (!incomingOrder) return null;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AnimatePresence>
      {incomingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-bg-neutral border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-yellow-400 to-orange-500" />
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <BellRing className="text-primary relative z-10" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  New Order Alert
                  <span className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-black inline-block align-middle ml-1">Live</span>
                </h2>
                <p className="text-sm text-text-muted mt-1 font-mono">{incomingOrder.orderNumber}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    {incomingOrder.orderType === 'DINING' ? <ChefHat size={14} className="text-primary"/> : <Truck size={14} className="text-blue-400"/>}
                    {incomingOrder.orderType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Target</p>
                  <p className="text-sm font-semibold text-white">
                    {incomingOrder.tableNumber ? `Table ${incomingOrder.tableNumber}` : 'Home Delivery'}
                  </p>
                </div>
                <div className="col-span-2 border-t border-white/5 pt-3">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Items ({incomingOrder.items?.length || 0})</p>
                  <p className="text-sm font-semibold text-white truncate">
                    {incomingOrder.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div className="col-span-2 border-t border-white/5 pt-3 flex justify-between items-center">
                  <p className="text-xs text-text-muted uppercase tracking-wider">Total Value</p>
                  <p className="text-xl font-playfair font-bold text-primary">₹{incomingOrder.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Actions based on Role */}
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAction('CANCELLED')}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Reject
                </button>
                <button
                  onClick={() => handleAction('CONFIRMED')}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-black font-black uppercase tracking-wider hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                >
                  {isProcessing ? <Clock size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isProcessing ? 'Processing...' : 'Accept'}
                </button>
              </div>
            ) : (
               <button
                  onClick={dismissAlert}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Info size={18} />
                  Acknowledge Order
                </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalOrderAlert;
