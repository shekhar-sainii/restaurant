import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';

/**
 * Reusable Admin Table Component
 * @param {Array} columns - Config for headers e.g. [{ key: 'name', label: 'Product Name', render: (val) => ... }]
 * @param {Array} data - The dataset to display
 * @param {Boolean} loading - Loading state
 * @param {Function} actions - Optional function to render row actions
 */
const AdminTable = ({ columns, data, loading, actions }) => {
  return (
    <div className="glass rounded-[2rem] overflow-hidden relative min-h-[400px] flex flex-col">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-dark/40 backdrop-blur-sm z-20 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-primary animate-spin" size={40} />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Refreshing Data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto flex-1 h-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-white/5">
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Inbox size={48} className="text-text-muted" />
                    <p className="text-sm font-bold uppercase tracking-widest text-text-muted">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <motion.tr
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={row._id || idx}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-8 py-5 text-sm font-medium ${col.className || ''}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer - could add pagination here later */}
      {!loading && data.length > 0 && (
        <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
            Showing {data.length} Results
          </p>
          <div className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2">
            <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
            Live Sync: Active
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
