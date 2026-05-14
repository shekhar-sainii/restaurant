import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  clearCart
} from '../../redux/slices/cartSlice';
import { selectAuth } from '../../redux/slices/authSlice';
import { publicService } from '../../services/public.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Home,
  ArrowRight,
  Utensils,
  Navigation,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from '../../services/socket';
import { useTenant } from '../../context/TenantContext';

const Checkout = () => {
  const { tenant, slug, theme } = useTenant();
  const tenantId = tenant?.tenantId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector(state => selectCartItems(state, tenantId));
  const cartTotal = useSelector(state => selectCartTotal(state, tenantId));
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [orderStatus, setOrderStatus] = useState('idle'); 
  const [tables, setTables] = useState([]);
  const [orderType, setOrderType] = useState('DINING'); 
  const [tableNumber, setTableNumber] = useState('');
  
  const [address, setAddress] = useState({
    line1: '',
    city: 'Behat',
    pincode: '247341',
    phone: '',
    landmark: '',
    lat: null,
    lng: null
  });
  const [paymentMode, setPaymentMode] = useState('cod');
  const [selectedUpiType, setSelectedUpiType] = useState('primary'); 
  const [loadingTables, setLoadingTables] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  useEffect(() => {
    if (orderType === 'DINING' && slug) {
      const loadTables = async () => {
        try {
          const response = await publicService.fetchTables({ slug });
          setTables(response.data || []);
        } catch (err) {
          console.error('Failed to load tables', err);
        } finally {
          setLoadingTables(false);
        }
      };
      loadTables();
      socket.on('table:updated', (u) => setTables(prev => prev.map(t => t._id === u._id ? u : t)));
      return () => socket.off('table:updated');
    }
  }, [orderType, slug]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { showError("Geolocation is not supported by your operating system."); return; }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setAddress({
              ...address,
              line1: data.display_name,
              city: data.address.city || data.address.town || data.address.village || 'Behat',
              pincode: data.address.postcode || '247341',
              lat: latitude,
              lng: longitude
            });
          }
        } catch (err) { setAddress(prev => ({ ...prev, lat: latitude, lng: longitude })); }
        finally { setIsDetecting(false); }
      },
      () => { setIsDetecting(false); showError("Location retrieval denied. Please specify building address manually."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [placedOrder, setPlacedOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handlePlaceOrder = async () => {
    if (orderType === 'DINING' && !tableNumber) { 
      showError('Please select your target seat/table prior to final dispatch.'); 
      return; 
    }
    if (orderType === 'DELIVERY' && (!address.line1 || !address.phone)) { 
      showError('Please fill in complete delivery destination instructions.'); 
      return; 
    }

    setOrderStatus('loading');
    try {
      const orderData = {
        items: cartItems,
        orderType,
        paymentMethod: paymentMode === 'cod' ? 'CASH' : 'UPI',
        totalAmount: cartTotal,
        tenantId,
        ...(orderType === 'DINING' ? { tableNumber: parseInt(tableNumber) } : { deliveryAddress: address })
      };

      const response = await publicService.placeOrder(orderData);
      const newOrderInfo = response.data;

      if (newOrderInfo && newOrderInfo._id) {
        dispatch(clearCart(tenantId));

        // Save to guest tracking history if unauthenticated
        if (!isAuthenticated) {
          try {
            const rawGuests = localStorage.getItem('guest_orders');
            const guestLogs = rawGuests ? JSON.parse(rawGuests) : [];
            guestLogs.push({ id: newOrderInfo._id, timestamp: Date.now() });
            localStorage.setItem('guest_orders', JSON.stringify(guestLogs));
          } catch (e) {
            console.error("Failed to save guest order to localStorage", e);
          }
        }

        if (paymentMode === 'upi') {
          setPlacedOrder(newOrderInfo);
          setOrderStatus('idle');
        } else {
          navigate(`/${slug}/orders?track=${newOrderInfo._id}`);
        }
      } else {
        throw new Error("Invalid order response");
      }
    } catch (err) {
      console.error("Placement error:", err);
      showError(err.response?.data?.message || err.message || 'Failed to dispatch order securely.');
      setOrderStatus('idle');
    }
  };

  const handleManualVerify = () => {
    setVerifying(true);
    // Simulate payment detection
    setTimeout(() => {
      navigate(`/${slug}/orders?track=${placedOrder._id}`);
    }, 3000);
  };

  const primary = theme?.primaryColor || '#c9a227';

  return (
    <div className="py-10 px-6 max-w-5xl mx-auto text-white relative z-10">
      
      {/* Exquisite Premium Interactive Alert Modal */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-sm w-full glass border border-white/10 rounded-3xl p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
              style={{ backgroundColor: '#141414' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <AlertCircle size={32} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block mb-1">
                Action Required
              </span>
              
              <h3 className="text-xl font-playfair font-bold text-white mb-2">
                {errorMessage.includes('seat') || errorMessage.includes('table') ? 'Select Your Table' : 'Instruction Notice'}
              </h3>

              <p className="text-text-muted text-xs leading-relaxed mb-6 px-2">
                {errorMessage}
              </p>

              {errorMessage.includes('seat') || errorMessage.includes('table') ? (
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setTimeout(() => {
                      document.getElementById('table-selection-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] text-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 outline-none"
                  style={{ backgroundColor: primary }}
                >
                  👉 Choose Table Now
                </button>
              ) : (
                <button
                  onClick={() => setErrorMessage(null)}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 transition-all text-white outline-none"
                >
                  Understood
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: primary }}>Checkout</span>
           <h1 className="text-3xl font-bold leading-tight">
            Complete <span className="italic" style={{ color: primary }}>Order</span>
          </h1>
        </div>
        <div className="hidden sm:block text-right">
           <h3 className="text-lg font-bold opacity-80">{tenant?.businessName}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Type */}
          <section className="glass p-1.5 rounded-2xl border border-white/5 flex shadow-xl overflow-hidden">
            <button onClick={() => setOrderType('DINING')} 
              className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all ${orderType === 'DINING' ? 'text-black font-bold' : 'text-text-muted hover:bg-white/5'}`}
              style={orderType === 'DINING' ? { backgroundColor: primary } : {}}>
              <Utensils size={16} /> <span className="text-[10px] uppercase font-bold tracking-widest">Dine-In</span>
            </button>
            <button onClick={() => setOrderType('DELIVERY')} 
              className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all ${orderType === 'DELIVERY' ? 'text-black font-bold' : 'text-text-muted hover:bg-white/5'}`}
              style={orderType === 'DELIVERY' ? { backgroundColor: primary } : {}}>
              <Home size={16} /> <span className="text-[10px] uppercase font-bold tracking-widest">Delivery</span>
            </button>
          </section>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {orderType === 'DINING' ? (
              <motion.section key="dining" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass p-6 rounded-2xl border border-white/5 shadow-xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${primary}10`, color: primary, borderColor: `${primary}20` }}><MapPin size={16} /></span>
                  Table Selection
                </h2>
                {loadingTables ? <Loader2 size={18} className="animate-spin" style={{ color: primary }} /> : (
                  <div id="table-selection-grid" className="grid grid-cols-5 sm:grid-cols-8 gap-2 scroll-mt-24">
                    {tables.map(t => (
                      <button key={t._id} disabled={t.status === 'OCCUPIED'} onClick={() => setTableNumber(t.tableNumber)}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${tableNumber === t.tableNumber ? 'text-black border-transparent shadow-lg scale-105' : t.status === 'OCCUPIED' ? 'opacity-20 bg-white/5' : 'bg-white/[0.03] border-white/5 text-gray-400 hover:border-primary/40'}`}
                        style={tableNumber === t.tableNumber ? { backgroundColor: primary } : {}}>
                        <span className="text-lg font-bold">{t.tableNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.section>
            ) : (
              <motion.section key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${primary}10`, color: primary, borderColor: `${primary}20` }}><Home size={16} /></span>
                    Delivery Address
                  </h2>
                  <button onClick={handleDetectLocation} disabled={isDetecting} className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:text-black transition-all" style={{ color: primary }}>
                    {isDetecting ? <Loader2 className="animate-spin" size={12} /> : <Navigation size={12} /> } Locate Me
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 ml-1">Address</label>
                    <textarea rows={2} value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="Building, Street, Area..." className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl outline-none focus:border-white/20 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 ml-1">Phone</label>
                    <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="Mobile Number" className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl outline-none focus:border-white/20 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 ml-1">City</label>
                    <input type="text" value={address.city} readOnly className="w-full border p-4 rounded-xl font-bold uppercase text-[10px]" style={{ backgroundColor: `${primary}10`, borderColor: `${primary}20`, color: primary }} />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Payment Method */}
          <section className="glass p-6 rounded-2xl border border-white/5 shadow-xl">
             <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
               <span className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${primary}10`, color: primary, borderColor: `${primary}20` }}><CreditCard size={16} /></span>
               Payment Method
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setPaymentMode('cod')} 
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${paymentMode === 'cod' ? 'border-primary bg-primary/5 shadow-lg' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                  <div className={`p-2.5 rounded-lg ${paymentMode === 'cod' ? 'bg-primary text-black' : 'bg-white/5'}`}><Banknote size={18} /></div>
                  <div><h3 className="font-bold text-xs uppercase">Cash</h3><p className="text-[8px] tracking-widest opacity-50 uppercase">Pay at Store</p></div>
                </button>
                <button onClick={() => setPaymentMode('upi')} 
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${paymentMode === 'upi' ? 'border-primary bg-primary/5 shadow-lg' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                  <div className={`p-2.5 rounded-lg ${paymentMode === 'upi' ? 'bg-primary text-black' : 'bg-white/5'}`}><QrCode size={18} /></div>
                  <div><h3 className="font-bold text-xs uppercase">Digital</h3><p className="text-[8px] tracking-widest opacity-50 uppercase">Pay with UPI</p></div>
                </button>
              </div>

              <AnimatePresence>
                {paymentMode === 'upi' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    className="mt-6 p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-5"
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <QrCode size={14} className="text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Instant Payment QR</span>
                        </div>
                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">Secure UPI</span>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="bg-white p-3 rounded-2xl shadow-xl flex-shrink-0">
                           <img 
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${selectedUpiType === 'primary' ? (tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi') : (tenant?.paymentSettings?.upiIdSecondary || 'merchant@upi')}&pn=${encodeURIComponent(tenant?.businessName || 'Pizza King')}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order Checkout')}`)}`} 
                             alt="UPI QR" 
                             className="w-32 h-32" 
                           />
                        </div>
                        
                        <div className="flex-1 space-y-3 w-full">
                           <p className="text-[10px] text-text-muted italic leading-relaxed">Scan this QR with any UPI app (GPay, PhonePe, Paytm) to initiate payment of <span className="text-white font-bold">₹{cartTotal}</span>.</p>
                           <a 
                             href={`upi://pay?pa=${selectedUpiType === 'primary' ? (tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi') : (tenant?.paymentSettings?.upiIdSecondary || 'merchant@upi')}&pn=${encodeURIComponent(tenant?.businessName || 'Pizza King')}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent('Order Checkout')}`}
                             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                           >
                              <Smartphone size={14} /> Use Phone App
                           </a>
                           
                           <div className="grid grid-cols-2 gap-2 mt-2">
                              <button onClick={() => setSelectedUpiType('primary')} className={`p-2.5 rounded-lg border text-left transition-all ${selectedUpiType === 'primary' ? 'border-primary bg-primary/10 shadow-inner' : 'border-white/5 bg-white/5'}`}>
                                <p className="text-[8px] opacity-40 uppercase font-black tracking-tighter mb-0.5">Primary ID</p>
                                <p className="text-[10px] font-bold truncate" style={{ color: selectedUpiType === 'primary' ? primary : '#fff' }}>{tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi'}</p>
                              </button>
                              <button onClick={() => setSelectedUpiType('secondary')} className={`p-2.5 rounded-lg border text-left transition-all ${selectedUpiType === 'secondary' ? 'border-primary bg-primary/10 shadow-inner' : 'border-white/5 bg-white/5'}`}>
                                <p className="text-[8px] opacity-40 uppercase font-black tracking-tighter mb-0.5">Secondary ID</p>
                                <p className="text-[10px] font-bold truncate" style={{ color: selectedUpiType === 'secondary' ? primary : '#fff' }}>{tenant?.paymentSettings?.upiIdSecondary || 'merchant@upi'}</p>
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass p-5 rounded-2xl border border-white/5 sticky top-24 shadow-xl">
             <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-3">Selection Details</h3>
             <div className="space-y-3 mb-6 max-h-[30vh] overflow-y-auto pr-1 no-scrollbar">
               {cartItems.map(item => (
                 <div key={item.cartKey} className="flex justify-between items-start text-xs">
                   <div className="flex flex-col"><span className="font-bold">{item.name}</span><span className="text-[9px] opacity-50">x{item.quantity}</span></div>
                   <span className="font-bold opacity-80">₹{(item.variation?.discountedPrice || item.price) * item.quantity}</span>
                 </div>
               ))}
             </div>
             <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] uppercase font-bold opacity-50"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                <div className="flex justify-between items-end pt-2">
                   <span className="text-[9px] uppercase font-bold tracking-widest opacity-40">Total Amount</span>
                   <span className="text-2xl font-bold" style={{ color: primary }}>₹{cartTotal}</span>
                </div>
             </div>
             <button onClick={handlePlaceOrder} disabled={orderStatus === 'loading' || cartItems.length === 0} className="w-full py-4 mt-6 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl transition-all hover:opacity-90 active:scale-95 text-black" style={{ backgroundColor: primary }}>
                  {orderStatus === 'loading' ? <Loader2 className="animate-spin mx-auto text-black" size={18} /> : 'Place Order'}
             </button>
          </div>
        </div>
      </div>
      {/* Payment Overlay */}
      <AnimatePresence>
        {placedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} 
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full glass border border-white/10 rounded-[3rem] p-10 text-center space-y-8 shadow-[0_0_100px_rgba(201,162,39,0.15)]"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <QrCode size={32} className="text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Awaiting Payment</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Order Reference: #{placedOrder.orderNumber}</p>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl relative group max-w-[280px] mx-auto">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${selectedUpiType === 'primary' ? (tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi') : (tenant?.paymentSettings?.upiIdSecondary || 'merchant@upi')}&pn=${encodeURIComponent(tenant?.businessName || 'Pizza King')}&am=${placedOrder.totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + placedOrder.orderNumber)}`)}`} 
                  alt="UPI QR" 
                  className="w-full aspect-square" 
                />
                <div className="absolute inset-0 border-8 border-bg-dark rounded-[inherit] pointer-events-none opacity-50" />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Amount</span>
                    <span className="text-4xl font-bold text-white">₹{placedOrder.totalAmount}</span>
                 </div>

                 <p className="text-[10px] text-text-muted italic leading-relaxed px-4">
                    Scan the QR above or use the button below to pay. Once completed, our system will automatically verify the transaction.
                 </p>
              </div>

              <button 
                onClick={handleManualVerify}
                disabled={verifying}
                className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all relative overflow-hidden group active:scale-95 text-black"
                style={{ backgroundColor: primary }}
              >
                {verifying ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 size={18} className="animate-spin" /> Verifying Ritual...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    I Have Paid <ArrowRight size={16} />
                  </div>
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <a 
                href={`upi://pay?pa=${selectedUpiType === 'primary' ? (tenant?.paymentSettings?.upiIdPrimary || 'merchant@upi') : (tenant?.paymentSettings?.upiIdSecondary || 'merchant@upi')}&pn=${encodeURIComponent(tenant?.businessName || 'Pizza King')}&am=${placedOrder.totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + placedOrder.orderNumber)}`}
                className="block text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors"
              >
                 Open UPI Deep Link
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
