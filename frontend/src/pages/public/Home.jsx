import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background with responsive scaling */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/0 via-bg-dark/50 to-bg-dark" />

      {/* Hero Content */}
      <div className="relative text-center px-6 max-w-5xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary mb-6 block">
            The Pinnacle of Gastronomy
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-playfair font-bold mb-8 leading-[0.9] tracking-tighter">
            Savor the Art <br className="hidden sm:block" /> of <span className="text-primary italic">Fine Dining</span>
          </h1>
          <p className="text-base md:text-xl text-text-muted mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            From vintage harvests to artisan culinary creations, experience a culinary journey 
            crafted with professional passion and premium seasonal ingredients.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link 
              to="/menu" 
              className="btn-primary w-full sm:w-auto px-10 py-5 rounded-2xl flex items-center justify-center gap-3 group"
            >
              <span className="text-[11px] font-black uppercase tracking-widest">Explore Menu</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/checkout" 
              className="w-full sm:w-auto px-10 py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all flex items-center justify-center gap-3 group"
            >
              <Calendar size={18} className="text-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest">Secure a Table</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-px h-20 bg-gradient-to-b from-primary/0 via-primary to-primary/0" />
      </motion.div>
    </section>
  );
};

export default Home;
