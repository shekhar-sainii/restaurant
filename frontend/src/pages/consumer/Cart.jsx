import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  updateQuantity,
  removeItem
} from '../../redux/slices/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';

const Cart = () => {
  const { tenant, slug, theme } = useTenant();
  const tenantId = tenant?.tenantId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector(state => selectCartItems(state, tenantId));
  const cartTotal = useSelector(state => selectCartTotal(state, tenantId));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const primary = theme?.primaryColor || '#c9a227';

  return (
    <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto text-white relative z-10">
      <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4 tracking-tight flex items-center gap-4">
        {tenant?.businessName || 'Your'} Selection
        <div className="h-0.5 flex-1 rounded-full opacity-30" style={{ background: `linear-gradient(to right, ${primary}, transparent)` }} />
        <Link 
          to={`/${slug}`} 
          className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors border px-4 py-2 rounded-xl"
          style={{ color: primary, borderColor: `${primary}30`, background: `${primary}10` }}
        >
          Add More Items
        </Link>
      </h1>
      <Link 
        to={`/${slug}`} 
        className="sm:hidden flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-8 border border-primary/20 px-4 py-2 rounded-xl bg-primary/5"
      >
        Add More Items
      </Link>
      <p className="text-text-muted text-sm uppercase tracking-widest font-bold mb-12">
        Review your gourmet choices for {tenant?.businessName}
      </p>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-16 rounded-[3rem] border border-white/5 text-center flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-playfair font-bold">Your cart is currently empty</h2>
          <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed font-light">
            Looks like you haven't made your selections yet at {tenant?.businessName}. Discover our exquisite menu to start adding culinary masterpieces.
          </p>
          <Link 
            to={`/${slug}`} 
            className="btn-primary mt-4 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl"
          >
            Explore the Menu
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative items-start">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {cartItems.map((item, index) => {
                const imgUrl = item.image?.startsWith('http') 
                  ? item.image 
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={item.cartKey} 
                    className="glass p-4 rounded-3xl border border-white/5 flex flex-col sm:flex-row gap-6 relative group hover:border-white/10 transition-colors"
                  >
                    <div className="w-full sm:w-32 h-32 bg-bg-dark rounded-2xl overflow-hidden flex-shrink-0 relative">
                      {item.image ? (
                        <img src={imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                          <ShoppingBag className="text-white/20" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-playfair font-bold text-xl text-white tracking-wide mb-1 leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                          {item.variation && (
                            <span className="inline-block text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full uppercase font-black tracking-widest mb-2 border border-primary/20">
                              {item.variation.name}
                            </span>
                          )}
                          <p className="text-text-muted text-xs line-clamp-1 italic">{item.description}</p>
                        </div>
                        <button
                          onClick={() => dispatch(removeItem({ cartKey: item.cartKey, tenantId }))}
                          className="p-2 sm:-mt-2 sm:-mr-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-6">
                        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                          <button
                            onClick={() => dispatch(updateQuantity({ cartKey: item.cartKey, delta: -1, tenantId }))}
                            className="p-2 transition-colors hover:bg-white/5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                            style={{ color: primary }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-black w-8 text-center text-white">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ cartKey: item.cartKey, delta: 1, tenantId }))}
                            className="p-2 transition-colors hover:bg-white/5 rounded-lg"
                            style={{ color: primary }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] text-text-muted uppercase tracking-widest mb-1 block font-black">Item Total</span>
                          <span className="font-black text-xl" style={{ color: primary }}>
                            ₹{(item.variation?.discountedPrice || item.variation?.price || item.discountedPrice || item.price) * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <div className="lg:sticky lg:top-28">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-white/5"
            >
              <h3 className="font-playfair text-2xl font-bold text-white mb-8 tracking-tight">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-light">
                  <span className="text-text-muted">Subtotal ({cartItems.length} items)</span>
                  <span className="text-white font-bold tracking-wider">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-light">
                  <span className="text-text-muted">Kitchen Taxes & Fees</span>
                  <span className="text-green-500 font-black uppercase text-[10px] tracking-widest">Included</span>
                </div>
                
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="font-black uppercase tracking-widest text-xs text-white">Total Value</span>
                  <span className="text-3xl font-playfair font-bold" style={{ color: primary }}>₹{cartTotal}</span>
                </div>
              </div>

              <div className="rounded-2xl p-4 mb-8 border" style={{ background: `${primary}10`, borderColor: `${primary}20` }}>
                 <p className="text-[10px] leading-relaxed font-bold uppercase tracking-widest text-center" style={{ color: primary }}>
                   Verified by {tenant?.businessName}
                 </p>
              </div>

              <button
                onClick={() => navigate(`/${slug}/checkout`)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-black shadow-2xl transition-all hover:opacity-90 active:scale-95"
                style={{ background: primary }}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
