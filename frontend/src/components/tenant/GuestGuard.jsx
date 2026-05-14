import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { selectAuth } from '../../redux/slices/authSlice';
import { Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * GuestGuard — wraps routes that require login when guestOrdering is disabled.
 * If tenant disables guest ordering and user is not authenticated, shows login prompt.
 */
const GuestGuard = ({ children }) => {
  const { tenant, slug } = useTenant();
  const { isAuthenticated } = useSelector(selectAuth);
  const navigate = useNavigate();

  const guestAllowed = tenant?.enabledModules?.guestOrdering !== false;

  if (!guestAllowed && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: tenant?.theme?.backgroundColor || '#0f0f0f' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: `${tenant?.theme?.primaryColor || '#c9a227'}20`, border: `1px solid ${tenant?.theme?.primaryColor || '#c9a227'}30` }}>
            <Lock size={36} style={{ color: tenant?.theme?.primaryColor || '#c9a227' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            {tenant?.businessName} requires you to sign in before placing an order.
          </p>
          <button
            onClick={() => navigate(`/${slug}/login`)}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-black mx-auto transition-all hover:opacity-90"
            style={{ background: tenant?.theme?.primaryColor || '#c9a227' }}>
            <LogIn size={18} /> Sign In to Continue
          </button>
          <button onClick={() => navigate(`/${slug}`)}
            className="mt-4 text-gray-500 hover:text-white text-sm transition-colors block mx-auto">
            ← Back to Store
          </button>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default GuestGuard;
