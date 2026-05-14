import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Type } from 'lucide-react';

const CategoryForm = ({ category, onSuccess, onCancel }) => {
  const isEditing = !!category;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    image: category?.image || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true
  });

  // Handle auto-slug generation
  useEffect(() => {
    if (!isEditing && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await adminService.updateCategory(category._id, formData);
      } else {
        await adminService.createCategory(formData);
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
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Category Name</label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Main Course"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Unique Slug</label>
            <input
              type="text"
              name="slug"
              required
              readOnly={isEditing}
              value={formData.slug}
              onChange={handleChange}
              placeholder="main-course"
              className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none text-sm ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary/40'}`}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Image URL</label>
            <div className="relative group">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Position / Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/40 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="sr-only" 
            />
            <div className={`w-10 h-6 rounded-full transition-all ${formData.isActive ? 'bg-primary' : 'bg-white/10'}`} />
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Status</span>
        </label>
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
            {isEditing ? 'Save Changes' : 'Add Category'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
