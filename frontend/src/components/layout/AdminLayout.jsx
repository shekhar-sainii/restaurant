import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { selectAuth } from '../../redux/slices/authSlice';
import GlobalOrderAlert from '../admin/GlobalOrderAlert';
import useNotifications from '../../hooks/useNotifications';
import { resolveTheme, applyThemeToDom, BUSINESS_THEMES } from '../../config/themes.config';
import axios from 'axios';

const AdminLayout = () => {
  const { user } = useSelector(selectAuth);
  useNotifications(user?.role);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [tenantTheme, setTenantTheme] = useState(null);

  const isMobile = windowWidth < 1024;

  // Load and apply tenant theme for admin panel
  const loadTheme = () => {
    const slug = user?.tenantId || localStorage.getItem('tenant_slug');
    if (!slug || user?.role === 'SUPER_ADMIN') return;

    axios.get(`/api/v1/public/tenants/${slug}/config?t=${Date.now()}`) // cache-bust
      .then(r => {
        const t = r.data.data;
        const resolved = resolveTheme(t);
        setTenantTheme(resolved);
        applyThemeToDom(resolved);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTheme();

    // Re-apply theme when tab becomes visible (e.g. after super admin changes it)
    const onVisible = () => { if (document.visibilityState === 'visible') loadTheme(); };
    document.addEventListener('visibilitychange', onVisible);

    // Listen for explicit theme-updated event (fired by super admin dashboard)
    const onThemeUpdate = () => loadTheme();
    window.addEventListener('tenant-theme-updated', onThemeUpdate);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('tenant-theme-updated', onThemeUpdate);
    };
  }, [user?.tenantId]);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const wasDesktop = windowWidth >= 1024;
      const isDesktop = currentWidth >= 1024;
      if (isDesktop && !wasDesktop) { setIsSidebarOpen(true); setIsCollapsed(false); }
      else if (!isDesktop && wasDesktop) { setIsSidebarOpen(false); }
      setWindowWidth(currentWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth]);

  const handleToggle = () => {
    if (isMobile) setIsSidebarOpen(!isSidebarOpen);
    else setIsCollapsed(!isCollapsed);
  };

  // Business-type aware titles
  const businessType = tenantTheme?.businessType || 'RESTAURANT';
  const TITLES = {
    RESTAURANT:  { admin: 'Restaurant Control', kitchen: 'Kitchen Terminal', delivery: 'Delivery Fleet' },
    HONEY_STORE: { admin: 'Honey Hub Control',  kitchen: 'Packing Station',  delivery: 'Delivery Fleet' },
    BAKERY:      { admin: 'Bakery Control',      kitchen: 'Baking Station',   delivery: 'Delivery Fleet' },
    GROCERY:     { admin: 'Store Control',       kitchen: 'Packing Station',  delivery: 'Delivery Fleet' },
    CUSTOM:      { admin: 'Admin Panel',         kitchen: 'Operations',       delivery: 'Delivery Fleet' },
  };
  const titles = TITLES[businessType] || TITLES.RESTAURANT;

  const getTitle = () => {
    if (user?.role === 'KITCHEN')  return titles.kitchen;
    if (user?.role === 'DELIVERY') return titles.delivery;
    return titles.admin;
  };

  const primary = tenantTheme?.primaryColor || '#c9a227';

  return (
    <div className="min-h-screen flex bg-bg-dark overflow-hidden relative">
      <GlobalOrderAlert />
      
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Premium Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)} 
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Navbar for Admin */}
        <Navbar onMenuClick={handleToggle} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-bg-dark/50 no-scrollbar">
          {/* Header Section */}
          <motion.header 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="h-1 w-12 rounded-full" style={{ background: primary }} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primary }}>
                {user?.role === 'ADMIN' ? 'Operational Oversight' : 'Operational Focus'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {tenantTheme?.logo && (
                <img src={tenantTheme.logo} alt="logo" className="h-10 w-10 rounded-xl object-cover" />
              )}
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">{getTitle()}</h1>
            </div>
            <p className="text-text-muted text-sm mt-2 max-w-md italic">
              {tenantTheme?.businessName ? `${tenantTheme.businessName} — ` : ''}
              {user?.role === 'KITCHEN' ? 'Managing kitchen operations and order preparation.' :
               user?.role === 'DELIVERY' ? 'Managing deliveries and fleet operations.' :
               'Full control over your business operations.'}
            </p>
          </motion.header>

          {/* Page Content */}
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
