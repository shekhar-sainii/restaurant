import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, selectCartCount } from '../../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import axios from 'axios';

const BUSINESS_HERO = {
  BAKERY:  { headline: "Fresh From the Oven",   sub: "Handcrafted with love every morning",       emoji: "🎂" },
  GROCERY: { headline: "Fresh & Affordable",    sub: "Quality groceries delivered to your door",  emoji: "🛒" },
  CUSTOM:  { headline: "Welcome to Our Store",  sub: "Discover our curated collection",           emoji: "🏪" },
};

const GenericStore = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const { tenant, slug } = useTenant();

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);

  const hero = BUSINESS_HERO[tenant?.businessType] || BUSINESS_HERO.CUSTOM;
  const primary = tenant?.theme?.primaryColor || '#c9a227';

  useEffect(() => {
    const headers = { 'X-Tenant-Slug': slug };
    Promise.all([
      axios.get('/api/v1/public/products',   { headers }),
      axios.get('/api/v1/public/categories', { headers }),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.categoryId?._id === activeCategory || p.categoryId === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: tenant?.theme?.backgroundColor || '#0f0f0f' }}>

      {/* Hero */}
      <section className="relative px-6 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at 50% 0%, ${primary}, transparent 70%)` }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-xl mx-auto">
          <div className="text-6xl mb-4">{hero.emoji}</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{hero.headline}</h1>
          <p className="text-gray-400 mb-6">{hero.sub}</p>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>
            {tenant?.businessName}
          </p>
        </motion.div>
      </section>

      {/* Search + Filter */}
      <div className="px-6 pb-6 max-w-6xl mx-auto">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-white/20 placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="px-6 pb-6 max-w-6xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
              style={activeCategory === 'all' ? { background: primary } : {}}>
              All
            </button>
            {categories.map(c => (
              <button key={c._id} onClick={() => setActiveCategory(c._id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === c._id ? 'text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
                style={activeCategory === c._id ? { background: primary } : {}}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="px-6 pb-20 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: primary }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">{hero.emoji}</div>
            <p>{search ? 'No products match your search.' : 'No products available yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filtered.map((product, i) => (
                <motion.div key={product._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all group">

                  {/* Image */}
                  <div className="aspect-square bg-white/5 relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
                        {hero.emoji}
                      </div>
                    )}
                    {product.discountedPrice && product.discountedPrice < product.price && (
                      <span className="absolute top-3 left-3 text-black text-[10px] font-black px-2 py-1 rounded-lg"
                        style={{ background: primary }}>
                        {Math.round((1 - product.discountedPrice / product.price) * 100)}% OFF
                      </span>
                    )}
                    {product.isVeg !== undefined && (
                      <span className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center ${product.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${product.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                    )}

                    {/* Variations */}
                    {product.hasVariations && product.variations?.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {product.variations.map((v, vi) => (
                            <span key={vi} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-gray-400">
                              {v.name} — ₹{v.discountedPrice || v.price}
                            </span>
                          ))}
                        </div>
                        <button onClick={() => dispatch(addItem({ product, variation: product.variations[0] }))}
                          className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all hover:opacity-90"
                          style={{ background: primary }}>
                          Add to Cart
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-black text-lg" style={{ color: primary }}>
                            ₹{product.discountedPrice || product.price}
                          </span>
                          {product.discountedPrice && product.discountedPrice < product.price && (
                            <span className="text-gray-500 text-xs line-through ml-2">₹{product.price}</span>
                          )}
                        </div>
                        <button onClick={() => dispatch(addItem({ product, variation: null }))}
                          className="p-2 rounded-xl text-black transition-all hover:opacity-90"
                          style={{ background: primary }}>
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}
            onClick={() => navigate(`/${slug}/cart`)}
            className="fixed bottom-6 right-6 text-black font-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 hover:opacity-90 transition-all z-50"
            style={{ background: primary }}>
            <ShoppingCart size={20} />
            <span>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
            <ChevronRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenericStore;
