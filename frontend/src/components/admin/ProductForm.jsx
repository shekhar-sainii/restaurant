import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Plus, Trash2, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    discountedPrice: product?.discountedPrice || '',
    categoryId: product?.categoryId?._id || product?.categoryId || '',
    image: product?.image || '',
    isVeg: product?.isVeg ?? true,
    isAvailable: product?.isAvailable ?? true,
    hasVariations: product?.hasVariations ?? false,
    variations: product?.variations || []
  });

  // Category Presets Configuration
  const categoryPresets = {
    'Pizza': ['Regular', 'Medium', 'Large'],
    'Fast Food': ['Half', 'Full'],
    'Momos': ['Simple', 'Veg', 'Paneer'],
    'Noodles': ['Veg', 'Egg', 'Chicken']
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await adminService.fetchCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Handle Category Change & Auto-Presets
  useEffect(() => {
    if (formData.hasVariations && formData.categoryId && formData.variations.length === 0) {
      const selectedCat = categories.find(c => c._id === formData.categoryId);
      if (selectedCat && categoryPresets[selectedCat.name]) {
        const presets = categoryPresets[selectedCat.name].map(name => ({
          name,
          price: '',
          discountedPrice: ''
        }));
        setFormData(prev => ({ ...prev, variations: presets }));
      }
    }
  }, [formData.categoryId, formData.hasVariations, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { name: '', price: '', discountedPrice: '' }]
    }));
  };

  const handleRemoveVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[index][field] = value;
    setFormData(prev => ({ ...prev, variations: updatedVariations }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (formData.hasVariations && formData.variations.length === 0) {
      setError('Please add at least one size/variation or turn off "Has Sizes"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await adminService.updateProduct(product._id, formData);
      } else {
        await adminService.createProduct(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-shake">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Product Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Signature Truffle Pizza"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/40 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Category</label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/40 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="" className="bg-bg-dark">Select a Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id} className="bg-bg-dark">{cat.name}</option>
              ))}
            </select>
          </div>

          {!formData.hasVariations && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Base Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  required={!formData.hasVariations}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="499"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/40 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Discounted (₹)</label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  placeholder="399"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/40 transition-all text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Media & Options */}
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
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Description</label>
            <textarea
              name="description"
              rows={formData.hasVariations ? 2 : 4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Freshly kneaded dough with Italian truffles and aged parmesan..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/40 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Variation Section */}
      <AnimatePresence>
        {formData.hasVariations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <List size={18} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Product Sizes / Variations</h3>
              </div>
              <button
                type="button"
                onClick={handleAddVariation}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/20"
              >
                <Plus size={14} />
                Add Variation
              </button>
            </div>

            <div className="space-y-3">
              {formData.variations.map((v, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="grid grid-cols-12 gap-3 items-center bg-white/[0.02] p-3 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all"
                >
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      placeholder="Size/Name (e.g. Regular)"
                      value={v.name}
                      required
                      onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={v.price}
                      required
                      onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <input
                      type="number"
                      placeholder="Disc. Price"
                      value={v.discountedPrice}
                      onChange={(e) => handleVariationChange(index, 'discountedPrice', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(index)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              name="isVeg"
              checked={formData.isVeg}
              onChange={handleChange}
              className="sr-only" 
            />
            <div className={`w-10 h-6 rounded-full transition-all ${formData.isVeg ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-white/10'}`} />
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isVeg ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pure Veg</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="sr-only" 
            />
            <div className={`w-10 h-6 rounded-full transition-all ${formData.isAvailable ? 'bg-primary shadow-[0_0_8px_rgba(201,162,39,0.3)]' : 'bg-white/10'}`} />
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">In Stock</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              name="hasVariations"
              checked={formData.hasVariations}
              onChange={handleChange}
              className="sr-only" 
            />
            <div className={`w-10 h-6 rounded-full transition-all ${formData.hasVariations ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'bg-white/10'}`} />
            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.hasVariations ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Has Sizes</span>
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
            {isEditing ? 'Save Changes' : 'Create Product'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
