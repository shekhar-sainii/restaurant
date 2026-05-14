import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, UtensilsCrossed, Layers, TableProperties,
  Users, Receipt, CreditCard, LogOut, ChevronRight, X, Terminal, UserCog, MessageSquare, Palette, Utensils, Store
} from 'lucide-react';
import { logout, selectAuth } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';

const Sidebar = ({ isOpen, onClose, isMobile, isCollapsed }) => {
  const { tenant } = useTenant() || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'KITCHEN', 'DELIVERY'] },
    { name: 'My Terminal', path: '/admin/terminal', icon: Terminal, roles: ['KITCHEN', 'DELIVERY'] },
    { name: 'Orders', path: '/admin/order-mgmt', icon: UtensilsCrossed, roles: ['ADMIN', 'KITCHEN', 'DELIVERY'] },
    { name: 'Chat', path: '/admin/chat', icon: MessageSquare, roles: ['ADMIN', 'KITCHEN', 'DELIVERY'] },
    { name: 'Products', path: '/admin/product-mgmt', icon: Layers, roles: ['ADMIN'] },
    { name: 'Categories', path: '/admin/category-mgmt', icon: TableProperties, roles: ['ADMIN'] },
    { name: 'Tables', path: '/admin/table-mgmt', icon: Users, roles: ['ADMIN'] },
    { name: 'Users', path: '/admin/user-mgmt', icon: Receipt, roles: ['ADMIN'] },
    { name: 'Staff', path: '/admin/staff-mgmt', icon: UserCog, roles: ['ADMIN'] },
    { name: 'Branding', path: '/admin/branding', icon: Palette, roles: ['ADMIN'] },
    { name: 'Payments', path: '/admin/payment-mgmt', icon: CreditCard, roles: ['ADMIN'] },

    // SUPER ADMIN ROLES
    { name: 'Platform Stats', path: '/super-admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
    { name: 'Root Tenants', path: '/super-admin/tenants', icon: Store, roles: ['SUPER_ADMIN'] },
    { name: 'Platform Theme', path: '/super-admin/branding', icon: Palette, roles: ['SUPER_ADMIN'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user?.role));

  const handleLogout = () => {
    if (isMobile) onClose();
    dispatch(logout());
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) onClose();
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      width: isMobile ? '288px' : (isCollapsed ? '80px' : '288px'),
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: isMobile ? '-100%' : 0,
      opacity: isMobile ? 0 : 1,
      width: isMobile ? '288px' : (isCollapsed ? '80px' : '288px'),
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  return (
    <motion.aside
      initial="closed"
      animate={isOpen || !isMobile ? "open" : "closed"}
      variants={sidebarVariants}
      className={`
        bg-bg-neutral/40 backdrop-blur-xl border-r border-white/5 h-screen overflow-hidden flex flex-col py-10 z-[60]
        ${isMobile ? 'fixed left-0 top-0 shadow-2xl' : 'sticky top-0'}
      `}
    >
      {/* Brand Logo Area */}
      <div className="px-6 mb-12 flex items-center justify-between relative min-h-[40px]">
        <motion.div
          animate={{ opacity: isCollapsed && !isMobile ? 0 : 1 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <div className="flex items-center gap-3">
            {tenant?.logo ? (
              <img
                src={tenant.logo.startsWith('http') ? tenant.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${tenant.logo}`}
                alt="Logo"
                className="h-8 w-8 object-contain rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Utensils size={16} className="text-primary" />
              </div>
            )}
            <h1 className="text-xl font-playfair font-bold text-primary tracking-tight truncate max-w-[160px]">
              {tenant?.businessName || 'Management'}
            </h1>
          </div>
          <div className="h-0.5 w-12 bg-primary mt-2 rounded-full shadow-[0_0_10px_rgba(201,162,39,0.5)]" />
        </motion.div>

        {isMobile && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-4 -mt-2 -mr-4 text-text-muted hover:text-white transition-all transform active:scale-90"
            aria-label="Close sidebar"
          >
            <div className="bg-white/10 p-2 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
              <X size={24} className="text-primary" />
            </div>
          </button>
        )}

        {/* Mini Logo for Collapsed State */}
        {!isMobile && isCollapsed && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {tenant?.logo ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${tenant.logo}`}
                alt="L"
                className="h-8 w-8 object-contain rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-playfair font-black text-black">
                {tenant?.businessName?.charAt(0) || 'G'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <motion.p
          animate={{ opacity: isCollapsed && !isMobile ? 0 : 1, height: isCollapsed && !isMobile ? 0 : 'auto' }}
          className="px-5 mb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] overflow-hidden"
        >
          Management
        </motion.p>

        {filteredLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={handleNavClick}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
              ${isActive
                ? 'bg-primary text-black font-bold shadow-[0_10px_20px_rgba(201,162,39,0.15)]'
                : 'text-text-muted hover:bg-white/5 hover:text-white'}
              ${isCollapsed && !isMobile ? 'justify-center' : ''}
            `}
          >
            <link.icon size={20} className="flex-shrink-0 transition-transform group-hover:scale-110" />

            <motion.span
              animate={{
                opacity: isCollapsed && !isMobile ? 0 : 1,
                width: isCollapsed && !isMobile ? 0 : 'auto'
              }}
              className="text-sm tracking-wide whitespace-nowrap overflow-hidden"
            >
              {link.name}
            </motion.span>

            {!isCollapsed && !isMobile && (
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-6 pt-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all group
            ${isCollapsed && !isMobile ? 'justify-center' : 'px-5'}
          `}
        >
          <LogOut size={20} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          <motion.span
            animate={{
              opacity: isCollapsed && !isMobile ? 0 : 1,
              width: isCollapsed && !isMobile ? 0 : 'auto'
            }}
            className="text-sm font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
