import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Leaf, Star, Truck, Shield, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, selectCartCount } from '../../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HoneyHubStore = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const cartCount  = useSelector(selectCartCount);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = localStorage.getItem('tenant_slug') || 'honeyhub';
    Promise.all([
      axios.get('/api/v1/public/products',   { headers: { 'X-Tenant-Slug': slug } }),
      axios.get('/api/v1/public/categories', { headers: { 'X-Tenant-Slug': slug } }),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tNum = params.get('table');
    if (tNum) {
      localStorage.setItem('selected_table', tNum);
    }
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.categoryId?._id === activeCategory || p.categoryId === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0a00 0%, #1a1000 100%)' }}>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #f59e0b 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-6">
            <Leaf size={14} className="text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">100% Pure & Natural</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 leading-tight">
            Nature's Finest <span className="text-amber-400">Honey</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Sourced from pristine forests. No additives, no preservatives. Just pure golden goodness.
          </p>
          <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-amber-400 text-black font-black uppercase tracking-widest text-sm px-8 py-4 rounded-2xl hover:bg-amber-300 transition-all">
            Shop Now <ChevronRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Leaf,   title: 'Raw & Unfiltered',  desc: 'Straight from the hive' },
            { icon: Shield, title: 'Lab Tested',         desc: 'Quality guaranteed'     },
            { icon: Truck,  title: 'Fast Delivery',      desc: 'Pan India shipping'     },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-5 text-center">
              <f.icon size={24} className="text-amber-400 mx-auto mb-3" />
              <p className="font-bold text-white text-sm">{f.title}</p>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="px-6 py-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Our Products</h2>
        <p className="text-gray-500 mb-8">Premium honey varieties for every taste</p>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-amber-400 text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>
              All
            </button>
            {categories.map(c => (
              <button key={c._id} onClick={() => setActiveCategory(c._id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === c._id ? 'bg-amber-400 text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Leaf size={40} className="mx-auto mb-4 opacity-30" />
            <p>No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <motion.div key={product._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-amber-400/10 rounded-3xl overflow-hidden hover:border-amber-400/30 transition-all group">

                {/* Image */}
                <div className="aspect-square bg-amber-400/5 relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf size={48} className="text-amber-400/30" />
                    </div>
                  )}
                  {product.discountedPrice && product.discountedPrice < product.price && (
                    <span className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded-lg">
                      {Math.round((1 - product.discountedPrice / product.price) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white mb-1 truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-black text-lg">
                        ₹{product.discountedPrice || product.price}
                      </span>
                      {product.discountedPrice && product.discountedPrice < product.price && (
                        <span className="text-gray-500 text-xs line-through ml-2">₹{product.price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => dispatch(addItem({ product, variation: null }))}
                      className="bg-amber-400 text-black p-2 rounded-xl hover:bg-amber-300 transition-all">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Floating cart */}
      {cartCount > 0 && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 bg-amber-400 text-black font-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 hover:bg-amber-300 transition-all z-50">
          <ShoppingCart size={20} />
          <span>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
        </motion.button>
      )}
    </div>
  );
};

export default HoneyHubStore;
