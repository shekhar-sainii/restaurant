import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Utensils, Star, Clock, MapPin, Search, Filter, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('/api/v1/public/tenants'),
      axios.get('/api/v1/public/platform').catch(() => ({ data: { data: null } }))
    ])
      .then(([resTenants, resPlatform]) => {
        setRestaurants(resTenants.data.data || []);
        if (resPlatform.data?.data) {
          setPlatform(resPlatform.data.data);
        }
      })
      .catch(err => console.error('Failed to fetch data:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRestaurants = restaurants.filter(res => 
    res.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Platform theme defaults
  const primary = platform?.theme?.primaryColor || '#c9a227';
  const bg = platform?.theme?.backgroundColor || '#050505';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors" style={{ backgroundColor: bg }}>
        <div className="relative">
          <div className="w-16 h-16 border-2 rounded-full" style={{ borderColor: `${primary}20` }} />
          <div className="w-16 h-16 border-2 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: primary, borderTopColor: 'transparent' }} />
          <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ color: primary }} size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white transition-colors duration-500" style={{ backgroundColor: bg }}>
      
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000" style={{ backgroundColor: `${primary}15` }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#aa3bff]/5 blur-[120px] rounded-full" />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8" style={{ color: primary }}>
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{platform?.brandName || 'Certified Premium Dining'}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-playfair font-bold leading-[1.1] mb-8" dangerouslySetInnerHTML={{ __html: (platform?.heroTitle || 'The Elite <br /> <span class="italic">Epicurean</span> <br /> Collection').replace(/class="italic"/, `style="color: ${primary}; font-style: italic"`) }} />
              
              <p className="text-text-muted text-lg font-light leading-relaxed max-w-lg mb-10">
                {platform?.heroSubtitle || 'Explore a curated selection of the finest multi-tenant restaurants. Every plate tells a story of passion and excellence.'}
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors opacity-50" size={20} />
                <input 
                  type="text"
                  placeholder="Search for your favorite kitchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-14 pr-6 outline-none transition-all text-sm font-medium backdrop-blur-xl"
                  style={{ '--tw-ring-color': primary }}
                  onFocus={(e) => e.target.style.borderColor = primary}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" 
                  alt="Fine Dining" 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                
                {/* Floating Stat Card */}
                <div className="absolute bottom-10 left-[-40px] glass p-6 rounded-3xl border border-white/10 shadow-2xl animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                      <Utensils size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-playfair">50+</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Active Cuisines</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="relative py-20 px-6 z-10 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-4xl font-playfair font-bold mb-4">Discover Restaurants</h2>
              <div className="h-1 w-20 rounded-full transition-colors" style={{ backgroundColor: primary }} />
            </div>
            
            <div className="flex gap-4">
               {['All', 'Italian', 'Burgers', 'Premium'].map((cat) => (
                 <button key={cat} className="px-6 py-2 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-white/5" onMouseEnter={e => e.target.style.color = primary} onMouseLeave={e => e.target.style.color = 'inherit'}>
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filteredRestaurants.map((res, idx) => (
                <motion.div
                  key={res.slug}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative"
                >
                  <Link to={`/${res.slug}`} className="block h-full">
                    {/* Modern Card Design */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden transition-all duration-500 h-full group-hover:bg-white/[0.04] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col"
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${primary}50`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                      
                      {/* Image Area */}
                      <div className="aspect-[16/10] relative overflow-hidden m-4 rounded-[2.5rem]">
                        {res.logo ? (
                          <img 
                            src={res.logo.startsWith('http') ? res.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${res.logo}`} 
                            alt={res.businessName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center transition-colors" style={{ background: `linear-gradient(to bottom right, ${primary}20, rgba(0,0,0,0))` }}>
                            <Utensils size={48} className="text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                        
                        {/* Badges */}
                        <div className="absolute top-5 left-5 flex gap-2">
                          <div className="glass px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                             <Star size={12} style={{ color: primary, fill: primary }} />
                             <span className="text-[10px] font-black">4.9</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-8 pt-2 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-3xl font-playfair font-bold text-white transition-colors" 
                            onMouseEnter={e => e.target.style.color = primary} 
                            onMouseLeave={e => e.target.style.color = '#fff'}>
                            {res.businessName}
                           </h3>
                        </div>

                        <div className="flex flex-wrap gap-6 mb-10">
                          <div className="flex items-center gap-2 text-text-muted">
                            <Clock size={16} className="text-primary/60" />
                            <span className="text-[10px] font-black uppercase tracking-widest">25-35 MIN</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-muted">
                            <MapPin size={16} className="text-primary/60" />
                            <span className="text-[10px] font-black uppercase tracking-widest">1.2 KM</span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                           <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Cuisine Style</span>
                             <span className="text-xs font-bold text-white/80 italic">{res.businessType || 'Fine Dining'}</span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500"
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = primary; e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = '#000'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}>
                             <ChevronRight size={20} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="py-40 text-center">
              <Search size={64} className="mx-auto text-white/5 mb-6" />
              <p className="text-text-muted font-playfair italic text-2xl">No kitchens matched your search criteria...</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 px-6 border-t border-white/5 z-10 relative transition-colors duration-500" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <h2 className="text-2xl font-playfair font-bold mb-2 transition-colors" style={{ color: primary }}>{platform?.brandName || 'Gourmet Hub'}</h2>
            <p className="text-text-muted text-[10px] uppercase font-black tracking-widest">Premium Multi-Tenant SaaS Experience</p>
          </div>
          <div className="flex gap-10">
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors" onMouseEnter={e => e.target.style.color = primary} onMouseLeave={e => e.target.style.color = ''}>Privacy</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors" onMouseEnter={e => e.target.style.color = primary} onMouseLeave={e => e.target.style.color = ''}>Terms</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors" onMouseEnter={e => e.target.style.color = primary} onMouseLeave={e => e.target.style.color = ''}>Contact</a>
          </div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">© 2026 {platform?.brandName || 'QService'}. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default RestaurantList;
