import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Reusable Premium Modal Component
 * @param {Boolean} isOpen - Control visibility
 * @param {Function} onClose - Close callback
 * @param {String} title - Modal title
 * @param {ReactNode} children - Modal content
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-bg-neutral/90 border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-bg-neutral/50 backdrop-blur-md z-10">
              <div>
                <h2 className="text-2xl font-playfair font-bold text-white tracking-tight">{title}</h2>
                <div className="h-0.5 w-8 bg-primary mt-1 rounded-full" />
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-white/5 text-text-muted hover:text-white transition-all transform hover:rotate-90 duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
