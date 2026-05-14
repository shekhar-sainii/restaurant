import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addItem, selectCartCount } from '../../redux/slices/cartSlice';
import { selectAuth } from '../../redux/slices/authSlice';
import { useTenant } from '../../context/TenantContext';
import axios from 'axios';
import {
  ShoppingCart, ChevronRight, Search, Star, Clock, 
  Pizza, ArrowRight, Utensils, CheckCircle, Sparkles, 
  Flame, Compass, ShieldCheck, Plus, Package
} from 'lucide-react';

const BIZ_CONFIG = {
  RESTAURANT: {
    emoji: '🍕', heroTag: 'Flagship Fine Dining Interface',
    ctaLabel: 'Explore Curated Layers', showVegBadge: true, showVariations: true,
  },
  FAST_FOOD: {
    emoji: '🍔', heroTag: 'High-Velocity Fulfillment Terminal',
    ctaLabel: 'Examine Fast Combos', showVegBadge: true, showVariations: true,
  },
  CUSTOM: {
    emoji: '🍱', heroTag: 'Premium Multi-Tenant Hub',
    ctaLabel: 'Browse Provisions', showVegBadge: true, showVariations: true,
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
  const discountPercent = Math.round((1 - displayPrice / originalPrice) * 100);

  const imgUrl = product.image?.startsWith('http') 
    ? product.image 
    : `${import.meta.env.VITE_API_URL || ''}${product.image}`;

  // Generate dynamic index-based tag
  const isPremium = originalPrice > 400;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col h-full bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-2xl border border-white/5 transition-all duration-500 hover:bg-white/[0.05] hover:border-primary/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
      style={{ borderRadius: borderRadius || '2rem' }}
    >
      {/* Dynamic Ambient Color Backsplash */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none -z-10 group-hover:from-primary/20 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none -z-10" />

      {/* Image Framed Display */}
      <div className="aspect-[16/11] relative overflow-hidden m-3.5 rounded-[1.6rem] border border-white/5 group-hover:border-primary/20 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-500 z-10" />
        
        {product.image ? (
          <img 
            src={imgUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-[1deg]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 text-6xl opacity-10">
            {biz?.emoji || '🍽️'}
          </div>
        )}

        {/* Dynamic Strike Overlays & Discount Capsule */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20 pointer-events-none">
          {hasDiscount ? (
            <motion.div 
              initial={{ scale: 0.8, x: -10 }} animate={{ scale: 1, x: 0 }}
              className="flex flex-col items-start gap-1"
            >
              <span 
                className="px-3 py-1 text-[10px] font-black text-black rounded-full uppercase tracking-widest shadow-2xl backdrop-blur-md flex items-center gap-1 border border-white/40 animate-pulse"
                style={{ backgroundColor: primary }}
              >
                <Flame size={12} className="fill-black" />
                <span>{discountPercent}% OFF TODAY</span>
              </span>
              <span className="text-[8px] font-black bg-black/60 text-emerald-400 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                Save ₹{savings}
              </span>
            </motion.div>
          ) : (
            <span className="text-[9px] font-black tracking-widest uppercase bg-white/10 text-white/80 px-2.5 py-1 rounded-full backdrop-blur-md">
              Standard Rate
            </span>
          )}

          {/* Veg/Non-Veg Pure Protocol Indicator */}
          {biz?.showVegBadge && product.isVeg !== undefined && (
            <div className={`p-1.5 rounded-xl backdrop-blur-xl border shadow-xl ${product.isVeg ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${product.isVeg ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`} />
            </div>
          )}
        </div>

        {/* Bottom Floating Sub-Category Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-20 pointer-events-none">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/90 bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
            {product.categoryId?.name || 'Signature Item'}
          </span>

          {isPremium && (
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-0.5">
              ⭐ Chef Select
            </span>
          )}
        </div>
      </div>

      {/* Core Body Container */}
      <div className="p-5 pt-3 flex flex-col flex-1 justify-between z-10">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-xl font-playfair font-black text-white group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-1">
              {product.name}
            </h3>
          </div>

          {product.description ? (
            <p className="text-text-muted text-xs font-light line-clamp-2 leading-relaxed text-white/60">
              {product.description}
            </p>
          ) : (
            <p className="text-text-muted text-[11px] font-light italic text-white/40">
              Freshly crafted with absolute multi-tenant quality guidelines.
            </p>
          )}
        </div>

        {/* Dynamic Multi-Variation Pickers */}
        {biz?.showVariations && product.hasVariations && product.variations?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 pt-1 border-t border-white/5 mt-auto">
            <span className="w-full text-[8px] font-black text-text-muted uppercase tracking-widest mb-1 block">
              Select Portion / Size Tier
            </span>
            {product.variations.map((v, idx) => {
              const isSelected = selectedVariation?.name === v.name;
              return (
                <button 
                  key={idx} 
                  onClick={() => setSelectedVariation(v)}
                  className="text-[9px] px-3 py-1.5 rounded-xl border font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
                  style={{
                    backgroundColor: isSelected ? primary : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? primary : 'rgba(255,255,255,0.1)',
                    color: isSelected ? '#000' : 'rgba(255,255,255,0.7)',
                    boxShadow: isSelected ? `0 4px 12px ${primary}30` : 'none',
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Interactive Price Tray & Execution Button */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-0.5 flex items-center gap-1">
              <span>Final Rate</span>
              {hasDiscount && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />}
            </span>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">₹{displayPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-rose-400/80 line-through font-bold">₹{originalPrice}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => onAdd(product, selectedVariation)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-black text-xs font-black uppercase tracking-widest active:scale-95 transition-all duration-300 hover:opacity-90 shadow-2xl group/btn border border-black/10 overflow-hidden relative"
            style={{ backgroundColor: primary }}
          >
            {/* Glowing background burst effect on hover */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            <Plus size={16} className="group-hover/btn:rotate-90 transition-transform duration-300 relative z-10" />
            <span className="relative z-10 font-black">Order</span>
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
  const { isAuthenticated }             = useSelector(selectAuth);
  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  useEffect(() => {
    const rawGuests = localStorage.getItem('guest_orders');
    if (rawGuests) {
      try {
        const logs = JSON.parse(rawGuests);
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        const validLogs = logs.filter(log => (Date.now() - (log.timestamp || 0)) < TWELVE_HOURS);
        
        if (validLogs.length > 0) {
          setHasActiveOrders(true);
          if (validLogs.length !== logs.length) {
            localStorage.setItem('guest_orders', JSON.stringify(validLogs));
          }
        } else {
          localStorage.removeItem('guest_orders');
          setHasActiveOrders(false);
        }
      } catch(e){}
    }
  }, []);

  const biz     = BIZ_CONFIG[tenant?.businessType] || BIZ_CONFIG.RESTAURANT;
  const primary = theme?.primaryColor || '#c9a227';
  const bg      = theme?.backgroundColor || '#030303';
  const surface = theme?.surfaceColor || '#111111';
  const radius  = theme?.borderRadius || '2rem';
  const font    = theme?.fontFamily || 'inherit';

  const load = useCallback(async () => {
    const headers = { 'X-Tenant-Slug': slug };
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get('/api/v1/public/products',   { headers }),
        axios.get('/api/v1/public/categories', { headers }),
      ]);
      setProducts(pRes.data?.data || []);
      setCategories(cRes.data?.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.categoryId?._id === activeCategory || p.categoryId === activeCategory;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.isAvailable !== false;
  });

  const handleAdd = (product, variation) => {
    dispatch(addItem({ product, variation }));
  };

  const tenantLogo = tenant?.logo?.startsWith('http') 
    ? tenant.logo 
    : `${import.meta.env.VITE_API_URL || ''}${tenant?.logo || ''}`;

  return (
    <div className="min-h-screen font-sans selection:bg-primary selection:text-black transition-colors duration-700 relative pb-12" style={{ backgroundColor: bg, fontFamily: font }}>
      
      {/* ── Exquisite Immersive Dynamic Ambient Lighting ── */}
      <div className="absolute top-0 left-0 right-0 h-[80vh] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[180px] opacity-20 animate-pulse transition-colors duration-1000" style={{ backgroundColor: primary }} />
        <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[160px]" />
        
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,#000_30%,transparent_100%)] opacity-50" />
      </div>

      {/* ── Enterprise Storefront Landing Banner ── */}
      <section className="relative px-6 pt-20 pb-12 z-10 max-w-7xl mx-auto">
        
        {/* Dynamic operational status ribbon */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/90">
              OPERATIONAL PROVISION ACTIVE
            </span>
            <span className="text-[9px] font-bold text-black px-2 py-0.5 rounded-full" style={{ backgroundColor: primary }}>
              {tenant?.slug || slug}
            </span>
          </motion.div>
        </div>

        {/* Flagship Brand Shield */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center relative"
        >
          {tenant?.logo ? (
            <div className="relative inline-block mb-6 group">
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" style={{ backgroundColor: primary }} />
              <img 
                src={tenantLogo} 
                alt={tenant?.businessName}
                className="relative w-28 h-28 rounded-3xl object-cover border-2 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                style={{ borderColor: primary }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl">
              {biz?.emoji}
            </div>
          )}

          {/* Business Tagline / Personality */}
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-primary">
            {biz?.heroTag}
          </p>

          {/* Immersive Store Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-playfair font-black text-white tracking-tight mb-6 leading-tight max-w-3xl mx-auto">
            {theme?.heroHeadline || tenant?.businessName || 'Elite Culinary Catalog'}
          </h1>

          {/* Premium Subtitle */}
          <p className="text-text-muted text-sm sm:text-base font-light max-w-xl mx-auto mb-10 leading-relaxed text-white/70">
            {theme?.heroSub || "Immerse your senses in our curated catalog. Prepared daily with premium micro-ingredients and delivered directly to your custom seat."}
          </p>

          {/* Execute CTA */}
          <button 
            onClick={() => {
              document.getElementById('catalog-layers')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-black text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
            style={{ backgroundColor: primary }}
          >
            <span>{biz?.ctaLabel}</span>
            <Compass size={16} className="animate-spin-slow" />
          </button>
        </motion.div>

        {/* Local Telemetry Highlights bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16 pt-8 border-t border-white/5"
        >
          {[
            { icon: Utensils, label: "Onboarded Delicacies", val: `${products.length} Items` },
            { icon: Clock, label: "Fulfillment SLA", val: "20-30 Mins" },
            { icon: Star, label: "Satisfaction Benchmark", val: "4.9 Premium" },
            { icon: ShieldCheck, label: "Payment Protocol", val: "Instant QR Hook" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="glass p-4 rounded-2xl border border-white/5 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-primary border border-white/5">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{item.val}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-0.5">{item.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

      </section>

      {/* ── Exquisite Category Filter Matrix ── */}
      <section className="px-6 py-12 max-w-7xl mx-auto z-10 relative">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">MENU PARTITIONS</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pt-2">
          <button 
            onClick={() => setActiveCategory('all')}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
            style={{
              backgroundColor: activeCategory === 'all' ? primary : 'rgba(255,255,255,0.02)',
              borderColor: activeCategory === 'all' ? primary : 'rgba(255,255,255,0.08)',
              color: activeCategory === 'all' ? '#000' : 'rgba(255,255,255,0.8)',
            }}
          >
            <Sparkles size={16} style={{ color: activeCategory === 'all' ? '#000' : primary }} />
            <span>Complete Collection</span>
          </button>

          {categories.map(c => {
            const isSelected = activeCategory === c._id;
            return (
              <button 
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap group hover:border-white/20"
                style={{
                  backgroundColor: isSelected ? primary : 'rgba(255,255,255,0.02)',
                  borderColor: isSelected ? primary : 'rgba(255,255,255,0.08)',
                  color: isSelected ? '#000' : 'rgba(255,255,255,0.8)',
                }}
              >
                {c.image ? (
                  <img 
                    src={c.image.startsWith('http') ? c.image : `${import.meta.env.VITE_API_URL || ''}${c.image}`} 
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : <span className="text-primary group-hover:scale-110 transition-transform">🏷️</span>}
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Flagship Products Catalog Layers ── */}
      <section id="catalog-layers" className="px-6 pb-24 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">AVAILABLE LAYERS</span>
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-white tracking-tight">
              {activeCategory === 'all' ? 'All Onboarded Portions' : categories.find(c => c._id === activeCategory)?.name}
            </h2>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search distinct specialty plates..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white outline-none transition-all backdrop-blur-md focus:border-primary/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: primary }} />
            <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">Resolving database layer...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 glass rounded-3xl border border-white/5 max-w-xl mx-auto">
            <Utensils size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white font-playfair font-bold text-xl mb-1">No specialties fit this parameter</p>
            <p className="text-xs text-text-muted">Try resetting search string or selecting another menu partition tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filtered.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  biz={biz} 
                  primary={primary} 
                  borderRadius={radius} 
                  onAdd={handleAdd} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Active Order & Cart Drawer Overlay Tray ── */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col sm:flex-row items-end gap-3 pointer-events-none">
        
        {/* Active Order Tracking Floating Button */}
        <AnimatePresence>
          {(hasActiveOrders || isAuthenticated) && (
            <motion.button
              initial={{ scale: 0, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 40 }}
              onClick={() => navigate(`/${slug}/orders`)}
              className="pointer-events-auto text-white font-sans px-6 py-4 shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group backdrop-blur-2xl border border-white/20"
              style={{ backgroundColor: 'rgba(20,20,20,0.95)', borderRadius: '2.5rem' }}
            >
              <div className="relative p-2 rounded-full border border-white/10" style={{ backgroundColor: `${primary}20`, color: primary }}>
                 <Package size={18} />
                 <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primary }} />
              </div>
              
              <div className="text-left pr-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-0.5">Timeline</p>
                 <p className="text-xs font-black tracking-tight text-white">Track Order</p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Active Cart Drawer Assembly Bubble */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.button
              initial={{ scale: 0, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 40 }}
              onClick={() => navigate(`/${slug}/cart`)}
              className="pointer-events-auto text-black font-sans px-8 py-4 shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all group border border-black/10"
              style={{ backgroundColor: primary, borderRadius: '2.5rem' }}
            >
              <div className="relative p-2 rounded-full bg-black/10">
                 <ShoppingCart size={20} className="text-black" />
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black rounded-full animate-ping" />
              </div>
              
              <div className="text-left">
                 <p className="text-[9px] font-black uppercase tracking-widest text-black/60 mb-0.5">Order Assembly</p>
                 <p className="text-xs font-black tracking-tight">{cartCount} Active Selection{cartCount > 1 ? 's' : ''}</p>
              </div>
              
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default TenantStorefront;
