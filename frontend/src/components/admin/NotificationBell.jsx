import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, ShoppingBag, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import {
  selectNotifications, selectUnreadCount,
  markAllRead, clearAll, markRead,
} from '../../redux/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  new_order:    { icon: ShoppingBag,  color: 'text-primary',   bg: 'bg-primary/10'   },
  order_update: { icon: RefreshCw,    color: 'text-blue-400',  bg: 'bg-blue-400/10'  },
  DELIVERED:    { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  CANCELLED:    { icon: XCircle,      color: 'text-red-400',   bg: 'bg-red-400/10'   },
};

const getConfig = (notif) => {
  if (notif.status === 'DELIVERED') return TYPE_CONFIG.DELIVERED;
  if (notif.status === 'CANCELLED') return TYPE_CONFIG.CANCELLED;
  return TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_order;
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const notifications = useSelector(selectNotifications);
  const unreadCount   = useSelector(selectUnreadCount);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
  };

  const handleNotifClick = (notif) => {
    dispatch(markRead(notif.id));
    setOpen(false);
    navigate('/admin/order-mgmt');
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button onClick={handleOpen}
        className="relative p-2 text-text-muted hover:text-primary transition-all">
        <Bell size={22} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-primary" />
                <span className="text-sm font-bold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={() => dispatch(markAllRead())}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-primary transition-all"
                    title="Mark all read">
                    <CheckCheck size={14} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={() => dispatch(clearAll())}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-red-400 transition-all"
                    title="Clear all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Bell size={28} className="text-text-muted/40" />
                  <p className="text-text-muted text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map(notif => {
                    const cfg = getConfig(notif);
                    const Icon = cfg.icon;
                    return (
                      <button key={notif.id} onClick={() => handleNotifClick(notif)}
                        className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all hover:bg-white/5 ${!notif.read ? 'bg-white/[0.03]' : ''}`}>
                        <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={16} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold leading-tight ${notif.read ? 'text-text-muted' : 'text-white'}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 truncate">{notif.body}</p>
                          <p className="text-[10px] text-text-muted/60 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
