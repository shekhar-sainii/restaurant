import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, ShieldAlert, X } from 'lucide-react';

/**
 * Premium Confirmation Modal
 * @param {Boolean} isOpen - Control visibility
 * @param {Function} onConfirm - Success callback
 * @param {Function} onCancel - Cancel callback
 * @param {String} title - Heading
 * @param {String} message - Subtext
 * @param {String} type - 'danger' | 'warning'
 * @param {String} confirmText - Button Label
 */
const ConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  type = "danger",
  confirmText = "Confirm Action"
}) => {
  const isDanger = type === 'danger';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="relative w-full max-w-md bg-bg-neutral/90 border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden p-8"
          >
            {/* Design Element */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 ${isDanger ? 'bg-red-500' : 'bg-primary'}`} />

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              {/* Icon Section */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                isDanger 
                ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(201,162,39,0.2)]'
              }`}>
                {isDanger ? <Trash2 size={32} /> : <ShieldAlert size={32} />}
              </div>

              {/* Text Section */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed px-4">
                  {message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full gap-3 pt-4">
                <button
                  onClick={onConfirm}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                    isDanger 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-primary text-black hover:bg-primary/90 shadow-primary/20'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onCancel}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-white transition-colors"
                >
                  Cancel & Go Back
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
