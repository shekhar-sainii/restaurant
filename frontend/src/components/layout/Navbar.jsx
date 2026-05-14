import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronRight, LogOut, Settings, Package, LayoutDashboard, Utensils } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartCount } from '../../redux/slices/cartSlice';
import { selectAuth, logout } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../admin/NotificationBell';
import { useTenant } from '../../context/TenantContext';

const Navbar = ({ onMenuClick }) => {
  const { tenant } = useTenant() || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const cartCount = useSelector(state => selectCartCount(state, tenant?.tenantId));
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = ['ADMIN', 'KITCHEN', 'DELIVERY'].includes(user?.role);

  const navLinks = tenant ? [
    { name: 'Menu',         path: `/${tenant.slug}` },
    { name: 'About',        path: `/${tenant.slug}/about` },
    { name: 'Reservations', path: `/${tenant.slug}/checkout` },
  ] : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsAccountDropdownOpen(false);
  };

  const navBrand = tenant ? (
    <div className="flex items-center gap-3">
      {tenant.logo ? (
        <img 
          src={tenant.logo.startsWith('http') ? tenant.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${tenant.logo}`} 
          alt={tenant.businessName} 
          className="h-10 w-10 object-contain rounded-lg"
        />
      ) : (
        <Utensils className="text-primary" size={24} />
      )}
      <span className="hidden sm:inline text-xl md:text-2xl font-playfair font-bold text-primary tracking-tight">
        {tenant.businessName}
      </span>
    </div>
  ) : (
    <span className="text-xl md:text-2xl font-playfair font-bold text-primary tracking-tight flex items-center gap-2">
      <Utensils className="text-primary inline-block" size={22} />
      DineSync
    </span>
  );

  return (
    <nav className="h-20 bg-bg-neutral border-b border-white/10 sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick || (() => setIsMobileMenuOpen(true))}
          className={`p-2 text-text-muted hover:text-primary transition-colors cursor-pointer ${!onMenuClick ? 'lg:hidden' : ''}`}
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="flex items-center">
          {navBrand}
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-10">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-text-muted hover:text-white'
              }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {tenant && (
          <button
            onClick={() => navigate(`/${tenant.slug}/cart`)}
            className="relative p-2 text-text-muted hover:text-primary transition-all"
          >
            <ShoppingCart size={22} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(201,162,39,0.5)]"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}

        {isStaff && isAuthenticated && <NotificationBell />}

        <div className="relative" ref={dropdownRef}>
          {isAuthenticated ? (
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-2xl border border-primary/20 transition-all text-[11px] font-black uppercase tracking-widest group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.image}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={16} className="text-primary group-hover:scale-110 transition-transform" />
                )}
              </div>
              <span className="hidden sm:inline text-white capitalize">{user?.name?.split(' ')[0]}</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 transition-all text-[11px] font-black uppercase tracking-widest group">
              <User size={16} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          )}

          <AnimatePresence>
            {isAccountDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-4 w-56 glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60]"
              >
                <div className="p-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <Settings size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <Package size={16} />
                    My Orders
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#aa3bff] hover:bg-[#aa3bff]/10 rounded-2xl transition-all border border-[#aa3bff]/10"
                    >
                      <LayoutDashboard size={16} />
                      Admin Panel
                    </Link>
                  )}

                  <div className="pt-2 mt-2 border-t border-white/5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-bg-neutral border-r border-white/5 p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-lg font-playfair font-bold text-primary">Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-text-muted hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between group py-4 border-b border-white/5"
                  >
                    <span className={`text-xl font-bold ${location.pathname === link.path ? 'text-primary' : 'text-white'}`}>
                      {link.name}
                    </span>
                    <ChevronRight className="text-primary/40 group-hover:text-primary transition-colors" size={20} />
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-white/5">
                <div className="grid grid-cols-1 gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                      >
                        <User size={18} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                      >
                        <Package size={18} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Orders</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-[#aa3bff]/10 border border-[#aa3bff]/20"
                        >
                          <LayoutDashboard size={18} className="text-[#aa3bff]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#aa3bff]">Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          dispatch(logout());
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mt-4"
                      >
                        <LogOut size={18} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20"
                    >
                      <User size={18} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
