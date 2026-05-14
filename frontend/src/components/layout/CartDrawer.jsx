import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectIsDrawerOpen,
  selectCartTotal,
  closeDrawer,
  updateQuantity,
  removeItem
} from '../../redux/slices/cartSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector(selectCartItems);
  const isDrawerOpen = useSelector(selectIsDrawerOpen);
  const cartTotal = useSelector(selectCartTotal);

  // Auto-close drawer on route change
  useEffect(() => {
    dispatch(closeDrawer());
  }, [location.pathname, dispatch]);

  const handleProceedToCheckout = () => {
    dispatch(closeDrawer());
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeDrawer())}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-neutral shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary" size={24} />
                <h2 className="text-xl font-playfair font-bold">Your Selection</h2>
              </div>
              <button
                onClick={() => dispatch(closeDrawer())}
                className="p-3 -mr-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white"
                aria-label="Close cart"
              >
                <X size={22} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-text-muted opacity-20" />
                  </div>
                  <p className="text-text-muted font-medium mb-6">Your cart is feeling a bit empty...</p>
                  <button
                    onClick={() => dispatch(closeDrawer())}
                    className="btn-primary text-sm px-8"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartKey} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-800" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                          {item.variation && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-black">
                              {item.variation.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => dispatch(removeItem(item.cartKey))}
                          className="text-text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1">
                          <button
                            onClick={() => dispatch(updateQuantity({ cartKey: item.cartKey, delta: -1 }))}
                            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ cartKey: item.cartKey, delta: 1 }))}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-sm">
                          ₹{(item.variation?.discountedPrice || item.variation?.price || item.discountedPrice || item.price) * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4 bg-bg-dark/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="text-xl font-playfair font-bold text-primary">₹{cartTotal}</span>
                </div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider text-center">
                  Culinary Excellence • Complimentary Inside Service
                </p>
                <button
                  onClick={handleProceedToCheckout}
                  className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base shadow-[0_10px_30px_rgba(201,162,39,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
