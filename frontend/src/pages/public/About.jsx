import React from 'react';
import { motion } from 'framer-motion';
import { Pizza, Flame, Clock, Award, Heart, Users, Leaf, ShoppingBag, Cake, MapPin } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import LocationMap from '../../components/common/LocationMap';

const BIZ_CONTENT = {
  RESTAURANT: {
    tag: 'Our Story', headline: 'Welcome to', sub: "Where every slice tells a story of tradition, quality, and passion.",
    mission: "At our restaurant, we believe that great food brings people together. Our mission is to serve authentic, delicious meals that create memorable moments for families, friends, and our entire community.",
    specialties: [
      { icon: Pizza,  title: 'Authentic Recipes',   desc: 'Traditional recipes crafted with love and expertise.' },
      { icon: Flame,  title: 'Wood-Fired Perfection',desc: 'Our signature oven creates the perfect crispy crust.' },
      { icon: Clock,  title: 'Fresh Daily',          desc: 'Hand-crafted fresh every morning.' },
      { icon: Award,  title: 'Premium Ingredients',  desc: 'Only the finest ingredients, always.' },
      { icon: Heart,  title: 'Made with Passion',    desc: 'Every dish crafted with dedication.' },
      { icon: Users,  title: 'Family Tradition',     desc: 'Serving our community with warmth.' },
    ],
  },
  HONEY_STORE: {
    tag: 'Pure & Natural', headline: 'About', sub: "Sourced from pristine forests, delivered pure to your door.",
    mission: "We believe nature's finest honey deserves to reach every home. Our mission is to source, test, and deliver 100% pure honey without additives or preservatives.",
    specialties: [
      { icon: Leaf,       title: 'Raw & Unfiltered',  desc: 'Straight from the hive, nothing added.' },
      { icon: Award,      title: 'Lab Tested',         desc: 'Every batch quality verified.' },
      { icon: Heart,      title: 'Natural Goodness',   desc: 'No preservatives, no additives.' },
      { icon: Clock,      title: 'Fresh Harvest',      desc: 'Seasonal honey at its best.' },
      { icon: Users,      title: 'Trusted by Families',desc: 'Thousands of happy customers.' },
      { icon: ShoppingBag,title: 'Pan India Delivery', desc: 'Fast and safe shipping.' },
    ],
  },
  BAKERY: {
    tag: 'Handcrafted', headline: 'About', sub: "Every item baked fresh with love every single morning.",
    mission: "We wake up early so you can enjoy the freshest baked goods. From artisan breads to celebration cakes, everything is made from scratch with premium ingredients.",
    specialties: [
      { icon: Cake,   title: 'Baked Fresh Daily',  desc: 'No day-old products, ever.' },
      { icon: Award,  title: 'Premium Ingredients',desc: 'Best flour, butter, and chocolate.' },
      { icon: Heart,  title: 'Made with Love',     desc: 'Every item crafted with care.' },
      { icon: Clock,  title: 'Same Day Orders',    desc: 'Order by noon, get today.' },
      { icon: Users,  title: 'Custom Orders',      desc: 'Personalized cakes for every occasion.' },
      { icon: Flame,  title: 'Traditional Recipes',desc: 'Time-tested baking methods.' },
    ],
  },
  GROCERY: {
    tag: 'Fresh & Affordable', headline: 'About', sub: "Quality groceries sourced directly from farms.",
    mission: "We connect farmers directly with consumers, ensuring fresh produce at fair prices. Our mission is to make quality groceries accessible to every household.",
    specialties: [
      { icon: Leaf,       title: 'Farm Fresh',       desc: 'Direct from farms to your door.' },
      { icon: Award,      title: 'Quality Assured',  desc: 'Handpicked and verified.' },
      { icon: Clock,      title: 'Fast Delivery',    desc: 'Same day delivery available.' },
      { icon: Heart,      title: 'Affordable Prices',desc: 'Best prices, no compromise.' },
      { icon: Users,      title: 'Community First',  desc: 'Supporting local farmers.' },
      { icon: ShoppingBag,title: 'Wide Selection',   desc: 'Everything you need, one place.' },
    ],
  },
};

const About = () => {
  const tenantCtx = useTenant?.();
  const tenant = tenantCtx?.tenant;
  const theme  = tenantCtx?.theme;

  const businessType = tenant?.businessType || 'RESTAURANT';
  const content = BIZ_CONTENT[businessType] || BIZ_CONTENT.RESTAURANT;
  const primary = theme?.primaryColor || '#c9a227';
  const bg      = theme?.backgroundColor || '#0f0f0f';
  const name    = tenant?.businessName || 'Pizza Kings';

  return (
    <div className="min-h-screen py-20 px-6" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center mb-20">
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-6 block" style={{ color: primary }}>
          {content.tag}
        </span>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-playfair font-bold mb-8 leading-tight">
          {content.headline} <span className="italic" style={{ color: primary }}>{name}</span>
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">{content.sub}</p>
      </motion.div>

      {/* Banner / Hero Image */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-5xl mx-auto mb-20 rounded-3xl overflow-hidden">
        <div className="relative h-[350px]" style={{ background: `linear-gradient(135deg, ${primary}20, ${bg})` }}>
          {tenant?.banner ? (
            <img src={tenant.banner} alt={name} className="w-full h-full object-cover opacity-70" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">
              {BIZ_CONTENT[businessType] ? { RESTAURANT:'🍕', HONEY_STORE:'🍯', BAKERY:'🎂', GROCERY:'🛒' }[businessType] : '🏪'}
            </div>
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${bg}, transparent)` }} />
        </div>
      </motion.div>

      {/* Specialties */}
      <div className="max-w-6xl mx-auto mb-20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl md:text-4xl font-playfair font-bold text-center mb-4">
          What Makes Us <span className="italic" style={{ color: primary }}>Special</span>
        </motion.h2>
        <p className="text-text-muted text-center mb-16 max-w-2xl mx-auto">Our commitment to excellence in every aspect</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.specialties.map((s, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ background: `${primary}15`, border: `1px solid ${primary}25` }}>
                <s.icon size={28} style={{ color: primary }} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{s.title}</h3>
              <p className="text-text-muted leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
        className="max-w-4xl mx-auto text-center glass p-12 rounded-3xl border border-white/10">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
          Our <span className="italic" style={{ color: primary }}>Mission</span>
        </h2>
        <p className="text-lg text-text-muted leading-relaxed">{content.mission}</p>
      </motion.div>

      {/* Visit Us Section (Map) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto mt-20 mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em]" style={{ color: primary }}>Visit Us</span>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold">Find Us in the <br/><span className="italic" style={{ color: primary }}>Heart of the City</span></h2>
            
            <div className="flex gap-4 items-start glass p-6 rounded-3xl border border-white/10 max-w-md">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${primary}20`, border: `1px solid ${primary}40` }}>
                <MapPin size={22} style={{ color: primary }} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Our Address</h4>
                <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
                  {tenant?.address || '123 Culinary street, \nGourmet District, \nNew Delhi 110001'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <LocationMap 
              lat={tenant?.location?.lat} 
              lng={tenant?.location?.lng} 
              businessName={name}
            />
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/5 ring-1 ring-inset ring-white/10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
