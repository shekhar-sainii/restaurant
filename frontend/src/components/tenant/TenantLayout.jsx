/**
 * TenantLayout — Branded navbar + footer for tenant storefronts.
 * Applies tenant theme, logo, and business name automatically alongside native app-like mobile bottom tab bars.
 */

import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, Package, Utensils } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { selectCartCount } from '../../redux/slices/cartSlice';
import { selectAuth, logout } from '../../redux/slices/authSlice';

const TenantLayout = () => {
  const { tenant, slug, theme } = useTenant();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const cartCount  = useSelector(state => selectCartCount(state, tenant?.tenantId));
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const primary = theme?.primaryColor || '#c9a227';
  const bg      = theme?.backgroundColor || '#0f0f0f';
  const surface = theme?.surfaceColor || '#1a1a1a';
  const font    = theme?.fontFamily || 'inherit';

  const handleLogout = () => {
    dispatch(logout());
    setAccountOpen(false);
    navigate(`/${slug}`);
  };

  // Compute clean location checks to animate active mobile tab indicators
  const currentPath = location.pathname;
  const isCartActive = currentPath.endsWith('/cart');
  const isOrdersActive = currentPath.endsWith('/orders');
  const isAuthActive = currentPath.endsWith('/login') || currentPath.endsWith('/register') || currentPath.endsWith('/profile');
  const isMenuBaseActive = !isCartActive && !isOrdersActive && !isAuthActive;

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: bg, fontFamily: font }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b"
        style={{ background: `${surface}e0`, backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* Logo + Name */}
          <Link to={`/${slug}`} className="flex items-center gap-3">
            {tenant?.logo ? (
              <img src={tenant.logo} alt={tenant.businessName}
                className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-lg font-black text-black"
                style={{ background: primary }}>
                {tenant?.businessName?.[0]}
              </div>
            )}
            <span className="font-bold text-white text-lg hidden sm:block" style={{ fontFamily: font }}>
              {tenant?.businessName}
            </span>
          </Link>

          {/* Desktop actions only */}
          <div className="flex items-center gap-3">
            {/* Desktop Cart */}
            <button onClick={() => navigate(`/${slug}/cart`)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors hidden md:block cursor-pointer">
              <ShoppingCart size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 text-black text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center"
                    style={{ background: primary }}>
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Desktop Account Dropdown */}
            <div className="relative hidden md:block">
              {isAuthenticated ? (
                <button onClick={() => setAccountOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{ borderColor: `${primary}30`, background: `${primary}10`, color: primary }}>
                  <User size={14} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </button>
              ) : (
                <Link to={`/${slug}/login`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all text-gray-400 hover:text-white cursor-pointer"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                  <User size={14} /> Sign In
                </Link>
              )}

              <AnimatePresence>
                {accountOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute right-0 mt-2 w-48 border rounded-2xl shadow-2xl overflow-hidden z-[60]"
                    style={{ background: surface, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="p-2 space-y-1">
                      <Link to={`/${slug}/orders`} onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <Package size={14} /> My Orders
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Header indicator if needed */}
            <div className="md:hidden flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-text-muted border border-white/5 bg-white/5 px-2.5 py-1 rounded-full">
                Table Menu
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      {/* Retain bottom padding pb-24 on mobile so absolute app tab panel overrides don't hide checkout/action buttons */}
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-6 text-center pb-28 md:pb-8"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: surface }}>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} <span style={{ color: primary }}>{tenant?.businessName}</span>. All rights reserved.
        </p>
        {tenant?.contactEmail && (
          <p className="text-gray-600 text-xs mt-1">{tenant.contactEmail}</p>
        )}
      </footer>

      {/* 📱 Exquisite Native App-Like Floating Bottom Navigation Tabs (Displayed exclusively on smartphones / md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{ 
          background: `${surface}f2`, 
          borderColor: 'rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
        
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          
          {/* Tab 1: Storefront Menu Base */}
          <Link 
            to={`/${slug}`} 
            className="flex flex-col items-center justify-center gap-1 h-full relative group cursor-pointer"
          >
            <span className={`transition-all duration-300 p-1.5 rounded-xl ${isMenuBaseActive ? 'scale-110' : 'text-gray-500 group-hover:text-gray-300'}`}
              style={{ 
                color: isMenuBaseActive ? primary : undefined,
                background: isMenuBaseActive ? `${primary}15` : 'transparent' 
              }}>
              <Utensils size={18} />
            </span>
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isMenuBaseActive ? 'text-white' : 'text-gray-500'}`}>
              Menu
            </span>
            {/* Active lower glow line indicator */}
            {isMenuBaseActive && (
              <motion.div layoutId="activeMobileTab" className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: primary }} />
            )}
          </Link>

          {/* Tab 2: Guest Cart Container */}
          <Link 
            to={`/${slug}/cart`} 
            className="flex flex-col items-center justify-center gap-1 h-full relative group cursor-pointer"
          >
            <div className="relative">
              <span className={`transition-all duration-300 p-1.5 rounded-xl block ${isCartActive ? 'scale-110' : 'text-gray-500 group-hover:text-gray-300'}`}
                style={{ 
                  color: isCartActive ? primary : undefined,
                  background: isCartActive ? `${primary}15` : 'transparent' 
                }}>
                <ShoppingCart size={18} />
              </span>
              {/* Overlay Counter Badge */}
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 text-black text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-md animate-pulse"
                    style={{ background: primary }}>
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isCartActive ? 'text-white' : 'text-gray-500'}`}>
              Cart
            </span>
            {isCartActive && (
              <motion.div layoutId="activeMobileTab" className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: primary }} />
            )}
          </Link>

          {/* Tab 3: Track Orders Queues */}
          <Link 
            to={`/${slug}/orders`} 
            className="flex flex-col items-center justify-center gap-1 h-full relative group cursor-pointer"
          >
            <span className={`transition-all duration-300 p-1.5 rounded-xl ${isOrdersActive ? 'scale-110' : 'text-gray-500 group-hover:text-gray-300'}`}
              style={{ 
                color: isOrdersActive ? primary : undefined,
                background: isOrdersActive ? `${primary}15` : 'transparent' 
              }}>
              <Package size={18} />
            </span>
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isOrdersActive ? 'text-white' : 'text-gray-500'}`}>
              Orders
            </span>
            {isOrdersActive && (
              <motion.div layoutId="activeMobileTab" className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: primary }} />
            )}
          </Link>

          {/* Tab 4: Consumer Account / Auth Context */}
          <Link 
            to={isAuthenticated ? `/${slug}/profile` : `/${slug}/login`} 
            className="flex flex-col items-center justify-center gap-1 h-full relative group cursor-pointer"
          >
            <span className={`transition-all duration-300 p-1.5 rounded-xl ${isAuthActive ? 'scale-110' : 'text-gray-500 group-hover:text-gray-300'}`}
              style={{ 
                color: isAuthActive ? primary : undefined,
                background: isAuthActive ? `${primary}15` : 'transparent' 
              }}>
              <User size={18} />
            </span>
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isAuthActive ? 'text-white' : 'text-gray-500'}`}>
              {isAuthenticated ? 'Account' : 'Sign In'}
            </span>
            {isAuthActive && (
              <motion.div layoutId="activeMobileTab" className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: primary }} />
            )}
          </Link>

        </div>
      </div>

    </div>
  );
};

export default TenantLayout;
