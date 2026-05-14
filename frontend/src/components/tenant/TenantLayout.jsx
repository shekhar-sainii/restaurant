/**
 * TenantLayout — Branded navbar + footer for tenant storefronts.
 * Applies tenant theme, logo, and business name automatically.
 */

import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, Package, ChevronRight } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { selectCartCount } from '../../redux/slices/cartSlice';
import { selectAuth, logout } from '../../redux/slices/authSlice';

const TenantLayout = () => {
  const { tenant, slug, theme } = useTenant();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const cartCount  = useSelector(state => selectCartCount(state, tenant?.tenantId));
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const primary = theme?.primaryColor || '#c9a227';
  const bg      = theme?.backgroundColor || '#0f0f0f';
  const surface = theme?.surfaceColor || '#1a1a1a';
  const radius  = theme?.borderRadius || '1.5rem';
  const font    = theme?.fontFamily || 'inherit';

  const handleLogout = () => {
    dispatch(logout());
    setAccountOpen(false);
    navigate(`/${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg, fontFamily: font }}>

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

          {/* Desktop nav - Links removed */}
          <div className="hidden md:flex items-center gap-8">
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button onClick={() => navigate(`/${slug}/cart`)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors">
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

            {/* Account */}
            <div className="relative">
              {isAuthenticated ? (
                <button onClick={() => setAccountOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all"
                  style={{ borderColor: `${primary}30`, background: `${primary}10`, color: primary }}>
                  <User size={14} />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </button>
              ) : (
                <Link to={`/${slug}/login`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all text-gray-400 hover:text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                  <User size={14} /> Sign In
                </Link>
              )}

              <AnimatePresence>
                {accountOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute right-0 mt-2 w-48 border rounded-2xl shadow-2xl overflow-hidden z-60"
                    style={{ background: surface, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="p-2 space-y-1">
                      <Link to={`/${slug}/orders`} onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <Package size={14} /> My Orders
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 text-gray-400 hover:text-white">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: surface }}>
              <div className="px-4 py-8 text-center">
                 <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Explore our selection below</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-6 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: surface }}>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} <span style={{ color: primary }}>{tenant?.businessName}</span>. All rights reserved.
        </p>
        {tenant?.contactEmail && (
          <p className="text-gray-600 text-xs mt-1">{tenant.contactEmail}</p>
        )}
      </footer>
    </div>
  );
};

export default TenantLayout;
