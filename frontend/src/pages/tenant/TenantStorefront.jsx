/**
 * TenantStorefront — Single unified storefront for ALL business types.
 * Renders dynamically based on tenant.businessType and tenant.enabledModules.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addItem, selectCartCount } from '../../redux/slices/cartSlice';
import { useTenant } from '../../context/TenantContext';
import axios from 'axios';
import {
  ShoppingCart, ChevronRight, Search, Star, 
  Clock, Pizza, ArrowRight, Utensils
} from 'lucide-react';

const BIZ_CONFIG = {
  RESTAURANT: {
    emoji: '🍕', heroTag: 'Fine Dining Experience',
    features: [
      { icon: Pizza,  title: 'Fresh Daily',     desc: 'Made fresh every day'         },
      { icon: Clock,  title: 'Fast Service',    desc: 'Quick table & delivery'       },
      { icon: Star,   title: 'Premium Quality', desc: 'Only the finest ingredients'  },
    ],
    ctaLabel: 'Explore Menu', showVegBadge: true, showVariations: true,
    gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cardAspect: 'aspect-[4/3]',
  }
};

const ProductCard = ({ product, biz, primary, borderRadius, onAdd }) => {
  const [selectedVariation, setSelectedVariation] = useState(
    product.hasVariations && product.variations?.length > 0 ? product.variations[0] : null
  );

  const displayPrice = selectedVariation
    ? (selectedVariation.discountedPrice || selectedVariation.price)
    : (product.discountedPrice || product.price);

  const originalPrice = selectedVariation
    ? selectedVariation.price
    : product.price;

  const hasDiscount = displayPrice < originalPrice;
  const savings = originalPrice - displayPrice;

  const imgUrl = product.image?.startsWith('http') 
    ? product.image 
    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col h-full bg-[#1A1A1A]/40 backdrop-blur-md border border-white/5 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
      style={{ borderRadius }}
    >
      {/* Image Container */}
      <div className={`relative ${biz.cardAspect || 'aspect-square'} overflow-hidden rounded-t-[inherit]`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        
        {product.image ? (
          <img 
            src={imgUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 text-6xl opacity-20">
            {biz.emoji}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {hasDiscount && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="px-2.5 py-1 text-[10px] font-black text-black rounded-lg shadow-xl"
              style={{ background: primary }}
            >
              {Math.round((1 - displayPrice / originalPrice) * 100)}% OFF
            </motion.span>
          )}
          {biz.showVegBadge && product.isVeg !== undefined && (
            <div className={`w-6 h-6 rounded-lg backdrop-blur-md border flex items-center justify-center ${product.isVeg ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
              <div className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Variation Selection */}
        {biz.showVariations && product.hasVariations && product.variations?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {product.variations.map((v, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedVariation(v)}
                className={`text-[9px] px-2.5 py-1.5 rounded-lg border font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedVariation?.name === v.name 
                  ? 'border-transparent shadow-lg' 
                  : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                }`}
                style={selectedVariation?.name === v.name ? { background: primary, color: '#000' } : {}}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">₹{displayPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-600 line-through font-bold">₹{originalPrice}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-tighter">
                Save ₹{savings}
              </span>
            )}
          </div>

          <button
            onClick={() => onAdd(product, selectedVariation)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-black text-[11px] font-black uppercase tracking-wider overflow-hidden group/btn active:scale-95 transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-primary/20"
            style={{ background: primary }}
          >
            <ShoppingCart size={14} className="relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
            <span className="relative z-10">Add</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TenantStorefront = () => {
  const { tenant, slug, theme } = useTenant();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const cartCount  = useSelector(state => selectCartCount(state, tenant?.tenantId));

  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);

  const biz     = BIZ_CONFIG[tenant?.businessType] || BIZ_CONFIG.RESTAURANT;
  const primary = theme?.primaryColor || '#c9a227';
  const bg      = theme?.backgroundColor || '#0f0f0f';
  const surface = theme?.surfaceColor || '#1a1a1a';
  const radius  = theme?.borderRadius || '1.5rem';
  const font    = theme?.fontFamily || 'inherit';

  const load = useCallback(async () => {
    const headers = { 'X-Tenant-Slug': slug };
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get('/api/v1/public/products',   { headers }),
        axios.get('/api/v1/public/categories', { headers }),
      ]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.categoryId?._id === activeCategory || p.categoryId === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.isAvailable !== false;
  });

  const handleAdd = (product, variation) => {
    dispatch(addItem({ product, variation }));
  };

  const tenantLogo = tenant?.logo?.startsWith('http') 
    ? tenant.logo 
    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${tenant.logo}`;

  return (
    <div className="min-h-screen" style={{ background: bg, fontFamily: font }}>

      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% -20%, ${primary}25 0%, transparent 65%)` }} />

        {tenant?.banner && (
          <div className="absolute inset-0">
            <img src={tenant.banner} alt="banner" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${bg}40, ${bg})` }} />
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto text-center">

          {tenant?.logo ? (
            <img src={tenantLogo} alt={tenant.businessName}
              className="h-20 w-20 rounded-3xl object-cover mx-auto mb-6 shadow-2xl border border-white/10" />
          ) : (
            <div className="text-7xl mb-6">{biz.emoji}</div>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            style={{ background: `${primary}20`, color: primary, border: `1px solid ${primary}30` }}>
            {biz.heroTag}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            {theme?.heroHeadline || `Exquisite Flavors at ${tenant?.businessName}`}
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {theme?.heroSub || "Experience culinary perfection with our handcrafted menu, designed to delight every sense and satisfy every craving."}
          </p>

          <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-black font-black uppercase tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 shadow-2xl"
            style={{ background: primary, borderRadius: radius }}>
            {biz.ctaLabel} <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ── Category Browser (Visual) ── */}
      <section className="px-6 py-12 max-w-7xl mx-auto overflow-hidden">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8 flex items-center gap-4">
          Browse by Style
          <div className="h-px flex-1 bg-white/5" />
        </h2>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
          <div 
            onClick={() => setActiveCategory('all')}
            className={`min-w-[120px] cursor-pointer group flex flex-col items-center gap-3 transition-all ${activeCategory === 'all' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`w-20 h-20 rounded-full border-2 p-1 transition-all ${activeCategory === 'all' ? 'border-primary' : 'border-white/10'}`}>
              <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🍽️</div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">All Items</span>
          </div>
          {categories.map(c => (
            <div 
              key={c._id}
              onClick={() => setActiveCategory(c._id)}
              className={`min-w-[120px] cursor-pointer group flex flex-col items-center gap-3 transition-all ${activeCategory === c._id ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
            >
              <div className={`w-20 h-20 rounded-full border-2 p-1 transition-all ${activeCategory === c._id ? 'border-primary' : 'border-white/10'}`}>
                {c.image ? (
                  <img src={c.image.startsWith('http') ? c.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${c.image}`} 
                       className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🍔</div>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products List ── */}
      <section id="products-section" className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">— Current Selection</span>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {activeCategory === 'all' ? 'Signature Menu' : categories.find(c => c._id === activeCategory)?.name}
            </h2>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white outline-none focus:border-primary/30 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(201,162,39,0.3)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40 bg-white/[0.02] rounded-[3rem] border border-white/5">
            <Utensils className="mx-auto text-primary/20 mb-6" size={64} />
            <p className="text-xl text-gray-400 font-light italic">{search ? 'No results found for your search.' : 'Oops! This kitchen is currently preparing a new menu.'}</p>
          </div>
        ) : (
          <div className={`grid ${biz.gridCols} gap-8`}>
            <AnimatePresence>
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} biz={biz} primary={primary} borderRadius={radius} onAdd={handleAdd} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0, x: 50 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0, x: 50 }}
            onClick={() => navigate(`/${slug}/cart`)}
            className="fixed bottom-10 right-10 text-black font-black px-8 py-5 shadow-2xl flex items-center gap-4 hover:translate-y-[-4px] active:scale-95 transition-all z-50 group"
            style={{ background: primary, borderRadius: '2rem' }}>
            <div className="relative">
               <ShoppingCart size={22} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full border border-white/20 animate-ping" />
            </div>
            <div className="flex flex-col items-start leading-none">
               <span className="text-[9px] uppercase tracking-widest opacity-70 mb-1">Items in Cart</span>
               <span className="text-sm">{cartCount} Dish{cartCount > 1 ? 'es' : ''}</span>
            </div>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantStorefront;
