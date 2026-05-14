import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicService } from '../../services/public.service';
import { Layers, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addItem } from '../../redux/slices/cartSlice';
import Modal from '../../components/common/Modal';

const Menu = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Variation Selection State
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          publicService.fetchCategories(),
          publicService.fetchProducts(),
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (error) {
        console.error('Failed to load menu data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.categoryId?._id === selectedCategory);
  }, [selectedCategory, products]);

  const handleAddToCart = (product) => {
    if (product.hasVariations && product.variations?.length > 0) {
      setActiveProduct(product);
      setSelectedVariation(product.variations[0]); // Default to first variation
    } else {
      dispatch(addItem({ product }));
    }
  };

  const confirmVariation = () => {
    if (activeProduct && selectedVariation) {
      dispatch(addItem({ 
        product: activeProduct, 
        variation: selectedVariation 
      }));
      setActiveProduct(null);
      setSelectedVariation(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-primary font-bold uppercase tracking-widest">
        Loading Menu...
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 px-6 max-w-7xl mx-auto">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-4">Our Menu</h1>
        <p className="text-text-muted max-w-lg">
          Masterfully crafted dishes combining seasonal ingredients with professional culinary techniques.
        </p>
      </header>

      {/* Category Filter Bar */}
      <div className="flex gap-4 overflow-x-auto pb-8 mb-12 no-scrollbar border-b border-white/5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-8 py-2.5 rounded-full border text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-primary border-primary text-black shadow-[0_0_20px_rgba(201,162,39,0.3)]'
              : 'border-white/10 text-text-muted hover:border-primary/50'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-8 py-2.5 rounded-full border text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === cat._id
                ? 'bg-primary border-primary text-black shadow-[0_0_20px_rgba(201,162,39,0.3)]'
                : 'border-white/10 text-text-muted hover:border-primary/50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={product._id}
              className="glass p-6 rounded-3xl group cursor-pointer hover:border-primary/40 transition-all flex flex-col"
              onClick={() => handleAddToCart(product)}
            >
              <div className="relative h-44 bg-white/5 rounded-2xl mb-6 overflow-hidden">
                <div className="absolute inset-x-2 top-2 z-10 flex justify-between">
                  {product.isVeg ? (
                    <span className="w-5 h-5 flex items-center justify-center border-2 border-green-500 rounded bg-bg-dark/80">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center border-2 border-red-500 rounded bg-bg-dark/80">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </span>
                  )}
                  {product.hasVariations && (
                    <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <Layers size={10} /> Choices
                    </span>
                  )}
                </div>
                {/* Product Image */}
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 group-hover:scale-110 transition-transform duration-700" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-xs text-text-muted mb-6 line-clamp-2 leading-relaxed">
                  {product.description || "Authentic flavor profiles inspired by professional culinary heritage."}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  {product.hasVariations ? (
                    <>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-black">Starting from</span>
                      <span className="text-xl font-black text-white">
                        ₹{Math.min(...product.variations.map(v => v.discountedPrice || v.price))}
                      </span>
                    </>
                  ) : (
                    <>
                      {product.discountedPrice && (
                        <span className="text-[10px] text-text-muted line-through">₹{product.price}</span>
                      )}
                      <span className="text-xl font-black text-white">
                        ₹{product.discountedPrice || product.price}
                      </span>
                    </>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="bg-primary hover:bg-white text-black h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-[0_5px_15px_rgba(201,162,39,0.2)] group-hover:shadow-primary/40 active:scale-95"
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Variation Selection Modal */}
      <Modal
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        title="Customize Your Order"
      >
        {activeProduct && (
          <div className="flex flex-col">
            <div className="mb-8 text-center md:text-left">
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">{activeProduct.name}</h3>
              <p className="text-sm text-text-muted uppercase tracking-[0.2em] font-black">Select your preference</p>
            </div>

            <div className="space-y-4 mb-10">
              {activeProduct.variations.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setSelectedVariation(v)}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 group/item ${
                    selectedVariation?.name === v.name
                      ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(201,162,39,0.1)]'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      selectedVariation?.name === v.name ? 'border-primary bg-primary scale-110' : 'border-white/20'
                    }`}>
                      <AnimatePresence>
                        {selectedVariation?.name === v.name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check size={18} className="text-black font-black" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <span className={`text-lg font-bold transition-colors ${
                      selectedVariation?.name === v.name ? 'text-primary' : 'text-text-muted group-hover/item:text-white'
                    }`}>
                      {v.name}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {v.discountedPrice && (
                      <span className="text-xs text-text-muted line-through mb-1">₹{v.price}</span>
                    )}
                    <span className={`text-2xl font-black transition-all ${
                      selectedVariation?.name === v.name ? 'text-white scale-105' : 'text-text-muted opacity-60'
                    }`}>
                      ₹{v.discountedPrice || v.price}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={confirmVariation}
              className="btn-primary w-full py-5 rounded-3xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(201,162,39,0.25)] hover:scale-[1.02] active:scale-98 transition-all group/btn font-bold tracking-widest text-sm uppercase"
            >
              <span>Add Selection to Selection</span>
              <div className="h-1.5 w-1.5 bg-black rounded-full opacity-20" />
              <span className="text-xl">₹{selectedVariation?.discountedPrice || selectedVariation?.price}</span>
            </button>
          </div>
        )}
      </Modal>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted italic">No items found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Menu;
