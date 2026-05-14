import React, { useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, CheckCircle, AlertCircle, Hash, Users, Activity } from 'lucide-react';

const TABLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  INACTIVE: "INACTIVE",
};

const TableForm = ({ table, onSuccess, onCancel }) => {
  const isEditing = !!table;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    tableNumber: table?.tableNumber || '',
    capacity: table?.capacity || 4,
    status: table?.status || TABLE_STATUS.AVAILABLE
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tableNumber' || name === 'capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await adminService.updateTable(table._id, formData);
      } else {
        await adminService.createTable(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Table Number</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="number"
                name="tableNumber"
                required
                value={formData.tableNumber}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Capacity (Seats)</label>
            <div className="relative group">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="number"
                name="capacity"
                required
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g. 4"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Table Status</label>
            <div className="relative group">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm appearance-none cursor-pointer"
              >
                {Object.values(TABLE_STATUS).map(status => (
                  <option key={status} value={status} className="bg-bg-dark text-white">
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-10 border-t border-white/5">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-10 py-3.5 rounded-2xl flex items-center gap-2 shadow-[0_15px_30px_rgba(201,162,39,0.2)]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span className="text-xs font-black uppercase tracking-widest">
            {isEditing ? 'Save Changes' : 'Add Table'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default TableForm;
