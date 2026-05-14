import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Utensils, Star, Clock, MapPin, Search, ShieldCheck, 
  Zap, Layers, Server, Cpu, CheckCircle2, ArrowUpRight, TrendingUp, 
  Users, Smartphone, Globe 
} from 'lucide-react';
import axios from 'axios';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    Promise.all([
      axios.get('/api/v1/public/tenants').catch(() => ({ data: { data: [] } })),
      axios.get('/api/v1/public/platform').catch(() => ({ data: { data: null } }))
    ])
      .then(([resTenants, resPlatform]) => {
        setRestaurants(resTenants.data?.data || []);
        if (resPlatform.data?.data) {
          setPlatform(resPlatform.data.data);
        }
      })
      .catch(err => console.error('Failed to fetch platform state:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = res.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Fine Dining') return matchesSearch && (!res.businessType || res.businessType === 'RESTAURANT');
    if (selectedCategory === 'Quick Service') return matchesSearch && res.businessType?.includes('FAST');
    if (selectedCategory === 'Cloud Kitchens') return matchesSearch && res.businessType !== 'RESTAURANT';
    return matchesSearch;
  });

  // Enterprise palette mappings
  const primary = platform?.theme?.primaryColor || '#c9a227';
  const bg = platform?.theme?.backgroundColor || '#030303';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors" style={{ backgroundColor: bg }}>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-20 h-20 border-2 rounded-full" style={{ borderColor: `${primary}15` }} />
          <div className="w-20 h-20 border-2 border-t-transparent rounded-full animate-spin absolute top-0" style={{ borderColor: primary }} />
          <Utensils className="absolute top-7 text-primary animate-pulse" size={24} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">Initializing OS Kernel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white transition-colors duration-700 font-sans selection:bg-primary selection:text-black" style={{ backgroundColor: bg }}>
      
      {/* ── Dynamic Glowing Background Gradients ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-25 transition-all duration-1000 animate-pulse" style={{ backgroundColor: primary }} />
        <div className="absolute bottom-[-10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-[#8a2be2] blur-[180px] opacity-15" />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-blue-600/10 blur-[140px]" />
        
        {/* Subtle background tech grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* ── Enterprise Hero Landing Layer ── */}
      <section className="relative pt-28 pb-16 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Top floating Status Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-8 hover:border-primary/40 transition-all cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
              {platform?.brandName || 'DineSync'} Enterprise Cloud OS v2.6
            </span>
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">PRODUCTION</span>
          </motion.div>

          {/* Main Headline Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-playfair font-black tracking-tight leading-[1.05] max-w-5xl mx-auto mb-8"
          >
            Orchestrate Fine Dining at <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Enterprise <span className="italic underline decoration-primary/40 underline-offset-8" style={{ color: primary }}>Scale</span>
            </span>
          </motion.h1>

          {/* Executive Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-muted text-lg sm:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-12 text-white/70"
          >
            The comprehensive multi-tenant SaaS platform empowering autonomous cloud kitchens, flagship table hubs, and enterprise fleets with real-time socket syncing.
          </motion.p>

          {/* Search + Primary Navigation Triggers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="relative flex items-center group">
              <Search className="absolute left-6 text-text-muted transition-colors group-focus-within:text-primary" size={20} />
              <input 
                type="text"
                placeholder="Search active kitchens, tenant domains, or distinct specialty cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-full py-5 pl-16 pr-36 outline-none transition-all text-sm font-medium backdrop-blur-2xl focus:bg-white/[0.06] shadow-2xl"
                style={{ borderColor: searchTerm ? primary : 'rgba(255,255,255,0.1)' }}
              />
              <button 
                onClick={() => {
                  const el = document.getElementById('tenant-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute right-2 px-6 py-3 rounded-full text-black text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 flex items-center gap-1"
                style={{ backgroundColor: primary }}
              >
                <span>Browse</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Live Platform SLA Statistics Array */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto pt-6 border-t border-white/5"
          >
            {[
              { icon: Server, label: "Infrastructure Uptime", val: "99.99%", desc: "Multi-Region Cloud Containers" },
              { icon: Zap, label: "Event Loops Sync", val: "< 12ms", desc: "Bi-Directional Socket Pipeline" },
              { icon: Layers, label: "Tenant Partitioning", val: "Isolated", desc: "Mongoose Document Enforced" },
              { icon: ShieldCheck, label: "Payment Ledger", val: "Instant", desc: "Dynamic Automated UPI Hooks" }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass p-5 rounded-3xl border border-white/5 text-left relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-white/5 text-primary border border-white/5">
                      <Icon size={18} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-playfair font-black text-white group-hover:text-primary transition-colors">{stat.val}</p>
                  <p className="text-[10px] text-text-muted mt-1 font-medium">{stat.desc}</p>
                </div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ── Enterprise Value Matrix Section ── */}
      <section className="relative py-20 px-6 z-10 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">Engineered For Reliability</h2>
            <h3 className="text-3xl md:text-4xl font-playfair font-bold text-white">Enterprise Modules &amp; Capabilities</h3>
            <p className="text-text-muted text-sm mt-3">High-performance micro-architecture standard across all onboarded restaurants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Dynamic Custom Storefronts",
                icon: Globe,
                desc: "Instant isolated multi-tenant mapping resolving completely customized dynamic CSS color variables and local banner imagery instantly."
              },
              {
                title: "Live Sockets Synchronization",
                icon: Cpu,
                desc: "Continuous low-latency WebSockets pipelines pushing instant order status progressions, active table tracking, and live kitchen monitor updates."
              },
              {
                title: "Instant Secure Checkouts",
                icon: Smartphone,
                desc: "Embedded custom dynamic UPI QR generation logic enforcing accurate token validation before marking global fulfillment statuses."
              }
            ].map((mod, index) => {
              const MIcon = mod.icon;
              return (
                <div key={index} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative group hover:bg-white/[0.04] transition-all duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <MIcon size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>{mod.title}</span>
                    <CheckCircle2 size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-text-muted text-xs leading-relaxed font-light">{mod.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Live Multi-Tenant Storefront Ecosystem ── */}
      <section id="tenant-grid" className="relative py-20 px-6 z-10 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">ACTIVE PROVISIONS</span>
              </div>
              <h2 className="text-4xl font-playfair font-bold text-white tracking-tight">Onboarded Kitchens &amp; Outlets</h2>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-xl">
              {['All', 'Fine Dining', 'Quick Service', 'Cloud Kitchens'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className="px-5 py-2 rounded-full text-xs font-bold transition-all"
                  style={{ 
                    backgroundColor: selectedCategory === cat ? primary : 'transparent',
                    color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredRestaurants.map((res, idx) => (
                <motion.div
                  key={res.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="group h-full"
                >
                  <Link to={`/${res.slug}`} className="block h-full">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 h-full group-hover:bg-white/[0.05] group-hover:-translate-y-2 group-hover:border-primary/40 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col relative">
                      
                      {/* Operational Engine Ribbon overlay */}
                      <div className="absolute top-4 right-4 z-20">
                        <span className="glass px-3 py-1 rounded-full border border-white/10 text-[9px] font-black tracking-widest text-emerald-400 uppercase backdrop-blur-xl shadow-2xl flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ONLINE
                        </span>
                      </div>

                      {/* Image Frame */}
                      <div className="aspect-[16/10] relative overflow-hidden m-3 rounded-[2rem]">
                        {res.logo ? (
                          <img 
                            src={res.logo.startsWith('http') ? res.logo : `${import.meta.env.VITE_API_URL || ''}${res.logo}`} 
                            alt={res.businessName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              // fallback
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}

                        {/* Fallback pattern if logo fails or empty */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.01] flex items-center justify-center -z-10">
                          <Utensils size={40} className="text-white/10" />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                        
                        {/* Title Overlay inside Image frame */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                            {res.businessType ? res.businessType.replace('_', ' ') : 'PREMIUM OUTLET'}
                          </p>
                          <h3 className="text-2xl font-playfair font-bold text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                            {res.businessName}
                          </h3>
                        </div>
                      </div>

                      {/* Card Analytics Area */}
                      <div className="p-6 pt-3 flex-1 flex flex-col justify-between">
                        
                        <div className="flex items-center justify-between py-3 border-b border-white/5 mb-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary/60" />
                            <span>Instant Setup</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star size={14} className="text-primary fill-primary" />
                            <span className="text-white font-bold">4.9 SLA</span>
                          </span>
                        </div>

                        {/* Action execution */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-mono">
                            <span className="text-primary">🔗</span>
                            <span>/{res.slug}</span>
                          </div>
                          
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-black transition-all">
                            <ArrowUpRight size={16} />
                          </div>
                        </div>

                      </div>

                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty search catch */}
          {filteredRestaurants.length === 0 && (
            <div className="py-32 text-center glass rounded-3xl border border-white/5 max-w-2xl mx-auto mt-8">
              <Layers size={48} className="mx-auto text-white/20 mb-4" />
              <p className="text-white font-playfair italic text-xl mb-1">No operational partitions detected</p>
              <p className="text-xs text-text-muted">Adjust filters or search parameters to view provisioned store layers.</p>
            </div>
          )}

        </div>
      </section>

      {/* ── Enterprise Footer ── */}
      <footer className="py-16 px-6 border-t border-white/5 z-10 relative transition-colors duration-500 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Utensils size={18} />
              </div>
              <span className="text-xl font-playfair font-black text-white tracking-tight">{platform?.brandName || 'DineSync'}</span>
            </div>
            <p className="text-text-muted text-xs max-w-sm">
              Advanced Multi-Tenant Cloud Operating System built for scalability, zero-trust token handshakes, and absolute fine dining excellence.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-bold text-text-muted">
            <a href="#" className="hover:text-white transition-colors">Architecture Logs</a>
            <a href="#" className="hover:text-white transition-colors">API References</a>
            <a href="#" className="hover:text-white transition-colors">SLA Audits</a>
            <Link to="/super-admin/login" className="text-primary hover:underline">Platform Command Hub</Link>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">
              © 2026 {platform?.brandName || 'DineSync'} Systems.
            </p>
            <p className="text-[9px] text-text-muted/60 mt-1">Culinary Infrastructure Redefined.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default RestaurantList;
